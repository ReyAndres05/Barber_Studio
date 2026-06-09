"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useSession } from "next-auth/react";
import {
  Scissors,
  User,
  Calendar as CalendarIcon,
  Clock,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Star,
  Info
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
  availableDays: string;
}

function BookingWizardContent() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [services, setServices] = useState<Service[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Wizard Steps: 1 = Service, 2 = Barber, 3 = Date & Time, 4 = Confirmation/Summary
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reservationSuccess, setReservationSuccess] = useState(false);

  // Client inputs (only used if not logged in)
  const [clientData, setClientData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    if (session?.user) {
      setClientData({
        name: session.user.name || "",
        email: session.user.email || "",
        phone: "Asociado a tu cuenta",
      });
    }
  }, [session]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [servicesRes, barbersRes] = await Promise.all([
          fetch("/api/services"),
          fetch("/api/barbers")
        ]);
        const s = await servicesRes.json();
        const b = await barbersRes.json();
        setServices(s);
        setBarbers(b);
      } catch (error) {
        console.error("Error fetching data", error);
      } finally {
        setLoadingData(false);
      }
    }
    fetchData();
  }, []);

  const [currentYear] = useState(2026);
  const [currentMonth] = useState(5); // June
  const monthName = "Junio";
  const daysInMonth = 30;

  const selectService = (service: Service) => {
    setSelectedService(service);
    setStep(2);
  };

  const selectBarber = (barber: Barber) => {
    setSelectedBarber(barber);
    setSelectedDate("");
    setSelectedTime("");
    setStep(3);
  };

  const getDaysArray = () => {
    const arr = [];
    const firstDayIndex = 1;
    for (let i = 1; i < firstDayIndex; i++) arr.push(null);

    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = `${currentYear}-06-${day.toString().padStart(2, "0")}`;
      const dateObj = new Date(currentYear, currentMonth, day);
      const dayOfWeek = dateObj.getDay();
      
      const barberDays = selectedBarber?.availableDays.split(",").map(Number) || [];
      const isAvailable = barberDays.includes(dayOfWeek) && day >= 1;

      arr.push({ day, dateString, isAvailable });
    }
    return arr;
  };

  const calendarDays = getDaysArray();
  const allTimeSlots = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"];

  // Real availability should ideally check the DB for conflicts.
  // For UI flow purposes without full backend time tracking, we'll assume all times are open for this mockup.
  const availableTimes = allTimeSlots;

  const handleDateSelect = (dateString: string) => {
    setSelectedDate(dateString);
    setSelectedTime("");
  };

  const handleFinalSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedService || !selectedBarber || !selectedDate || !selectedTime) return;
    
    if (status !== "authenticated") {
      alert("Debes iniciar sesión para confirmar la reserva.");
      router.push("/");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: selectedService.id,
          barberId: selectedBarber.id,
          date: selectedDate,
          time: selectedTime,
          price: selectedService.price,
        }),
      });

      if (res.ok) {
        setReservationSuccess(true);
        setStep(5);
      } else {
        alert("Error al guardar la reserva");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const [activeCategory, setActiveCategory] = useState("all");
  const filteredServices = activeCategory === "all"
    ? services
    : services.filter((s) => s.category === activeCategory);

  const getBarberImage = (imageName: string) => {
    switch (imageName) {
      case "alexander-pierce": return "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=350&q=80";
      case "mateo-silva": return "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=350&q=80";
      case "marcus-vance": return "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=350&q=80";
      default: return "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=350&q=80";
    }
  };

  const formatSelectedDate = (dateStr: string) => {
    if (!dateStr) return "";
    const [, , day] = dateStr.split("-");
    return `${day} de Junio, 2026`;
  };

  if (loadingData) {
    return (
      <div className="flex-1 flex items-center justify-center py-40">
        <div className="h-10 w-10 border-4 border-gold-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-28 flex flex-col md:flex-row gap-8">
      <div className="flex-1 bg-charcoal border border-gray-800 rounded-2xl p-6 sm:p-8">

        {step < 5 && (
          <div className="mb-8">
            <div className="flex items-center justify-between text-xs text-gray-400 font-semibold uppercase tracking-wider mb-3">
              <span>Paso {step} de 4</span>
              <span className="text-gold-500">
                {step === 1 && "Servicio"}
                {step === 2 && "Barbero"}
                {step === 3 && "Fecha y Hora"}
                {step === 4 && "Confirmación"}
              </span>
            </div>
            <div className="h-1 bg-matte-black rounded-full overflow-hidden flex">
              <div
                className="bg-gold-500 transition-all duration-500 h-full"
                style={{ width: `${(step / 4) * 100}%` }}
              />
            </div>
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="flex items-center space-x-1.5 text-xs text-gold-500 mt-4 hover:underline cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Volver al paso anterior</span>
              </button>
            )}
          </div>
        )}

        {/* Paso 1: Servicio */}
        {step === 1 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="font-heading text-2xl font-bold text-white mb-2">Selecciona tu Servicio</h2>
              <p className="text-gray-400 text-sm font-light">Elige el tratamiento o corte premium.</p>
            </div>
            <div className="flex flex-wrap gap-2 border-b border-gray-800/60 pb-4">
              {[{ id: "all", name: "Todos" }, { id: "corte", name: "Cortes" }, { id: "barba", name: "Barba" }, { id: "facial", name: "Facial" }, { id: "combo", name: "Combos" }].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveCategory(tab.id)}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${activeCategory === tab.id ? "bg-gold-500 text-black shadow-md" : "bg-matte-black border border-gray-800 text-gray-400"}`}
                >
                  {tab.name}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-1 gap-4">
              {filteredServices.map((service) => (
                <div key={service.id} onClick={() => selectService(service)} className={`bg-matte-black border rounded-xl p-5 cursor-pointer flex items-center justify-between transition-all hover:border-gold-500/40 group ${selectedService?.id === service.id ? "border-gold-500" : "border-gray-800/80"}`}>
                  <div className="space-y-2 flex-1 pr-4">
                    <h3 className="font-heading text-base font-bold text-white group-hover:text-gold-500 transition-colors">{service.name}</h3>
                    <p className="text-gray-400 text-xs font-light max-w-xl line-clamp-2">{service.description}</p>
                    <div className="flex items-center space-x-3 text-xs text-gray-500 font-medium">
                      <span className="flex items-center space-x-1"><Clock className="h-3.5 w-3.5 text-gold-500/70" /><span>{service.duration} min</span></span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-gold-500 font-heading text-xl font-bold">${service.price}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Paso 2: Barbero */}
        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="font-heading text-2xl font-bold text-white mb-2">Elige tu Barbero</h2>
              <p className="text-gray-400 text-sm font-light">Selecciona a tu profesional preferido.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {barbers.filter(b => b.status === "active").map((barber) => (
                <div key={barber.id} onClick={() => selectBarber(barber)} className={`bg-matte-black border rounded-xl overflow-hidden cursor-pointer transition-all hover:border-gold-500/40 group flex flex-col justify-between ${selectedBarber?.id === barber.id ? "border-gold-500" : "border-gray-800/80"}`}>
                  <div className="relative aspect-[4/3] w-full bg-charcoal overflow-hidden">
                    <img src={getBarberImage(barber.image)} alt={barber.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  </div>
                  <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-heading text-sm font-bold text-white group-hover:text-gold-500">{barber.name}</h3>
                      <p className="text-gold-500/85 text-[10px] font-semibold uppercase mt-0.5">{barber.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Paso 3: Fecha y Hora */}
        {step === 3 && (
          <div className="space-y-8 animate-fade-in">
            <div>
              <h2 className="font-heading text-2xl font-bold text-white mb-2">Fecha y Hora</h2>
              <p className="text-gray-400 text-sm font-light">Selecciona día y horario disponible.</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-matte-black border border-gray-800 rounded-xl p-5">
                <div className="flex items-center justify-between mb-4 border-b border-gray-800/80 pb-3">
                  <h3 className="text-sm font-heading font-bold uppercase tracking-wider text-white">{monthName} {currentYear}</h3>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">
                  <span>Lun</span><span>Mar</span><span>Mié</span><span>Jue</span><span>Vie</span><span>Sáb</span><span>Dom</span>
                </div>
                <div className="grid grid-cols-7 gap-1.5">
                  {calendarDays.map((d, i) => {
                    if (!d) return <div key={i} className="aspect-square" />;
                    const isSel = selectedDate === d.dateString;
                    return (
                      <button key={d.day} disabled={!d.isAvailable} onClick={() => handleDateSelect(d.dateString)} className={`aspect-square rounded-lg flex items-center justify-center text-xs font-semibold ${isSel ? "bg-gold-500 text-black shadow-md" : d.isAvailable ? "bg-charcoal text-white hover:text-gold-500 border border-gray-800" : "bg-matte-black text-gray-600 line-through opacity-50 cursor-not-allowed"}`}>{d.day}</button>
                    );
                  })}
                </div>
              </div>
              <div className="bg-matte-black border border-gray-800 rounded-xl p-5 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-heading font-bold uppercase tracking-wider text-white mb-4 border-b border-gray-800 pb-3">Horarios</h3>
                  {!selectedDate ? (
                    <div className="h-40 flex flex-col items-center justify-center p-4"><CalendarIcon className="h-8 w-8 text-gray-600 mb-2"/><p className="text-xs text-gray-500 font-light">Selecciona un día</p></div>
                  ) : (
                    <div className="grid grid-cols-3 gap-2">
                      {availableTimes.map((t) => (
                        <button key={t} onClick={() => setSelectedTime(t)} className={`py-3 rounded-lg text-xs font-semibold border ${selectedTime === t ? "bg-gold-500 text-black border-gold-500" : "bg-charcoal text-white border-gray-800"}`}>{t}</button>
                      ))}
                    </div>
                  )}
                </div>
                {selectedDate && selectedTime && (
                  <button onClick={() => setStep(4)} className="w-full bg-gradient-to-r from-gold-600 to-gold-400 hover:from-gold-500 text-black font-semibold py-3 rounded-lg text-xs uppercase mt-6">Continuar</button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Paso 4: Resumen y Confirmación */}
        {step === 4 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="font-heading text-2xl font-bold text-white mb-2">Resumen de la Reserva</h2>
              <p className="text-gray-400 text-sm font-light">Verifica la información y confirma tu cita.</p>
            </div>
            
            <div className="bg-matte-black border border-gray-800 rounded-xl p-6 space-y-4">
              <div className="flex justify-between border-b border-gray-850 pb-3">
                <span className="text-gray-500 text-sm uppercase font-semibold">Cliente</span>
                <span className="text-white font-medium">{clientData.name || "Sin sesión iniciada"}</span>
              </div>
              <div className="flex justify-between border-b border-gray-850 pb-3">
                <span className="text-gray-500 text-sm uppercase font-semibold">Correo</span>
                <span className="text-white font-medium">{clientData.email || "—"}</span>
              </div>
              <div className="flex justify-between border-b border-gray-850 pb-3">
                <span className="text-gray-500 text-sm uppercase font-semibold">Servicio</span>
                <span className="text-white font-medium">{selectedService?.name}</span>
              </div>
              <div className="flex justify-between border-b border-gray-850 pb-3">
                <span className="text-gray-500 text-sm uppercase font-semibold">Profesional</span>
                <span className="text-white font-medium">{selectedBarber?.name}</span>
              </div>
              <div className="flex justify-between border-b border-gray-850 pb-3">
                <span className="text-gray-500 text-sm uppercase font-semibold">Fecha y Hora</span>
                <span className="text-white font-medium text-right">{formatSelectedDate(selectedDate)}<br/><span className="text-gold-500">{selectedTime}</span></span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-gray-500 text-sm uppercase font-bold">Precio Total</span>
                <span className="text-gold-500 font-heading text-2xl font-bold">${selectedService?.price}</span>
              </div>
            </div>

            {status !== "authenticated" ? (
               <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-center">
                 <p className="text-red-400 text-sm">Debes iniciar sesión para confirmar tu reserva.</p>
               </div>
            ) : (
              <button
                onClick={handleFinalSubmit}
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-gold-600 to-gold-400 hover:from-gold-500 text-black font-bold py-4 rounded-lg shadow-xl uppercase tracking-widest disabled:opacity-50 transition-all flex justify-center items-center gap-2"
              >
                {isSubmitting ? "Procesando..." : "Confirmar Reserva"} <CheckCircle className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Paso 5: Éxito */}
        {step === 5 && (
          <div className="text-center py-12 space-y-6 animate-scale-up">
            <div className="mx-auto w-16 h-16 bg-gold-500/10 border border-gold-500/30 rounded-full flex items-center justify-center text-gold-500 mb-2">
              <CheckCircle className="h-8 w-8" />
            </div>
            <div>
              <h2 className="font-heading text-3xl font-bold text-white mb-2">¡Reserva Realizada Exitosamente!</h2>
              <p className="text-gray-400 text-sm font-light">Te esperamos en la Barbería.</p>
            </div>
            <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button onClick={() => router.push("/profile")} className="bg-charcoal border border-gray-800 hover:border-gold-500/30 text-white font-medium px-6 py-3 rounded-lg text-xs uppercase tracking-wider">Ver Mis Reservas</button>
              <button onClick={() => router.push("/")} className="bg-gradient-to-r from-gold-600 to-gold-400 hover:from-gold-500 text-black font-semibold px-6 py-3 rounded-lg text-xs uppercase tracking-wider">Volver al Inicio</button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default function BookingWizard() {
  return (
    <div className="min-h-screen flex flex-col bg-matte-black text-white relative">
      <Navbar />
      <Suspense fallback={<div className="flex-1 flex items-center justify-center"><div className="h-10 w-10 border-4 border-gold-500 border-t-transparent rounded-full animate-spin" /></div>}>
        <BookingWizardContent />
      </Suspense>
      <Footer />
    </div>
  );
}
