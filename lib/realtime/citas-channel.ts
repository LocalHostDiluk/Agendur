import type { QueryClient } from "@tanstack/react-query";
import type { RealtimeChannel, RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import * as Sentry from "@sentry/nextjs";
import { createClient } from "@/lib/supabase/client";

export interface CitasChannelOptions {
  onEvent?: (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => void;
}

export interface CitasRealtimeSubscription {
  channel: RealtimeChannel | null;
  unsubscribe: () => void;
}

export function initCitasRealtimeChannel(
  negocioId: string,
  queryClient: QueryClient,
  options?: CitasChannelOptions,
): CitasRealtimeSubscription {
  if (!negocioId?.trim()) {
    return { channel: null, unsubscribe: () => {} };
  }

  const supabase = createClient();
  const channel = supabase.channel(`negocio-citas-${negocioId}`);

  channel
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "citas",
        filter: `negocio_id=eq.${negocioId}`,
      },
      (payload) => {
        queryClient.invalidateQueries({ queryKey: ["negocio", "citas"] });
        options?.onEvent?.(payload);
      },
    )
    .subscribe((status) => {
      if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
        Sentry.captureMessage(`Supabase Realtime Channel Error: ${status}`, {
          extra: { negocioId, status },
        });
      }
    });

  return {
    channel,
    unsubscribe: () => {
      supabase.removeChannel(channel);
    },
  };
}
