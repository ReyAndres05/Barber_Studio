"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/utils";
import {
  BarChart3,
  Calendar,
  Scissors,
  Users,
  UserCheck,
  DollarSign,
  TrendingUp,
  CheckCircle,
  Check,
  X,
  MessageSquare,
  LogOut,
  Star,
} from "lucide-react";

interface Reservation {
  id: string;
  userId: string;
  date: string;
  time: string;
  price: number;
  status: string;
  createdAt: string;
  user: { name: string; email: string };
  service: { name: string; price: number };
  barber: { name: string };
}

interface Comment {
  id: string;
  comment: string;
  rating: number;
  createdAt: string;
  user: { name: string; image: string | null };
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<"analytics" | "bookings" | "comments">("analytics");
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "authenticated" && session?.user?.role !== "admin") router.push("/");
  }, [status, session, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchData();
    }
  }, [status]);

  async function fetchData() {
    try {
      const [resR, comR] = await Promise.all([
        fetch("/api/reservations"),
        fetch("/api/comments"),
      ]);
      
      if (resR.ok) {
        const resData = await resR.json();
        if (Array.isArray(resData)) setReservations(resData);
      }
      if (comR.ok) {
        const comData = await comR.json();
        if (Array.isArray(comData)) setComments(comData);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4000);
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/reservations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setReservations((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
        );
        triggerToast(`Reserva actualizada a "${newStatus}".`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Analytics
  const totalRevenue = reservations
    .filter((r) => r.status === "completed")
    .reduce((acc, r) => acc + (r.price || 0), 0);
  const pendingBookings = reservations.filter((r) => r.status === "pending").length;
  const completedBookings = reservations.filter((r) => r.status === "completed").length;
  const avgRating = comments.length > 0
    ? (comments.reduce((a, c) => a + c.rating, 0) / comments.length).toFixed(1)
    : "—";

  const formatDate = (dateStr: string) => {
    const [, month, day] = dateStr.split("-");
    const monthNames: Record<string, string> = { "05": "Mayo", "06": "Junio", "07": "Julio", "08": "Agosto" };
    return `${day} de ${monthNames[month] || month}, 2026`;
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-matte-black">
        <div className="h-10 w-10 border-4 border-gold-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-matte-black text-white flex flex-col">
      {/* Admin Top Header */}
      <header className="h-20 border-b border-gold-500/10 glass-effect fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-6 sm:px-8">
        <div className="flex items-center space-x-2">
          <Link href="/" className="font-heading text-lg font-bold tracking-wider">
            BARBER <span className="text-gold-500">STUDIO</span>
          </Link>
          <span className="text-[10px] bg-gold-500/10 text-gold-500 border border-gold-500/25 px-2.5 py-0.5 rounded-full uppercase tracking-wider font-semibold">
            Panel Admin
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <div className="hidden sm:block text-right">
            <p className="text-xs font-semibold text-white">{session?.user?.name}</p>
            <p className="text-[10px] text-gray-500 font-light">{session?.user?.email}</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="text-xs text-red-400 border border-red-500/20 hover:bg-red-500 hover:text-white px-4 py-2 rounded-lg font-semibold uppercase tracking-wider transition-all flex items-center space-x-1"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Salir</span>
          </button>
        </div>
      </header>

      <div className="flex-1 pt-20 flex flex-col lg:flex-row min-h-screen">
        {/* Left Sidebar */}
        <aside className="w-full lg:w-64 border-r border-gray-800 bg-charcoal/40 p-6 space-y-6 lg:fixed lg:top-20 lg:bottom-0 lg:left-0 z-30">
          <nav className="flex flex-row lg:flex-col flex-wrap gap-2 lg:space-y-2">
            {[
              { id: "analytics", name: "Estadísticas", icon: BarChart3 },
              { id: "bookings", name: "Reservas", icon: Calendar },
              { id: "comments", name: "Comentarios", icon: MessageSquare },
            ].map((menu) => {
              const Icon = menu.icon;
              const isActive = activeTab === menu.id;
              return (
                <button
                  key={menu.id}
                  onClick={() => setActiveTab(menu.id as any)}
                  className={`px-4 py-3 rounded-lg text-xs font-semibold uppercase tracking-wider flex items-center space-x-3 transition-all cursor-pointer ${
                    isActive
                      ? "bg-gold-500 text-black font-bold shadow-md"
                      : "bg-matte-black border border-gray-800 text-gray-400 hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{menu.name}</span>
                </button>
              );
            })}

            <div className="border-t border-gray-800 pt-4 mt-4">
              <Link
                href="/"
                className="px-4 py-3 rounded-lg text-xs font-semibold uppercase tracking-wider flex items-center space-x-3 bg-matte-black border border-gray-800 text-gray-400 hover:text-gold-500 hover:border-gold-500/30 transition-all"
              >
                <span>← Ir a Web Principal</span>
              </Link>
            </div>
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1 lg:pl-64 p-6 sm:p-8 space-y-8 pb-16">
          {/* ANALYTICS */}
          {activeTab === "analytics" && (
            <div className="space-y-8 animate-fade-in">
              <div>
                <h2 className="font-heading text-2xl font-bold text-white">Resumen Administrativo</h2>
                <p className="text-gray-400 text-xs font-light mt-1">Datos del sistema en tiempo real.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { name: "Ingresos Totales", value: formatPrice(totalRevenue), desc: "Citas completadas", icon: DollarSign, color: "text-green-400" },
                  { name: "Citas Pendientes", value: pendingBookings, desc: "Por atender", icon: Calendar, color: "text-blue-400" },
                  { name: "Citas Completadas", value: completedBookings, desc: "Finalizadas", icon: CheckCircle, color: "text-gold-500" },
                  { name: "Rating Promedio", value: avgRating, desc: `${comments.length} comentarios`, icon: Star, color: "text-purple-400" },
                ].map((stat, idx) => {
                  const Icon = stat.icon;
                  return (
                    <div key={idx} className="bg-charcoal border border-gray-800 rounded-2xl p-6 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400 font-medium">{stat.name}</span>
                        <div className={`p-2 bg-matte-black/60 rounded-lg ${stat.color}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                      </div>
                      <div>
                        <h3 className="font-heading text-2xl font-bold text-white">{stat.value}</h3>
                        <p className="text-[10px] text-gray-500 font-light mt-1">{stat.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Revenue Bar Chart (SVG) */}
              <div className="bg-charcoal border border-gray-800 rounded-2xl p-6">
                <h3 className="font-heading text-sm font-bold text-white uppercase tracking-wider border-b border-gray-800 pb-3 mb-6 flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-gold-500" />
                  <span>Tendencia de Reservas</span>
                </h3>
                <div className="w-full aspect-[3/1] relative">
                  <svg viewBox="0 0 500 200" className="w-full h-full">
                    <line x1="40" y1="20" x2="480" y2="20" stroke="#1e1e1e" strokeWidth="1" strokeDasharray="4" />
                    <line x1="40" y1="70" x2="480" y2="70" stroke="#1e1e1e" strokeWidth="1" strokeDasharray="4" />
                    <line x1="40" y1="120" x2="480" y2="120" stroke="#1e1e1e" strokeWidth="1" strokeDasharray="4" />
                    <line x1="40" y1="170" x2="480" y2="170" stroke="#2a2a2a" strokeWidth="1" />
                    <path d="M 60,170 C 120,150 180,110 240,75 C 305,95 380,50 460,25" fill="none" stroke="#d4af37" strokeWidth="3.5" strokeLinecap="round" />
                    <path d="M 60,170 C 120,150 180,110 240,75 C 305,95 380,50 460,25 L 460,170 L 60,170 Z" fill="url(#gold-gradient-admin)" opacity="0.1" />
                    <defs>
                      <linearGradient id="gold-gradient-admin" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#d4af37" />
                        <stop offset="100%" stopColor="#d4af37" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <circle cx="60" cy="170" r="4.5" fill="#121212" stroke="#d4af37" strokeWidth="2.5" />
                    <circle cx="240" cy="75" r="4.5" fill="#121212" stroke="#d4af37" strokeWidth="2.5" />
                    <circle cx="460" cy="25" r="4.5" fill="#121212" stroke="#d4af37" strokeWidth="2.5" />
                    <text x="60" y="192" fill="#757575" fontSize="10" textAnchor="middle" fontWeight="bold">Ene</text>
                    <text x="240" y="192" fill="#757575" fontSize="10" textAnchor="middle" fontWeight="bold">Mar</text>
                    <text x="460" y="192" fill="#d4af37" fontSize="10" textAnchor="middle" fontWeight="bold">Junio</text>
                  </svg>
                </div>
              </div>
            </div>
          )}

          {/* BOOKINGS */}
          {activeTab === "bookings" && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="font-heading text-2xl font-bold text-white">Gestión de Reservas</h2>
                <p className="text-gray-400 text-xs font-light mt-1">
                  {reservations.length} reservas totales en el sistema.
                </p>
              </div>

              <div className="bg-charcoal border border-gray-800 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-800 text-[10px] text-gray-500 uppercase tracking-widest bg-matte-black/40">
                        <th className="py-4 px-6 font-semibold">Cliente</th>
                        <th className="py-4 px-6 font-semibold">Servicio</th>
                        <th className="py-4 px-6 font-semibold">Barbero</th>
                        <th className="py-4 px-6 font-semibold">Fecha / Hora</th>
                        <th className="py-4 px-6 font-semibold">Precio</th>
                        <th className="py-4 px-6 font-semibold">Estado</th>
                        <th className="py-4 px-6 font-semibold text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800/50 text-xs">
                      {reservations.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-12 text-center text-gray-500">
                            No hay reservas registradas todavía.
                          </td>
                        </tr>
                      ) : (
                        reservations.map((apt) => (
                          <tr key={apt.id} className="hover:bg-matte-black/10 transition-colors">
                            <td className="py-4 px-6">
                              <p className="font-semibold text-white">{apt.user?.name || "—"}</p>
                              <p className="text-[10px] text-gray-500">{apt.user?.email}</p>
                            </td>
                            <td className="py-4 px-6 text-white font-medium">{apt.service?.name || "—"}</td>
                            <td className="py-4 px-6 text-gray-300">{apt.barber?.name || "—"}</td>
                            <td className="py-4 px-6 text-gray-400">
                              <p>{formatDate(apt.date)}</p>
                              <p className="text-[10px] text-gray-500 font-semibold mt-0.5">{apt.time} hs</p>
                            </td>
                            <td className="py-4 px-6 text-gold-500 font-semibold">{formatPrice(apt.price)}</td>
                            <td className="py-4 px-6">
                              <span
                                className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                                  apt.status === "completed"
                                    ? "bg-green-500/10 text-green-400 border border-green-500/20"
                                    : apt.status === "cancelled"
                                    ? "bg-red-500/10 text-red-400 border border-red-500/20"
                                    : "bg-gold-500/10 text-gold-500 border border-gold-500/20"
                                }`}
                              >
                                {apt.status === "completed" && "Completado"}
                                {apt.status === "cancelled" && "Cancelado"}
                                {apt.status === "pending" && "Pendiente"}
                                {apt.status === "confirmed" && "Confirmado"}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-right space-x-1.5 whitespace-nowrap">
                              {apt.status !== "completed" && apt.status !== "cancelled" && (
                                <>
                                  <button
                                    onClick={() => handleStatusChange(apt.id, "completed")}
                                    title="Completar"
                                    className="p-1.5 bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg hover:bg-green-500 hover:text-black transition-all cursor-pointer inline-block"
                                  >
                                    <Check className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => handleStatusChange(apt.id, "cancelled")}
                                    title="Cancelar"
                                    className="p-1.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition-all cursor-pointer inline-block"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                </>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* COMMENTS */}
          {activeTab === "comments" && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="font-heading text-2xl font-bold text-white">Comentarios de Clientes</h2>
                <p className="text-gray-400 text-xs font-light mt-1">
                  {comments.length} comentarios recibidos.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {comments.length === 0 ? (
                  <p className="text-gray-500 text-sm col-span-2">No hay comentarios todavía.</p>
                ) : (
                  comments.map((com) => (
                    <div key={com.id} className="bg-charcoal border border-gray-800 rounded-2xl p-6 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="h-8 w-8 rounded-full bg-gold-500/10 flex items-center justify-center font-heading font-bold text-gold-500 text-sm border border-gold-500/25">
                            {com.user?.name?.[0] || "?"}
                          </div>
                          <div>
                            <p className="text-white font-semibold text-sm">{com.user?.name || "Anónimo"}</p>
                            <p className="text-gray-500 text-[10px]">
                              {new Date(com.createdAt).toLocaleDateString("es-ES")}
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${
                                i < com.rating ? "text-gold-500 fill-gold-500" : "text-gray-600"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-300 text-sm italic font-light leading-relaxed">
                        &ldquo;{com.comment}&rdquo;
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-charcoal border border-gold-500/40 text-white rounded-xl shadow-2xl p-4 flex items-center space-x-3 animate-fade-in max-w-sm">
          <div className="p-2 bg-gold-500/10 rounded-lg text-gold-500">
            <CheckCircle className="h-5 w-5" />
          </div>
          <p className="text-xs font-semibold text-gray-200">{toastMessage}</p>
        </div>
      )}
    </div>
  );
}
