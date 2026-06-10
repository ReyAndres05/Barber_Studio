"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Scissors, ShieldAlert, CheckCircle } from "lucide-react";

export default function AdminChangePasswordPage() {
  const { data: session, status } = useSession();
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();

  useEffect(() => {
    // Redirigir a login si no está autenticado, o a la home si no es admin
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated" && session?.user?.role !== "admin") {
      router.push("/");
    }
  }, [status, session, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (newPassword.length < 8) {
      setError("La nueva contraseña debe tener al menos 8 caracteres");
      setLoading(false);
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setError("Las contraseñas no coinciden");
      setLoading(false);
      return;
    }

    if (newPassword === "Admin123*") {
      setError("No puedes volver a usar la contraseña temporal por defecto");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword, confirmNewPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Ocurrió un error al cambiar la contraseña");
        setLoading(false);
      } else {
        setSuccess(data.message || "Contraseña cambiada exitosamente.");
        setLoading(false);
        // Redirigir al admin dashboard tras 2 segundos
        setTimeout(() => {
          router.push("/admin/dashboard");
        }, 2000);
      }
    } catch (err) {
      console.error(err);
      setError("Fallo al conectar con el servidor.");
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-matte-black text-white">
        <div className="h-10 w-10 border-4 border-gold-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-matte-black text-white relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gold-500/10 via-matte-black to-charcoal/90 z-0 pointer-events-none" />

      <div className="z-10 w-full max-w-md p-8 bg-charcoal border border-gray-800 rounded-2xl shadow-2xl animate-fade-in my-8">
        <div className="flex flex-col items-center mb-6">
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-full mb-3 text-red-500">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h1 className="font-heading text-xl font-bold uppercase tracking-widest text-center">
            Cambio Obligatorio
          </h1>
          <p className="text-gray-400 text-xs font-light mt-1 text-center max-w-xs">
            Por motivos de seguridad, debes cambiar la contraseña temporal del administrador antes de continuar.
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-500 p-3 rounded-lg text-sm text-center mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-500/10 border border-green-500/30 text-green-400 p-3 rounded-lg text-sm text-center mb-4 flex items-center justify-center space-x-2">
            <CheckCircle className="w-4 h-4" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] uppercase text-gray-400 font-semibold tracking-wider block">
              Nueva Contraseña
            </label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-matte-black border border-gray-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-gold-500/50 transition-all font-light"
              placeholder="Mínimo 8 caracteres"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase text-gray-400 font-semibold tracking-wider block">
              Confirmar Nueva Contraseña
            </label>
            <input
              type="password"
              required
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              className="w-full bg-matte-black border border-gray-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-gold-500/50 transition-all font-light"
              placeholder="Confirma tu contraseña"
            />
          </div>

          <button
            type="submit"
            disabled={loading || success !== ""}
            className="w-full bg-gradient-to-r from-red-600 to-red-400 hover:from-red-500 text-white font-bold py-3 rounded-lg shadow-xl uppercase tracking-widest disabled:opacity-50 transition-all text-xs cursor-pointer"
          >
            {loading ? "Actualizando contraseña..." : "Actualizar Contraseña"}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-gray-500">
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="hover:text-red-400 transition-colors text-gray-500"
          >
            Cancelar y salir
          </button>
        </div>
      </div>
    </div>
  );
}
