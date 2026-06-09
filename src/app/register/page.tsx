"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Scissors, ArrowLeft, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, password, confirmPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Ocurrió un error en el registro");
        setLoading(false);
      } else {
        setSuccess(data.message || "Cuenta creada exitosamente. Ya puedes iniciar sesión.");
        setLoading(false);
        // Redirigir automáticamente tras 3 segundos
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      }
    } catch (err) {
      console.error(err);
      setError("Fallo al conectar con el servidor.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-matte-black text-white relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gold-500/10 via-matte-black to-charcoal/90 z-0 pointer-events-none" />

      <div className="z-10 w-full max-w-md p-8 bg-charcoal border border-gray-800 rounded-2xl shadow-2xl animate-fade-in my-8">
        <div className="flex flex-col items-center mb-6">
          <Link href="/" className="p-3 bg-gold-500/10 rounded-full mb-3">
            <Scissors className="w-8 h-8 text-gold-500" />
          </Link>
          <h1 className="font-heading text-2xl font-bold uppercase tracking-widest text-center">
            Crear Cuenta
          </h1>
          <p className="text-gray-400 text-sm font-light mt-1 text-center">
            Únete a Barber Studio
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
              Nombre Completo
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-matte-black border border-gray-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-gold-500/50 transition-all font-light"
              placeholder="Andrés Robles"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase text-gray-400 font-semibold tracking-wider block">
              Correo Electrónico
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-matte-black border border-gray-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-gold-500/50 transition-all font-light"
              placeholder="tu@correo.com"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase text-gray-400 font-semibold tracking-wider block">
              Teléfono
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-matte-black border border-gray-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-gold-500/50 transition-all font-light"
              placeholder="3001234567"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase text-gray-400 font-semibold tracking-wider block">
              Contraseña
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-matte-black border border-gray-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-gold-500/50 transition-all font-light"
              placeholder="Mínimo 8 caracteres"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase text-gray-400 font-semibold tracking-wider block">
              Confirmar Contraseña
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-matte-black border border-gray-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-gold-500/50 transition-all font-light"
              placeholder="Repite tu contraseña"
            />
          </div>

          <button
            type="submit"
            disabled={loading || success !== ""}
            className="w-full bg-gradient-to-r from-gold-600 to-gold-400 hover:from-gold-500 text-black font-bold py-3 rounded-lg shadow-xl uppercase tracking-widest disabled:opacity-50 transition-all text-xs cursor-pointer"
          >
            {loading ? "Creando cuenta..." : "Crear Cuenta"}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-gray-500 flex flex-col space-y-2">
          <Link href="/login" className="hover:text-gold-500 transition-colors">
            ¿Ya tienes cuenta? Iniciar Sesión
          </Link>
          <Link href="/" className="hover:text-gold-500 transition-colors flex items-center justify-center space-x-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver al inicio</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
