"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useApp, Service, Barber } from "@/context/AppContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
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

function BookingWizardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { services, barbers, appointments, clientProfile, addAppointment } = useApp();

  // Wizard Steps: 1 = Service, 2 = Barber, 3 = Date & Time, 4 = Confirmation
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(""); // YYYY-MM-DD
  const [selectedTime, setSelectedTime] = useState<string>(""); // HH:MM
  
  // Client inputs
  const [clientData, setClientData] = useState({
    name: clientProfile.name,
    email: clientProfile.email,
    phone: clientProfile.phone,
  });

  // Calendar navigation state (June 2026)
  const [currentYear] = useState(2026);
  const [currentMonth] = useState(5); // 0-indexed, so 5 = June
  const monthName = "Junio";
  const daysInMonth = 30;
  
  // Pre-select service/barber from URL params if present
  useEffect(() => {
    const srvParam = searchParams.get("service");
    const barParam = searchParams.get("barber");

    if (srvParam) {
      const foundSrv = services.find((s) => s.id === srvParam);
      if (foundSrv) {
        setSelectedService(foundSrv);
        setStep(2); // Jump to barber selection
      }
    }
    if (barParam) {
      const foundBar = barbers.find((b) => b.id === barParam);
      if (foundBar) {
        setSelectedBarber(foundBar);
      }
    }
  }, [searchParams, services, barbers]);

  // Sync clientData with profile once loaded
  useEffect(() => {
    setClientData({
      name: clientProfile.name,
      email: clientProfile.email,
      phone: clientProfile.phone,
    });
  }, [clientProfile]);

  // Handle service selection
  const selectService = (service: Service) => {
    setSelectedService(service);
    setStep(2);
  };

  // Handle barber selection
  const selectBarber = (barber: Barber) => {
    setSelectedBarber(barber);
    // Reset date/time selection when barber changes
    setSelectedDate("");
    setSelectedTime("");
    setStep(3);
  };

  // Calendar calculation
  // June 1, 2026 is a Monday (day of week = 1)
  const getDaysArray = () => {
    const arr = [];
    // Day of week of 1st day (Monday = 1)
    const firstDayIndex = 1; 

    // Add empty slots for offset
    for (let i = 1; i < firstDayIndex; i++) {
      arr.push(null);
    }

    // Add actual days
    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = `${currentYear}-06-${day.toString().padStart(2, "0")}`;
      const dateObj = new Date(currentYear, currentMonth, day);
      const dayOfWeek = dateObj.getDay(); // 0 = Sunday, 1 = Monday, etc.

      // Check availability: barber's available days, and must be today or in the future
      const isAvailable = selectedBarber?.availableDays.includes(dayOfWeek) && day >= 1; 
      
      arr.push({
        day,
        dateString,
        isAvailable,
      });
    }
    return arr;
  };

  const calendarDays = getDaysArray();

  // Time Slots generation (9:00 AM to 7:00 PM)
  const allTimeSlots = [
    "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"
  ];

  // Filter available times in real time based on existing appointments for selected date & barber
  const getAvailableTimes = () => {
    if (!selectedDate || !selectedBarber) return [];
    
    // Find conflicting appointments
    const bookedTimes = appointments
      .filter((apt) => 
        apt.date === selectedDate && 
        apt.barberId === selectedBarber.id && 
        apt.status !== "cancelled"
      )
      .map((apt) => apt.time);

    return allTimeSlots.filter((time) => !bookedTimes.includes(time));
  };

  const availableTimes = getAvailableTimes();

  const handleDateSelect = (dateString: string) => {
    setSelectedDate(dateString);
    setSelectedTime(""); // Reset time on date change
  };

  // Submit Booking
  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService || !selectedBarber || !selectedDate || !selectedTime) return;
    if (!clientData.name || !clientData.email || !clientData.phone) return;

    addAppointment({
      customerName: clientData.name,
      customerEmail: clientData.email,
      customerPhone: clientData.phone,
      serviceId: selectedService.id,
      barberId: selectedBarber.id,
      date: selectedDate,
      time: selectedTime,
      price: selectedService.price,
    });

    setStep(4); // Success step
  };

  // Category filtering
  const [activeCategory, setActiveCategory] = useState("all");
  const filteredServices = activeCategory === "all" 
    ? services 
    : services.filter((s) => s.category === activeCategory);

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

  const formatSelectedDate = (dateStr: string) => {
    if (!dateStr) return "";
    const [,, day] = dateStr.split("-");
    return `${day} de Junio, 2026`;
  };

  return (
    <div className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-28 flex flex-col md:flex-row gap-8">
      {/* Wizard Progress & Steps Column */}
      <div className="flex-1 bg-charcoal border border-gray-800 rounded-2xl p-6 sm:p-8">
        
        {/* Step Indicator */}
        {step < 4 && (
          <div className="mb-8">
            <div className="flex items-center justify-between text-xs text-gray-400 font-semibold uppercase tracking-wider mb-3">
              <span>Paso {step} de 3</span>
              <span className="text-gold-500">
                {step === 1 && "Selecciona Servicio"}
                {step === 2 && "Selecciona Barbero"}
                {step === 3 && "Fecha y Hora"}
              </span>
            </div>
            {/* Progress Bar */}
            <div className="h-1 bg-matte-black rounded-full overflow-hidden flex">
              <div 
                className="bg-gold-500 transition-all duration-500 h-full"
                style={{ width: `${(step / 3) * 100}%` }}
              />
            </div>
            
            {/* Back Button */}
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

        {/* Step 1: Service Selection */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="font-heading text-2xl font-bold text-white mb-2">
                Selecciona tu Servicio
              </h2>
              <p className="text-gray-400 text-sm font-light">
                Elige el tratamiento o corte premium de tu preferencia para continuar.
              </p>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex flex-wrap gap-2 border-b border-gray-800/60 pb-4">
              {[
                { id: "all", name: "Todos" },
                { id: "corte", name: "Cortes" },
                { id: "barba", name: "Barba" },
                { id: "facial", name: "Facial" },
                { id: "combo", name: "Combos" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveCategory(tab.id)}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                    activeCategory === tab.id
                      ? "bg-gold-500 text-black shadow-md shadow-gold-500/10"
                      : "bg-matte-black border border-gray-800 text-gray-400 hover:text-white"
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </div>

            {/* Services Grid */}
            <div className="grid grid-cols-1 gap-4">
              {filteredServices.map((service) => (
                <div 
                  key={service.id}
                  onClick={() => selectService(service)}
                  className={`bg-matte-black border rounded-xl p-5 cursor-pointer flex items-center justify-between transition-all hover:border-gold-500/40 group ${
                    selectedService?.id === service.id ? "border-gold-500" : "border-gray-800/80"
                  }`}
                >
                  <div className="space-y-2 flex-1 pr-4">
                    <h3 className="font-heading text-base font-bold text-white group-hover:text-gold-500 transition-colors">
                      {service.name}
                    </h3>
                    <p className="text-gray-400 text-xs font-light leading-relaxed max-w-xl line-clamp-2">
                      {service.description}
                    </p>
                    <div className="flex items-center space-x-3 text-xs text-gray-500 font-medium">
                      <span className="flex items-center space-x-1">
                        <Clock className="h-3.5 w-3.5 text-gold-500/70" />
                        <span>{service.duration} min</span>
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-gold-500 font-heading text-xl font-bold">${service.price}</span>
                    <span className="block text-[10px] text-gray-500 mt-1 uppercase font-semibold tracking-wider">Elegir &rarr;</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Barber Selection */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="font-heading text-2xl font-bold text-white mb-2">
                Elige tu Barbero
              </h2>
              <p className="text-gray-400 text-sm font-light">
                Nuestros maestros artesanos tienen diferentes especialidades. Selecciona a tu barbero preferido.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {barbers.filter(b => b.status === "active").map((barber) => (
                <div
                  key={barber.id}
                  onClick={() => selectBarber(barber)}
                  className={`bg-matte-black border rounded-xl overflow-hidden cursor-pointer transition-all hover:border-gold-500/40 group flex flex-col justify-between ${
                    selectedBarber?.id === barber.id ? "border-gold-500" : "border-gray-800/80"
                  }`}
                >
                  <div className="relative aspect-[4/3] bg-charcoal overflow-hidden w-full">
                    <img 
                      src={getBarberImage(barber.image)} 
                      alt={barber.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-matte-black/90 via-transparent to-transparent" />
                    <div className="absolute bottom-3 left-3 flex items-center space-x-1 text-gold-500 bg-matte-black/95 border border-gray-800 px-2 py-0.5 rounded text-[10px] font-bold">
                      <Star className="h-3 w-3 fill-current" />
                      <span>{barber.rating}</span>
                    </div>
                  </div>
                  <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-heading text-sm font-bold text-white group-hover:text-gold-500 transition-colors">
                        {barber.name}
                      </h3>
                      <p className="text-gold-500/85 text-[10px] font-semibold tracking-wider uppercase mt-0.5">
                        {barber.role}
                      </p>
                      <p className="text-gray-400 text-xs font-light line-clamp-2 mt-2 leading-relaxed">
                        {barber.bio}
                      </p>
                    </div>
                    <div className="border-t border-gray-850 pt-3 mt-4 text-[10px] uppercase font-bold text-gray-500 text-right group-hover:text-gold-500">
                      Seleccionar &rarr;
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Date & Time Scheduler */}
        {step === 3 && (
          <div className="space-y-8 animate-fade-in">
            <div>
              <h2 className="font-heading text-2xl font-bold text-white mb-2">
                Fecha y Hora de la Reserva
              </h2>
              <p className="text-gray-400 text-sm font-light">
                Selecciona un día en el calendario de {monthName} y luego elige una hora disponible en tiempo real para {selectedBarber?.name}.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Calendar Box */}
              <div className="bg-matte-black border border-gray-800 rounded-xl p-5">
                <div className="flex items-center justify-between mb-4 border-b border-gray-800/80 pb-3">
                  <h3 className="text-sm font-heading font-bold uppercase tracking-wider text-white">
                    {monthName} {currentYear}
                  </h3>
                  <div className="flex space-x-1 text-gray-500 text-xs">
                    <ChevronLeft className="h-4 w-4" />
                    <ChevronRight className="h-4 w-4" />
                  </div>
                </div>

                {/* Day Labels */}
                <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">
                  <span>Lun</span>
                  <span>Mar</span>
                  <span>Mié</span>
                  <span>Jue</span>
                  <span>Vie</span>
                  <span>Sáb</span>
                  <span>Dom</span>
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 gap-1.5">
                  {calendarDays.map((dayItem, idx) => {
                    if (!dayItem) {
                      return <div key={`empty-${idx}`} className="aspect-square" />;
                    }

                    const isSelected = selectedDate === dayItem.dateString;
                    const canSelect = dayItem.isAvailable;

                    return (
                      <button
                        key={dayItem.day}
                        disabled={!canSelect}
                        onClick={() => handleDateSelect(dayItem.dateString)}
                        className={`aspect-square rounded-lg flex flex-col items-center justify-center text-xs font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? "bg-gold-500 text-black font-bold shadow-md shadow-gold-500/10"
                            : canSelect
                            ? "bg-charcoal hover:bg-gold-500/10 text-white hover:text-gold-500 border border-gray-800/50"
                            : "bg-matte-black text-gray-600 border border-transparent line-through cursor-not-allowed"
                        }`}
                      >
                        <span>{dayItem.day}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-start space-x-2 mt-4 text-[10px] text-gray-400 bg-charcoal/30 p-2.5 rounded-lg border border-gray-850">
                  <Info className="h-4.5 w-4.5 text-gold-500 shrink-0 mt-0.5" />
                  <p>
                    Los días deshabilitados representan días de descanso del barbero o fechas pasadas.
                  </p>
                </div>
              </div>

              {/* Time Slots Box */}
              <div className="bg-matte-black border border-gray-800 rounded-xl p-5 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-heading font-bold uppercase tracking-wider text-white mb-4 border-b border-gray-800/80 pb-3 flex items-center space-x-1.5">
                    <Clock className="h-4.5 w-4.5 text-gold-500" />
                    <span>Horarios Disponibles</span>
                  </h3>

                  {!selectedDate ? (
                    <div className="h-40 flex flex-col items-center justify-center text-center p-4">
                      <CalendarIcon className="h-8 w-8 text-gray-600 mb-2" />
                      <p className="text-xs text-gray-500 font-light">
                        Selecciona un día en el calendario para ver los horarios disponibles.
                      </p>
                    </div>
                  ) : availableTimes.length === 0 ? (
                    <div className="h-40 flex flex-col items-center justify-center text-center p-4">
                      <Clock className="h-8 w-8 text-red-500/70 mb-2" />
                      <p className="text-xs text-gray-400 font-light">
                        No hay horarios disponibles para esta fecha. Intenta con otro día.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-2">
                      {availableTimes.map((time) => {
                        const isTimeSelected = selectedTime === time;
                        return (
                          <button
                            key={time}
                            onClick={() => setSelectedTime(time)}
                            className={`py-3 rounded-lg text-xs font-semibold transition-all cursor-pointer border text-center ${
                              isTimeSelected
                                ? "bg-gold-500 text-black border-gold-500 font-bold"
                                : "bg-charcoal hover:bg-gold-500/10 text-white hover:text-gold-500 border-gray-800"
                            }`}
                          >
                            {time}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Confirm selections action */}
                {selectedDate && selectedTime && (
                  <button
                    onClick={() => setStep(4)}
                    className="w-full bg-gradient-to-r from-gold-600 to-gold-400 hover:from-gold-500 hover:to-gold-300 text-black font-semibold py-3 rounded-lg text-xs uppercase tracking-wider transition-all mt-6 cursor-pointer"
                  >
                    Confirmar Fecha y Hora
                  </button>
                )}
              </div>

            </div>
          </div>
        )}

        {/* Step 4: Checkout Form (Final Confirmation) */}
        {step === 4 && (
          <form onSubmit={handleFinalSubmit} className="space-y-6 animate-fade-in">
            <div>
              <h2 className="font-heading text-2xl font-bold text-white mb-2">
                Completa tu Reserva
              </h2>
              <p className="text-gray-400 text-sm font-light">
                Confirma tus datos de contacto para finalizar la cita en Barber Studio.
              </p>
            </div>

            <div className="space-y-4 border-t border-b border-gray-800/80 py-4 my-6">
              <div className="space-y-2">
                <label className="text-xs uppercase text-gray-400 font-semibold tracking-wider">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  required
                  value={clientData.name}
                  onChange={(e) => setClientData({ ...clientData, name: e.target.value })}
                  className="w-full bg-matte-black border border-gray-805/80 border-gray-800 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-gold-500/50 transition-all font-light"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase text-gray-400 font-semibold tracking-wider">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  required
                  value={clientData.email}
                  onChange={(e) => setClientData({ ...clientData, email: e.target.value })}
                  className="w-full bg-matte-black border border-gray-805/80 border-gray-800 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-gold-500/50 transition-all font-light"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase text-gray-400 font-semibold tracking-wider">
                  Teléfono de Contacto
                </label>
                <input
                  type="text"
                  required
                  value={clientData.phone}
                  onChange={(e) => setClientData({ ...clientData, phone: e.target.value })}
                  className="w-full bg-matte-black border border-gray-805/80 border-gray-800 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-gold-500/50 transition-all font-light"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-gold-600 to-gold-400 hover:from-gold-500 hover:to-gold-300 text-black font-semibold py-4 rounded-lg shadow-xl hover:shadow-gold-500/10 transition-all duration-300 flex items-center justify-center space-x-2 text-sm uppercase tracking-wider cursor-pointer"
            >
              <CheckCircle className="h-5 w-5" />
              <span>Confirmar Reserva Imperial</span>
            </button>
          </form>
        )}

        {/* Step 5: SUCCESS Confirmation */}
        {step === 5 && (
          <div className="text-center py-12 space-y-6 animate-scale-up">
            <div className="mx-auto w-16 h-16 bg-gold-500/10 border border-gold-500/30 rounded-full flex items-center justify-center text-gold-500 mb-2">
              <CheckCircle className="h-8 w-8" />
            </div>
            <div>
              <h2 className="font-heading text-3xl font-bold text-white mb-2">
                ¡RESERVA CONFIRMADA!
              </h2>
              <p className="text-gray-400 text-sm font-light max-w-md mx-auto">
                Tu cita ha sido agendada con éxito. Hemos enviado los detalles de la confirmación a tu correo electrónico.
              </p>
            </div>

            <div className="bg-matte-black border border-gray-800 rounded-xl p-5 max-w-sm mx-auto text-left space-y-3">
              <div className="flex justify-between border-b border-gray-850 pb-2 text-xs">
                <span className="text-gray-500">Cita ID:</span>
                <span className="text-white font-semibold uppercase">BS-{Math.floor(1000 + Math.random() * 9000)}</span>
              </div>
              <div className="flex justify-between border-b border-gray-850 pb-2 text-xs">
                <span className="text-gray-500">Servicio:</span>
                <span className="text-white font-semibold">{selectedService?.name}</span>
              </div>
              <div className="flex justify-between border-b border-gray-850 pb-2 text-xs">
                <span className="text-gray-500">Barbero:</span>
                <span className="text-white font-semibold">{selectedBarber?.name}</span>
              </div>
              <div className="flex justify-between border-b border-gray-850 pb-2 text-xs">
                <span className="text-gray-500">Fecha:</span>
                <span className="text-white font-semibold">{formatSelectedDate(selectedDate)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Hora:</span>
                <span className="text-gold-500 font-semibold">{selectedTime} hs</span>
              </div>
            </div>

            <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => router.push("/dashboard/cliente")}
                className="w-full sm:w-auto bg-charcoal border border-gray-800 hover:border-gold-500/30 text-white font-medium px-6 py-3 rounded-lg text-xs uppercase tracking-wider transition-all cursor-pointer"
              >
                Ver Mis Citas
              </button>
              <button
                onClick={() => router.push("/")}
                className="w-full sm:w-auto bg-gradient-to-r from-gold-600 to-gold-400 hover:from-gold-500 text-black font-semibold px-6 py-3 rounded-lg text-xs uppercase tracking-wider transition-all cursor-pointer"
              >
                Volver al Inicio
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Booking Summary Sidebar (Receipt-like layout) */}
      {step < 5 && (
        <div className="w-full md:w-80 bg-charcoal border border-gray-800 rounded-2xl p-6 self-start space-y-6">
          <h3 className="font-heading text-base font-bold text-white border-b border-gray-800/80 pb-3 uppercase tracking-wider">
            Resumen de Cita
          </h3>

          <div className="space-y-4">
            {/* Service Summary */}
            {selectedService ? (
              <div className="flex items-start space-x-3 text-xs">
                <div className="p-2 bg-gold-500/10 rounded-lg text-gold-500 shrink-0">
                  <Scissors className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-white font-semibold">{selectedService.name}</h4>
                  <p className="text-gray-400 font-light mt-0.5">{selectedService.duration} min</p>
                  <p className="text-gold-500 font-semibold mt-1">${selectedService.price}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3 text-xs text-gray-500 font-light py-2">
                <div className="h-8 w-8 rounded-lg bg-matte-black border border-gray-850 flex items-center justify-center text-gray-600 font-bold font-heading">
                  1
                </div>
                <span>Selecciona un servicio</span>
              </div>
            )}

            {/* Barber Summary */}
            {selectedBarber ? (
              <div className="flex items-start space-x-3 text-xs border-t border-gray-850 pt-3">
                <div className="p-2 bg-gold-500/10 rounded-lg text-gold-500 shrink-0">
                  <User className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-white font-semibold">{selectedBarber.name}</h4>
                  <p className="text-gray-400 font-light mt-0.5">{selectedBarber.role}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3 text-xs text-gray-500 font-light border-t border-gray-850 pt-3 py-2">
                <div className="h-8 w-8 rounded-lg bg-matte-black border border-gray-850 flex items-center justify-center text-gray-600 font-bold font-heading">
                  2
                </div>
                <span>Selecciona un barbero</span>
              </div>
            )}

            {/* Date and Time Summary */}
            {selectedDate && selectedTime ? (
              <div className="flex items-start space-x-3 text-xs border-t border-gray-850 pt-3">
                <div className="p-2 bg-gold-500/10 rounded-lg text-gold-500 shrink-0">
                  <Clock className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-white font-semibold">{formatSelectedDate(selectedDate)}</h4>
                  <p className="text-gold-500 font-semibold mt-0.5">{selectedTime} hs</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3 text-xs text-gray-500 font-light border-t border-gray-850 pt-3 py-2">
                <div className="h-8 w-8 rounded-lg bg-matte-black border border-gray-850 flex items-center justify-center text-gray-600 font-bold font-heading">
                  3
                </div>
                <span>Selecciona fecha y hora</span>
              </div>
            )}
          </div>

          {/* Pricing Total block */}
          {selectedService && (
            <div className="border-t border-gray-800/80 pt-4 space-y-2">
              <div className="flex justify-between text-xs font-light text-gray-400">
                <span>Subtotal</span>
                <span>${selectedService.price}</span>
              </div>
              <div className="flex justify-between text-xs font-light text-gray-400">
                <span>Bebida cortesía</span>
                <span className="text-gold-500">Gratis</span>
              </div>
              <div className="flex justify-between text-sm font-heading font-bold text-white pt-2 border-t border-gray-850">
                <span>Total a Pagar</span>
                <span className="text-gold-500">${selectedService.price}</span>
              </div>
              <p className="text-[10px] text-gray-500 leading-tight pt-2 font-light">
                * El pago se realiza directamente en la barbería tras finalizar el servicio.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function BookingWizard() {
  return (
    <div className="min-h-screen flex flex-col bg-matte-black text-white relative">
      <Navbar />
      <Suspense fallback={
        <div className="flex-1 flex items-center justify-center py-40">
          <div className="h-10 w-10 border-4 border-gold-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }>
        <BookingWizardContent />
      </Suspense>
      <Footer />
    </div>
  );
}
