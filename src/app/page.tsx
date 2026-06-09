"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useSession } from "next-auth/react";
import { formatPrice } from "@/lib/utils";
import { 
  Scissors, 
  MapPin, 
  Phone, 
  Mail, 
  Star, 
  Clock, 
  CheckCircle, 
  Sparkles, 
  ShieldCheck, 
  Send 
} from "lucide-react";

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  category: string;
}

interface Barber {
  id: string;
  name: string;
  role: string;
  rating: number;
  bio: string;
  image: string;
  status: string;
}

interface DBComment {
  id: string;
  comment: string;
  rating: number;
  createdAt: string;
  user: { name: string; image: string | null };
}

export default function Home() {
  const { data: session } = useSession();
  const [services, setServices] = useState<Service[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [dbComments, setDbComments] = useState<DBComment[]>([]);
  
  // Contact Form State
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // Comment Form State
  const [commentText, setCommentText] = useState("");
  const [commentRating, setCommentRating] = useState(5);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [commentSuccess, setCommentSuccess] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [sRes, bRes, cRes] = await Promise.all([
          fetch("/api/services"),
          fetch("/api/barbers"),
          fetch("/api/comments"),
        ]);
        setServices(await sRes.json());
        setBarbers(await bRes.json());
        setDbComments(await cRes.json());
      } catch (e) {
        console.error("Error fetching homepage data", e);
      }
    }
    fetchData();
  }, []);

  // Gallery Categories
  const galleryImages = [
    { url: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=500&q=80", title: "Corte Degradado Fino" },
    { url: "https://images.unsplash.com/photo-1598257006458-087169a1f08d?auto=format&fit=crop&w=500&q=80", title: "Estilo Pompadour de Lujo" },
    { url: "https://images.unsplash.com/photo-1512864084360-7c0c4d0a0845?auto=format&fit=crop&w=500&q=80", title: "Afeitado y Delineado Clásico" },
    { url: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=500&q=80", title: "Diseño de Barba Angular" },
    { url: "https://images.unsplash.com/photo-1517832606299-7ae9b720a186?auto=format&fit=crop&w=500&q=80", title: "Peinado Texturizado Moderno" },
    { url: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=500&q=80", title: "Tratamiento con Toallas Calientes" }
  ];

  // Fallback testimonials (shown when there are no DB comments)
  const fallbackTestimonials = [
    { name: "Juan Sebastián Ortiz", role: "Cliente Regular", text: "La mejor experiencia de barbería que he tenido. El nivel de detalle de Alexander es impecable, y el ambiente con whisky de cortesía y toallas calientes te hace sentir en un club exclusivo.", rating: 5 },
    { name: "Felipe Restrepo", role: "Emprendedor", text: "Mateo siempre logra el corte moderno perfecto. El sistema de reservas en línea es sumamente ágil y el servicio al cliente es de primer nivel. Altamente recomendado.", rating: 5 },
    { name: "Andrés Delgado", role: "Consultor de Negocios", text: "Marcus tiene una precisión insuperable delineando barbas. Llevo más de un año viniendo a Barber Studio y mantengo mi estilo impecable gracias a su dedicación.", rating: 5 },
  ];

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setIsSubmittingComment(true);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment: commentText, rating: commentRating }),
      });
      if (res.ok) {
        const newComment = await res.json();
        setDbComments((prev) => [newComment, ...prev]);
        setCommentText("");
        setCommentRating(5);
        setCommentSuccess(true);
        setTimeout(() => setCommentSuccess(false), 4000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setShowToast(true);
      setFormData({ name: "", email: "", message: "" });
      setTimeout(() => setShowToast(false), 4000);
    }, 1500);
  };

  const getBarberImage = (imageName: string) => {
    switch (imageName) {
      case "alexander-pierce":
        return "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=350&q=80";
      case "mateo-silva":
        return "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=350&q=80";
      case "marcus-vance":
        return "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=350&q=80";
      default:
        return "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=350&q=80";
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-matte-black text-white relative">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center pt-20 overflow-hidden">
        {/* Background Image Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center z-0 opacity-40 scale-105 transition-transform duration-1000"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1920&q=80')` }}
        />
        {/* Dark Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-matte-black via-matte-black/75 to-transparent z-10" />
        
        {/* Content */}
        <div className="relative z-20 max-w-5xl mx-auto px-4 text-center mt-8">
          <span className="inline-flex items-center space-x-2 bg-gold-500/10 border border-gold-500/30 text-gold-500 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-6 animate-pulse">
            <Sparkles className="h-3 w-3" />
            <span>Experiencia de Lujo Masculina</span>
          </span>
          <h1 className="font-heading text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
            ARTE, TRADICIÓN Y <br />
            <span className="text-gold-500 text-gold-gradient font-serif">ESTILO EXCLUSIVO</span>
          </h1>
          <p className="text-gray-300 text-base sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed font-light">
            En Barber Studio diseñamos más que cortes; esculpimos tu imagen. Descubre un santuario dedicado al caballero moderno donde el detalle lo es todo.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/reservar"
              className="w-full sm:w-auto bg-gradient-to-r from-gold-600 to-gold-400 hover:from-gold-500 hover:to-gold-300 text-black font-bold px-8 py-4 rounded-lg shadow-xl hover:shadow-gold-500/20 transition-all duration-300 transform hover:-translate-y-0.5 text-center uppercase tracking-wider text-sm"
            >
              Reservar Cita Online
            </Link>
            <Link
              href="/#servicios"
              className="w-full sm:w-auto bg-charcoal/80 hover:bg-charcoal border border-gray-800 hover:border-gold-500/30 text-white font-medium px-8 py-4 rounded-lg transition-all duration-300 text-center text-sm"
            >
              Ver Servicios
            </Link>
          </div>
        </div>
      </section>

      {/* Servicios Destacados */}
      <section id="servicios" className="py-24 bg-charcoal/20 relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-white">
              NUESTROS <span className="text-gold-500">SERVICIOS</span>
            </h2>
            <div className="h-1 w-20 bg-gold-500 mx-auto mb-6" />
            <p className="text-gray-400 font-light">
              Ofrecemos una gama curada de tratamientos premium para cabello, barba y cuidado facial. Todos nuestros servicios incluyen lavado con agua ionizada, toallas aromatizadas y bebida de cortesía.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => (
              <div 
                key={service.id}
                className="bg-charcoal border border-gray-800 rounded-xl p-6 flex flex-col justify-between hover:border-gold-500/30 transition-all duration-300 hover:shadow-2xl hover:shadow-gold-500/5 group"
              >
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <span className="p-3 bg-matte-black border border-gray-800/80 rounded-lg group-hover:border-gold-500/20 transition-colors">
                      <Scissors className="h-6 w-6 text-gold-500" />
                    </span>
                    <span className="text-gold-500 font-heading text-2xl font-bold">
                      {formatPrice(service.price)}
                    </span>
                  </div>
                  <h3 className="font-heading text-lg font-bold text-white mb-2 group-hover:text-gold-500 transition-colors">
                    {service.name}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed mb-6 font-light">
                    {service.description}
                  </p>
                </div>
                <div className="flex items-center justify-between border-t border-gray-800/80 pt-4 text-xs text-gray-500 font-medium">
                  <span className="flex items-center space-x-1.5">
                    <Clock className="h-4 w-4 text-gold-500/70" />
                    <span>{service.duration} Minutos</span>
                  </span>
                  <Link 
                    href={`/reservar?service=${service.id}`}
                    className="text-gold-500 hover:underline flex items-center space-x-1"
                  >
                    <span>Reservar</span>
                    <span>&rarr;</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sobre Nosotros */}
      <section id="sobre-nosotros" className="py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-gold-500 to-yellow-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />
              <div className="relative overflow-hidden rounded-xl aspect-[4/3] sm:aspect-[16/10] lg:aspect-square bg-charcoal">
                <img 
                  src="https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=800&q=80" 
                  alt="Ritual Barbería"
                  className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
                />
              </div>
            </div>

            <div className="space-y-6">
              <span className="text-gold-500 font-semibold uppercase tracking-wider text-sm flex items-center space-x-2">
                <span className="h-px w-6 bg-gold-500" />
                <span>Nuestra Filosofía</span>
              </span>
              <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
                MÁS QUE UN CORTE, <br />
                <span className="text-gold-500 text-gold-gradient font-serif">UN RITUAL DE IDENTIDAD</span>
              </h2>
              <p className="text-gray-300 font-light leading-relaxed">
                Fundado con el firme propósito de rescatar el ritual del cuidado masculino clásico e inyectarle las exigencias estilísticas modernas, Barber Studio es la respuesta para quienes no se conforman con lo ordinario.
              </p>
              <p className="text-gray-400 font-light leading-relaxed text-sm">
                Nuestras instalaciones han sido rigurosamente diseñadas para sumergirte en una atmósfera de comodidad y exclusividad. Disfruta de una selección premium de cafés, whiskies de malta única, mientras nuestros artesanos del cabello trabajan con la máxima precisión.
              </p>
              
              <div className="grid grid-cols-2 gap-6 pt-4">
                <div className="flex items-start space-x-3">
                  <ShieldCheck className="h-6 w-6 text-gold-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-white font-semibold text-sm">Artesanos Expertos</h4>
                    <p className="text-gray-400 text-xs mt-1">Barberos certificados con trayectoria internacional.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Sparkles className="h-6 w-6 text-gold-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-white font-semibold text-sm">Productos Premium</h4>
                    <p className="text-gray-400 text-xs mt-1">Geles, aceites y lociones 100% orgánicas.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Equipo de Barberos */}
      <section id="equipo" className="py-24 bg-charcoal/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-white">
              MAESTROS <span className="text-gold-500">ARTESANOS</span>
            </h2>
            <div className="h-1 w-20 bg-gold-500 mx-auto mb-6" />
            <p className="text-gray-400 font-light">
              Conoce a los profesionales de la tijera y la navaja listos para brindarte un servicio inigualable.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {barbers.map((barber) => (
              <div 
                key={barber.id}
                className="bg-charcoal border border-gray-800 rounded-xl overflow-hidden group hover:border-gold-500/20 transition-all duration-300"
              >
                <div className="relative aspect-[4/5] bg-matte-black overflow-hidden">
                  <img 
                    src={getBarberImage(barber.image)} 
                    alt={barber.name}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-transparent to-transparent opacity-90" />
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                    <span className="bg-gold-500/10 border border-gold-500/30 text-gold-500 px-3 py-1 rounded-full text-xs font-semibold">
                      {barber.role}
                    </span>
                    <div className="flex items-center space-x-1 text-gold-500 bg-matte-black/80 px-2 py-1 rounded-lg text-xs font-semibold">
                      <Star className="h-3 w-3 fill-current" />
                      <span>{barber.rating}</span>
                    </div>
                  </div>
                </div>
                <div className="p-6 space-y-3">
                  <h3 className="font-heading text-xl font-bold text-white group-hover:text-gold-500 transition-colors">
                    {barber.name}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed font-light">
                    {barber.bio}
                  </p>
                  <div className="pt-2">
                    <Link
                      href={`/reservar?barber=${barber.id}`}
                      className="inline-block text-xs font-semibold text-gold-500 border border-gold-500/30 hover:border-gold-500 hover:bg-gold-500 hover:text-black px-4 py-2 rounded-lg transition-all duration-300"
                    >
                      Reservar con {barber.name.split(" ")[0]}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Galería de Trabajos */}
      <section id="galeria" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-white">
              GALERÍA DE <span className="text-gold-500">ESTILOS</span>
            </h2>
            <div className="h-1 w-20 bg-gold-500 mx-auto mb-6" />
            <p className="text-gray-400 font-light">
              Muestra visual del nivel de detalle y precisión de los cortes realizados en nuestro estudio.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {galleryImages.map((img, idx) => (
              <div 
                key={idx} 
                className="relative overflow-hidden rounded-xl aspect-square group bg-charcoal border border-gray-800"
              >
                <img 
                  src={img.url} 
                  alt={img.title}
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6 z-10" />
                <div className="absolute bottom-4 left-4 right-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-20">
                  <h4 className="font-heading text-white text-base font-bold">{img.title}</h4>
                  <p className="text-gold-500 text-xs mt-1">Realizado en Barber Studio</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonios */}
      <section id="testimonios" className="py-24 bg-charcoal/20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-white">
              LO QUE DICEN NUESTROS <span className="text-gold-500">CLIENTES</span>
            </h2>
            <div className="h-1 w-20 bg-gold-500 mx-auto mb-6" />
          </div>

          {/* Real DB Comments */}
          {dbComments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              {dbComments.slice(0, 6).map((com) => (
                <div
                  key={com.id}
                  className="bg-charcoal border border-gray-800 rounded-xl p-8 flex flex-col justify-between hover:border-gold-500/20 transition-all duration-300"
                >
                  <div className="space-y-4">
                    <div className="flex space-x-1 text-gold-500">
                      {[...Array(com.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-current" />
                      ))}
                    </div>
                    <p className="text-gray-300 text-sm italic leading-relaxed font-light">
                      &ldquo;{com.comment}&rdquo;
                    </p>
                  </div>
                  <div className="flex items-center space-x-3 pt-6 border-t border-gray-850 mt-6">
                    <div className="h-10 w-10 rounded-full bg-gold-500/10 flex items-center justify-center font-heading font-bold text-gold-500 text-sm border border-gold-500/25">
                      {com.user?.name?.[0] || "?"}
                    </div>
                    <div>
                      <h4 className="text-white font-semibold text-sm">{com.user?.name || "Anónimo"}</h4>
                      <p className="text-gray-500 text-xs">{new Date(com.createdAt).toLocaleDateString("es-ES")}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              {fallbackTestimonials.map((test, idx) => (
                <div
                  key={idx}
                  className="bg-charcoal border border-gray-800 rounded-xl p-8 flex flex-col justify-between hover:border-gold-500/20 transition-all duration-300"
                >
                  <div className="space-y-4">
                    <div className="flex space-x-1 text-gold-500">
                      {[...Array(test.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-current" />
                      ))}
                    </div>
                    <p className="text-gray-300 text-sm italic leading-relaxed font-light">
                      &ldquo;{test.text}&rdquo;
                    </p>
                  </div>
                  <div className="flex items-center space-x-3 pt-6 border-t border-gray-850 mt-6">
                    <div className="h-10 w-10 rounded-full bg-gold-500/10 flex items-center justify-center font-heading font-bold text-gold-500 text-sm border border-gold-500/25">
                      {test.name[0]}
                    </div>
                    <div>
                      <h4 className="text-white font-semibold text-sm">{test.name}</h4>
                      <p className="text-gray-500 text-xs">{test.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Comment Form — solo para usuarios autenticados */}
          {session?.user ? (
            <div className="max-w-2xl mx-auto bg-charcoal border border-gray-800 rounded-2xl p-8">
              <h3 className="font-heading text-xl font-bold text-white mb-2">Deja tu Opinión</h3>
              <p className="text-gray-400 text-sm font-light mb-6">Comparte tu experiencia en Barber Studio, {session.user.name?.split(" ")[0]}.</p>
              
              {commentSuccess && (
                <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-3 rounded-lg text-sm mb-4 flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>¡Comentario publicado exitosamente!</span>
                </div>
              )}

              <form onSubmit={handleCommentSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs uppercase text-gray-400 font-semibold tracking-wider">Calificación</label>
                  <div className="flex space-x-2">
                    {[1, 2, 3, 4, 5].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setCommentRating(val)}
                        className="cursor-pointer transition-transform hover:scale-110"
                      >
                        <Star className={`h-7 w-7 ${val <= commentRating ? "text-gold-500 fill-gold-500" : "text-gray-600"}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs uppercase text-gray-400 font-semibold tracking-wider">Tu Comentario</label>
                  <textarea
                    required
                    rows={3}
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="w-full bg-matte-black border border-gray-800 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-gold-500/50 transition-all font-light resize-none"
                    placeholder="Cuéntanos sobre tu experiencia..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingComment}
                  className="bg-gradient-to-r from-gold-600 to-gold-400 hover:from-gold-500 text-black font-semibold py-3 px-8 rounded-lg shadow-lg transition-all text-sm uppercase tracking-wider disabled:opacity-50 flex items-center space-x-2 cursor-pointer"
                >
                  <Send className="h-4 w-4" />
                  <span>{isSubmittingComment ? "Enviando..." : "Publicar Comentario"}</span>
                </button>
              </form>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-gray-500 text-sm">Inicia sesión para dejar tu comentario.</p>
            </div>
          )}
        </div>
      </section>

      {/* Contacto & Ubicación */}
      <section id="contacto" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            
            {/* Contact Details */}
            <div className="space-y-8">
              <div>
                <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-white">
                  CONTÁCTANOS
                </h2>
                <div className="h-1 w-20 bg-gold-500 mb-6" />
                <p className="text-gray-400 font-light leading-relaxed">
                  ¿Tienes alguna duda sobre nuestros servicios, eventos corporativos o reservas especiales? Escríbenos y nuestro conserje te atenderá de inmediato.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-charcoal border border-gray-800 rounded-lg text-gold-500 mt-0.5">
                    <MapPin className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold text-sm uppercase">Nuestra Dirección</h4>
                    <p className="text-gray-400 text-sm mt-1">Av. del Lujo 777, Barber District, Ciudad Alta</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-charcoal border border-gray-800 rounded-lg text-gold-500 mt-0.5">
                    <Phone className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold text-sm uppercase">Teléfono de Reservas</h4>
                    <p className="text-gray-400 text-sm mt-1">+57 (300) 123-4567</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-charcoal border border-gray-800 rounded-lg text-gold-500 mt-0.5">
                    <Mail className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold text-sm uppercase">Correo Electrónico</h4>
                    <p className="text-gray-400 text-sm mt-1">contacto@barberstudio.com</p>
                  </div>
                </div>
              </div>

              {/* Map Simulator */}
              <div className="relative rounded-xl overflow-hidden border border-gray-800 aspect-[2/1] bg-charcoal group">
                <div 
                  className="absolute inset-0 bg-cover bg-center filter grayscale contrast-125 opacity-70 group-hover:scale-105 group-hover:opacity-85 transition-all duration-700" 
                  style={{ backgroundImage: `url('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=600&q=80')` }}
                />
                <div className="absolute inset-0 bg-black/40 z-10" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 z-20">
                  <div className="p-2.5 bg-matte-black/90 border border-gold-500/40 rounded-full text-gold-500 mb-2 animate-bounce">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <span className="text-white font-bold text-xs uppercase tracking-widest bg-matte-black/95 px-3 py-1.5 rounded-lg border border-gray-800">
                    Av. del Lujo 777, Barber District
                  </span>
                </div>
              </div>
            </div>

            {/* Form & Toast */}
            <div className="bg-charcoal border border-gray-800 rounded-xl p-8 relative flex flex-col justify-between">
              <form onSubmit={handleContactSubmit} className="space-y-6">
                <h3 className="font-heading text-2xl font-bold text-white mb-6">
                  Enviar Mensaje
                </h3>

                <div className="space-y-2">
                  <label htmlFor="contact-name" className="text-xs uppercase text-gray-400 font-semibold tracking-wider block">
                    Nombre Completo
                  </label>
                  <input 
                    type="text"
                    id="contact-name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-matte-black border border-gray-800 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-gold-500/50 transition-all font-light"
                    placeholder="Ej. Andrés Robles"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="contact-email" className="text-xs uppercase text-gray-400 font-semibold tracking-wider block">
                    Correo Electrónico
                  </label>
                  <input 
                    type="email"
                    id="contact-email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-matte-black border border-gray-800 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-gold-500/50 transition-all font-light"
                    placeholder="Ej. andres@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="contact-message" className="text-xs uppercase text-gray-400 font-semibold tracking-wider block">
                    Mensaje
                  </label>
                  <textarea 
                    id="contact-message"
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full bg-matte-black border border-gray-800 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-gold-500/50 transition-all font-light resize-none"
                    placeholder="Cuéntanos cómo podemos ayudarte..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-gold-600 to-gold-400 hover:from-gold-500 hover:to-gold-300 text-black font-semibold py-3.5 rounded-lg shadow-lg hover:shadow-gold-500/10 transition-all duration-300 flex items-center justify-center space-x-2 text-sm uppercase tracking-wider cursor-pointer"
                >
                  {isSubmitting ? (
                    <div className="h-5 w-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>Enviar Mensaje</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-charcoal border border-gold-500/40 text-white rounded-xl shadow-2xl p-4 flex items-center space-x-3 animate-fade-in max-w-sm">
          <div className="p-2 bg-gold-500/10 rounded-lg text-gold-500">
            <CheckCircle className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-heading font-bold text-sm">¡Mensaje Enviado!</h4>
            <p className="text-xs text-gray-400 mt-0.5">Hemos recibido tu mensaje. Nos comunicaremos contigo en breve.</p>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
