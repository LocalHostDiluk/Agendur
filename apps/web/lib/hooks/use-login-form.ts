"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { notify } from "@/lib/utils/toast";

export function useLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("error") === "auth-code-error") {
      notify.error(
        "Enlace inválido o expirado",
        "El enlace de verificación ya no es válido o ha expirado. Por favor solicita uno nuevo o inicia sesión.",
      );
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || (!data.success && !data.ok)) {
        throw new Error(
          data.error || "Credenciales inválidas. Por favor intenta de nuevo.",
        );
      }

      notify.success("¡Bienvenido de nuevo!", "Sesión iniciada correctamente");
      router.push("/dashboard");
      router.refresh();
    } catch (err: unknown) {
      notify.error(err, "Error al iniciar sesión.");
      setLoading(false);
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    loading,
    handleSubmit,
  };
}
