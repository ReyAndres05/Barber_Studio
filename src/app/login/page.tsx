"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Scissors } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (res?.error) {
      setError(res.error);
      setLoading(false);
    } else {
      // Importaremos getSession dinámicamente o de next-auth/react
      const { getSession } = await import("next-auth/react");
      const session = await getSession();

      if (session?.user?.needsPasswordChange) {
        router.push("/admin/change-password");
      } else if (session?.user?.role === "admin") {
        router.push("/admin/dashboard");
      } else {
        router.push("/profile");
      }
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-matte-black text-white relative overflow-hidden">

      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gold-500/10 via-matte-black to-charcoal/90 z-0 pointer-events-none" />

      <div className="z-10 w-full max-w-md p-8 bg-charcoal border border-gray-800 rounded-2xl shadow-2xl animate-fade-in">
        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="p-3 bg-gold-500/10 rounded-full mb-4">
            <Scissors className="w-8 h-8 text-gold-500" />
          </Link>
          <h1 className="font-heading text-2xl font-bold uppercase tracking-widest text-center">
            Iniciar Sesión
          </h1>
          <p className="text-gray-400 text-sm font-light mt-2 text-center">
            Accede a tu perfil de Barber Studio
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-500 p-3 rounded-lg text-sm text-center mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs uppercase text-gray-400 font-semibold tracking-wider">
              Correo Electrónico
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-matte-black border border-gray-800 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-gold-500/50 transition-all font-light"
              placeholder="tu@correo.com"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase text-gray-400 font-semibold tracking-wider">
              Contraseña
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-matte-black border border-gray-800 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-gold-500/50 transition-all font-light"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-gold-600 to-gold-400 hover:from-gold-500 text-black font-bold py-3.5 rounded-lg shadow-xl uppercase tracking-widest disabled:opacity-50 transition-all"
          >
            {loading ? "Verificando..." : "Entrar"}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-gray-500 flex flex-col space-y-3">
          <Link href="/register" className="hover:text-gold-500 transition-colors font-medium">
            ¿No tienes cuenta? Crear cuenta
          </Link>
          <Link href="/" className="hover:text-gold-500 transition-colors">
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
