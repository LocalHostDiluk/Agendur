/**
 * Módulo de Rate Limiting por IP para CitaSync.
 * Implementa el algoritmo Sliding Window con almacenamiento en memoria y auto-limpieza periódica.
 * Admite de forma transparente Upstash Redis si se configuran las variables de entorno:
 * UPSTASH_REDIS_REST_URL y UPSTASH_REDIS_REST_TOKEN.
 */

interface RateLimitOptions {
  limit: number; // Número máximo de peticiones permitidas en la ventana
  windowMs: number; // Duración de la ventana en milisegundos (ej. 60000 = 1 min)
  keyPrefix?: string; // Prefijo para aislar endpoints (ej. "auth:register")
}

interface RateLimitResult {
  success: boolean; // true si la petición está dentro del límite permitido
  limit: number;
  remaining: number;
  resetTime: number; // Timestamp en ms cuando expira la ventana
}

interface MemoryBucket {
  timestamps: number[];
}

// Almacén en memoria persistente durante el ciclo de vida del proceso Node/Bun
const memoryStore = new Map<string, MemoryBucket>();

// Limpieza periódica cada 5 minutos para evitar fugas de memoria (memory leak)
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, bucket] of memoryStore.entries()) {
      bucket.timestamps = bucket.timestamps.filter((ts) => now - ts < 3600000);
      if (bucket.timestamps.length === 0) {
        memoryStore.delete(key);
      }
    }
  }, 300000);
}

/**
 * Obtiene la dirección IP del cliente a partir de los encabezados HTTP comunes.
 */
export function getClientIp(request: Request): string {
  const headers = request.headers;

  const cfConnectingIp = headers.get("cf-connecting-ip");
  if (cfConnectingIp) return cfConnectingIp.trim();

  const realIp = headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) {
    const ip = forwardedFor.split(",")[0].trim();
    if (ip) return ip;
  }

  return "127.0.0.1";
}

/**
 * Verifica si la solicitud cumple las restricciones de Rate Limiting.
 */
export async function checkRateLimit(
  request: Request,
  options: RateLimitOptions,
): Promise<RateLimitResult> {
  const { limit, windowMs, keyPrefix = "global" } = options;
  const ip = getClientIp(request);
  const key = `${keyPrefix}:${ip}`;
  const now = Date.now();

  // Opción 1: Upstash Redis (si están configuradas las credenciales en producción)
  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (upstashUrl && upstashToken) {
    try {
      const response = await fetch(`${upstashUrl}/pipeline`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${upstashToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify([
          ["ZREMRANGEBYSCORE", key, 0, now - windowMs],
          ["ZCARD", key],
          ["ZADD", key, now, `${now}-${Math.random()}`],
          ["PEXPIRE", key, windowMs],
        ]),
      });

      if (response.ok) {
        const results = await response.json();
        const currentCount = (results[1]?.result ?? 0) as number;
        const success = currentCount < limit;
        const remaining = Math.max(0, limit - currentCount - 1);
        const resetTime = now + windowMs;

        return { success, limit, remaining, resetTime };
      }
    } catch {
      // Fallback a memoria si Upstash falla
    }
  }

  // Opción 2: Sliding Window en memoria (Zero-dependency / Desarrollo / Producción base)
  let bucket = memoryStore.get(key);
  if (!bucket) {
    bucket = { timestamps: [] };
    memoryStore.set(key, bucket);
  }

  // Descartar registros fuera de la ventana actual
  bucket.timestamps = bucket.timestamps.filter((ts) => now - ts < windowMs);

  if (bucket.timestamps.length >= limit) {
    const oldestTimestamp = bucket.timestamps[0] ?? now;
    const resetTime = oldestTimestamp + windowMs;

    return {
      success: false,
      limit,
      remaining: 0,
      resetTime,
    };
  }

  // Registrar la petición actual
  bucket.timestamps.push(now);

  return {
    success: true,
    limit,
    remaining: limit - bucket.timestamps.length,
    resetTime: now + windowMs,
  };
}
