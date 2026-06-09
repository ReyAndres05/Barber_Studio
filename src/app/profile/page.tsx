"use client";

import React, { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { User, Calendar, MessageSquare, LogOut, Settings, Star } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/utils";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/users/profile")
        .then((res) => res.json())
        .then((data) => {
          setProfile(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [status]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-matte-black text-white">
        <div className="h-10 w-10 border-4 border-gold-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) return null;

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
  };

  return (
    <div className="min-h-screen flex flex-col bg-matte-black text-white">
      <Navbar />
      <div className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-28">
        <h1 className="font-heading text-3xl font-bold mb-8 border-b border-gray-800 pb-4">Mi Perfil</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-charcoal border border-gray-800 rounded-2xl p-6 flex flex-col items-center">
              <div className="h-24 w-24 bg-gold-500/10 rounded-full flex items-center justify-center mb-4">
                <User className="h-10 w-10 text-gold-500" />
              </div>
              <h2 className="font-bold text-lg text-center">{profile.name}</h2>
              <p className="text-sm text-gray-400 mb-6">{profile.email}</p>
              
              <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-center space-x-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-semibold py-2.5 rounded-lg transition-colors border border-red-500/20"
              >
                <LogOut className="w-4 h-4" />
                <span>Cerrar Sesión</span>
              </button>
            </div>

            <div className="bg-charcoal border border-gray-800 rounded-2xl p-6">
              <h3 className="font-bold text-md mb-4 flex items-center space-x-2"><Settings className="w-4 h-4 text-gold-500"/><span>Información Personal</span></h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-500 text-xs uppercase">Teléfono</p>
                  <p className="text-gray-300">{profile.phone || "No especificado"}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase">Dirección</p>
                  <p className="text-gray-300">{profile.address || "No especificada"}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase">Rol</p>
                  <p className="text-gold-500 capitalize">{profile.role}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="md:col-span-2 space-y-8">
            
            {/* Reservas */}
            <div className="bg-charcoal border border-gray-800 rounded-2xl p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center space-x-2 border-b border-gray-800 pb-3">
                <Calendar className="w-5 h-5 text-gold-500"/>
                <span>Mis Reservas</span>
              </h3>
              
              <div className="space-y-4">
                {profile.reservations.length === 0 ? (
                  <p className="text-gray-500 text-sm">No tienes reservas registradas.</p>
                ) : (
                  profile.reservations.map((res: any) => (
                    <div key={res.id} className="border border-gray-800 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h4 className="font-bold text-white text-md">{res.service?.name}</h4>
                        <p className="text-gray-400 text-xs mt-1">Con {res.barber?.name}</p>
                        <p className="text-gray-500 text-xs mt-1 flex items-center"><Calendar className="w-3 h-3 mr-1"/> {res.date} a las {res.time}</p>
                      </div>
                      <div className="text-right">
                        <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-md ${
                          res.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' :
                          res.status === 'completed' ? 'bg-green-500/10 text-green-500' :
                          res.status === 'cancelled' ? 'bg-red-500/10 text-red-400' :
                          'bg-blue-500/10 text-blue-400'
                        }`}>
                          {res.status === 'pending' && 'Pendiente'}
                          {res.status === 'completed' && 'Completado'}
                          {res.status === 'cancelled' && 'Cancelado'}
                          {res.status === 'confirmed' && 'Confirmado'}
                        </span>
                        <p className="text-gold-500 font-bold mt-2">{formatPrice(res.price)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Comentarios */}
            <div className="bg-charcoal border border-gray-800 rounded-2xl p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center space-x-2 border-b border-gray-800 pb-3">
                <MessageSquare className="w-5 h-5 text-gold-500"/>
                <span>Historial de Comentarios</span>
              </h3>
              
              <div className="space-y-4">
                {profile.comments.length === 0 ? (
                  <p className="text-gray-500 text-sm">Aún no has escrito ningún comentario.</p>
                ) : (
                  profile.comments.map((com: any) => (
                    <div key={com.id} className="border border-gray-800 p-4 rounded-xl">
                      <div className="flex items-center space-x-1 mb-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < com.rating ? "text-gold-500 fill-gold-500" : "text-gray-600"}`} />
                        ))}
                      </div>
                      <p className="text-gray-300 text-sm">{com.comment}</p>
                      <p className="text-gray-500 text-xs mt-2">{new Date(com.createdAt).toLocaleDateString()}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
