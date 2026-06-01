"use client";

import React, { useState } from "react";
import { useApp, Appointment, Service, Barber } from "@/context/AppContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Settings, 
  Mail, 
  Phone, 
  Trash2, 
  History, 
  LogOut, 
  Camera,
  CheckCircle,
  AlertTriangle,
  X
} from "lucide-react";

export default function ClientDashboard() {
  const { 
    appointments, 
    services, 
    barbers, 
    clientProfile, 
    updateProfile, 
    cancelAppointment, 
    rescheduleAppointment 
  } = useApp();

  const [activeTab, setActiveTab] = useState<"agenda" | "perfil">("agenda");
  
  // Modals state
  const [cancellingApt, setCancellingApt] = useState<Appointment | null>(null);
  const [reschedulingApt, setReschedulingApt] = useState<Appointment | null>(null);
  const [toastMessage, setToastMessage] = useState<string>("");

  // Form profile edits
  const [profileForm, setProfileForm] = useState({
    name: clientProfile.name,
    email: clientProfile.email,
    phone: clientProfile.phone,
  });

  // Modal reschedule selections
  const [newDate, setNewDate] = useState<string>("");
  const [newTime, setNewTime] = useState<string>("");

  // Filter client bookings (based on Andrés Robles)
  const clientAppointments = appointments.filter(
    (apt) => apt.customerEmail.toLowerCase() === clientProfile.email.toLowerCase()
  );

  const activeBookings = clientAppointments.filter(
    (apt) => apt.status === "confirmed" || apt.status === "pending" || apt.status === "rescheduled"
  );

  const pastBookings = clientAppointments.filter(
    (apt) => apt.status === "completed" || apt.status === "cancelled"
  );

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4000);
  };

  // Profile Save
  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(profileForm);
    triggerToast("Perfil actualizado correctamente.");
  };

  // Cancel Appointment Action
  const confirmCancel = () => {
    if (cancellingApt) {
      cancelAppointment(cancellingApt.id);
      triggerToast("Cita cancelada con éxito.");
      setCancellingApt(null);
    }
  };

  // Reschedule Appointment Action
  const confirmReschedule = () => {
    if (reschedulingApt && newDate && newTime) {
      rescheduleAppointment(reschedulingApt.id, newDate, newTime);
      triggerToast("Cita reprogramada con éxito.");
      setReschedulingApt(null);
      setNewDate("");
      setNewTime("");
    }
  };

  // Helper selectors
  const getService = (id: string): Service | undefined => services.find((s) => s.id === id);
  const getBarber = (id: string): Barber | undefined => barbers.find((b) => b.id === id);

  // June 2026 Calendar generator for reschedule modal
  const daysInJune = 30;
  const getJuneDays = () => {
    const arr = [];
    for (let day = 1; day <= daysInJune; day++) {
      const dateString = `2026-06-${day.toString().padStart(2, "0")}`;
      const dateObj = new Date(2026, 5, day);
      const dayOfWeek = dateObj.getDay(); // 0 = Sunday, 1 = Monday
      
      // Let's filter based on rescheduling barber availability
      const barber = reschedulingApt ? getBarber(reschedulingApt.barberId) : null;
      const isAvailable = barber?.availableDays.includes(dayOfWeek) && day >= 1; 

      arr.push({ day, dateString, isAvailable });
    }
    return arr;
  };

  const getAvailableTimesForReschedule = () => {
    if (!newDate || !reschedulingApt) return [];
    
    const timeSlots = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"];
    
    // Find conflicts
    const bookedTimes = appointments
      .filter((apt) => 
        apt.date === newDate && 
        apt.barberId === reschedulingApt.barberId && 
        apt.id !== reschedulingApt.id &&
        apt.status !== "cancelled"
      )
      .map((apt) => apt.time);

    return timeSlots.filter((time) => !bookedTimes.includes(time));
  };

  const rescheduleDays = getJuneDays();
  const rescheduleTimes = getAvailableTimesForReschedule();

  const formatDate = (dateStr: string) => {
    const [, month, day] = dateStr.split("-");
    const monthNames: { [key: string]: string } = { "05": "Mayo", "06": "Junio", "07": "Julio" };
    return `${day} de ${monthNames[month] || "Junio"}, 2026`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-matte-black text-white relative">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-28 flex flex-col md:flex-row gap-8">
        
        {/* Left Sidebar Navigation */}
        <aside className="w-full md:w-64 bg-charcoal border border-gray-800 rounded-2xl p-6 self-start space-y-6">
          <div className="flex items-center space-x-3">
            <div className="relative h-12 w-12 rounded-full overflow-hidden border border-gold-500/30">
              <img 
                src={clientProfile.avatar} 
                alt={clientProfile.name}
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <h3 className="font-heading text-sm font-bold text-white">{clientProfile.name}</h3>
              <p className="text-gray-400 text-xs font-light">Cliente Premium</p>
            </div>
          </div>

          <div className="border-t border-gray-800/80 my-4" />

          <nav className="flex flex-col space-y-2">
            <button
              onClick={() => setActiveTab("agenda")}
              className={`w-full text-left px-4 py-3 rounded-lg text-xs font-semibold uppercase tracking-wider flex items-center space-x-3 transition-all cursor-pointer ${
                activeTab === "agenda"
                  ? "bg-gold-500 text-black font-bold"
                  : "bg-matte-black border border-gray-800/40 text-gray-400 hover:text-white"
              }`}
            >
              <CalendarIcon className="h-4 w-4" />
              <span>Mi Agenda</span>
            </button>

            <button
              onClick={() => setActiveTab("perfil")}
              className={`w-full text-left px-4 py-3 rounded-lg text-xs font-semibold uppercase tracking-wider flex items-center space-x-3 transition-all cursor-pointer ${
                activeTab === "perfil"
                  ? "bg-gold-500 text-black font-bold"
                  : "bg-matte-black border border-gray-800/40 text-gray-400 hover:text-white"
              }`}
            >
              <User className="h-4 w-4" />
              <span>Mi Perfil</span>
            </button>
          </nav>
        </aside>

        {/* Right Dashboard Content */}
        <section className="flex-1 space-y-6">
          
          {/* TAB: Agenda */}
          {activeTab === "agenda" && (
            <div className="space-y-8">
              
              {/* Active / Upcoming Bookings */}
              <div className="space-y-4">
                <h2 className="font-heading text-xl font-bold text-white flex items-center space-x-2">
                  <span className="h-2 w-2 rounded-full bg-gold-500 animate-ping" />
                  <span>Próximas Citas</span>
                </h2>

                {activeBookings.length === 0 ? (
                  <div className="bg-charcoal border border-gray-800 rounded-2xl p-8 text-center">
                    <CalendarIcon className="h-10 w-10 text-gray-650 text-gray-600 mx-auto mb-3" />
                    <h3 className="font-heading text-base font-semibold mb-1">No tienes citas activas</h3>
                    <p className="text-gray-400 text-xs font-light mb-4">Agenda tu próximo servicio y vive la experiencia.</p>
                    <button 
                      onClick={() => window.location.href = "/reservar"}
                      className="bg-gold-500 hover:bg-gold-400 text-black font-semibold text-xs px-5 py-2.5 rounded-lg uppercase tracking-wider transition-all"
                    >
                      Reservar Cita
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {activeBookings.map((apt) => {
                      const service = getService(apt.serviceId);
                      const barber = getBarber(apt.barberId);

                      return (
                        <div 
                          key={apt.id}
                          className="bg-charcoal border border-gray-805/85 border-gray-800 rounded-2xl p-6 hover:border-gold-500/20 transition-all duration-300 relative group flex flex-col justify-between"
                        >
                          {/* Top row */}
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <span className={`text-[10px] uppercase font-bold px-2.5 py-1 rounded-full border ${
                                apt.status === "rescheduled" 
                                  ? "bg-blue-500/10 border-blue-500/30 text-blue-400" 
                                  : "bg-gold-500/10 border-gold-500/30 text-gold-500"
                              }`}>
                                {apt.status === "rescheduled" ? "Reprogramada" : "Confirmada"}
                              </span>
                              <span className="text-xs text-gray-500 uppercase font-semibold">
                                ID: BS-{apt.id.slice(-4)}
                              </span>
                            </div>
                            
                            {/* Service and Barber */}
                            <div>
                              <h3 className="font-heading text-base font-bold text-white">{service?.name}</h3>
                              <p className="text-xs text-gray-400 font-light mt-1">Con {barber?.name}</p>
                            </div>

                            {/* Date and Time block */}
                            <div className="flex items-center gap-4 text-xs text-gray-300 bg-matte-black/60 p-3 rounded-lg border border-gray-850">
                              <div className="flex items-center space-x-1.5">
                                <CalendarIcon className="h-4 w-4 text-gold-500" />
                                <span>{formatDate(apt.date)}</span>
                              </div>
                              <div className="flex items-center space-x-1.5 border-l border-gray-800 pl-4">
                                <Clock className="h-4 w-4 text-gold-500" />
                                <span>{apt.time} hs</span>
                              </div>
                            </div>
                          </div>

                          {/* Quick Actions */}
                          <div className="flex items-center space-x-3 pt-6 border-t border-gray-850 mt-6 justify-end text-xs">
                            <button
                              onClick={() => setCancellingApt(apt)}
                              className="text-red-400 hover:text-red-300 font-semibold px-3 py-1.5 rounded-lg hover:bg-red-500/5 transition-all cursor-pointer"
                            >
                              Cancelar
                            </button>
                            <button
                              onClick={() => {
                                setReschedulingApt(apt);
                                setNewDate("");
                                setNewTime("");
                              }}
                              className="bg-gold-500 hover:bg-gold-400 text-black font-semibold px-4 py-2 rounded-lg shadow-sm hover:shadow-gold-500/10 transition-all cursor-pointer"
                            >
                              Reprogramar
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Service History */}
              <div className="space-y-4">
                <h2 className="font-heading text-lg font-bold text-white flex items-center space-x-2">
                  <History className="h-5 w-5 text-gray-500" />
                  <span>Historial de Servicios</span>
                </h2>

                {pastBookings.length === 0 ? (
                  <div className="bg-charcoal border border-gray-850 rounded-2xl p-6 text-center text-xs text-gray-500">
                    Aún no cuentas con servicios finalizados en el historial.
                  </div>
                ) : (
                  <div className="bg-charcoal border border-gray-800 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-gray-800 text-[10px] text-gray-500 uppercase tracking-widest bg-matte-black/40">
                            <th className="py-4 px-6 font-semibold">Servicio</th>
                            <th className="py-4 px-6 font-semibold">Barbero</th>
                            <th className="py-4 px-6 font-semibold">Fecha</th>
                            <th className="py-4 px-6 font-semibold">Total</th>
                            <th className="py-4 px-6 font-semibold">Estado</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-850 text-xs">
                          {pastBookings.map((apt) => {
                            const service = getService(apt.serviceId);
                            const barber = getBarber(apt.barberId);

                            return (
                              <tr key={apt.id} className="hover:bg-matte-black/10 transition-colors">
                                <td className="py-4 px-6 font-semibold text-white">{service?.name}</td>
                                <td className="py-4 px-6 text-gray-300">{barber?.name}</td>
                                <td className="py-4 px-6 text-gray-400">{formatDate(apt.date)}</td>
                                <td className="py-4 px-6 text-gold-500 font-semibold">${apt.price}</td>
                                <td className="py-4 px-6">
                                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                                    apt.status === "completed" 
                                      ? "bg-green-500/10 text-green-400 border border-green-500/20" 
                                      : "bg-red-500/10 text-red-400 border border-red-500/20"
                                  }`}>
                                    {apt.status === "completed" ? "Completada" : "Cancelada"}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB: Perfil */}
          {activeTab === "perfil" && (
            <div className="bg-charcoal border border-gray-805/85 border-gray-800 rounded-2xl p-6 sm:p-8">
              <h2 className="font-heading text-xl font-bold text-white mb-6">
                Mi Perfil de Cliente
              </h2>

              <form onSubmit={handleProfileSave} className="space-y-6">
                
                {/* Avatar change block */}
                <div className="flex items-center space-x-6">
                  <div className="relative group h-20 w-20 rounded-full overflow-hidden border-2 border-gold-500/30">
                    <img 
                      src={clientProfile.avatar} 
                      alt={clientProfile.name}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <Camera className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-white font-semibold text-sm">Foto de Perfil</h4>
                    <p className="text-gray-400 text-xs mt-1">Haz clic para cambiar tu avatar de cliente.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-t border-gray-800/60 pt-6">
                  <div className="space-y-2">
                    <label className="text-xs uppercase text-gray-400 font-semibold tracking-wider">
                      Nombre Completo
                    </label>
                    <input 
                      type="text"
                      required
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      className="w-full bg-matte-black border border-gray-805/80 border-gray-800 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-gold-500/50 transition-all font-light"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs uppercase text-gray-400 font-semibold tracking-wider">
                      Teléfono
                    </label>
                    <input 
                      type="text"
                      required
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      className="w-full bg-matte-black border border-gray-805/80 border-gray-800 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-gold-500/50 transition-all font-light"
                    />
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-xs uppercase text-gray-400 font-semibold tracking-wider">
                      Correo Electrónico
                    </label>
                    <input 
                      type="email"
                      required
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                      className="w-full bg-matte-black border border-gray-850/80 border-gray-800 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-gold-500/50 transition-all font-light"
                    />
                  </div>
                </div>

                {/* Notifications setup */}
                <div className="border-t border-gray-800/60 pt-6 space-y-4">
                  <h3 className="font-heading text-sm font-bold text-white flex items-center space-x-2">
                    <Settings className="h-4.5 w-4.5 text-gold-500" />
                    <span>Preferencias de Notificación</span>
                  </h3>
                  <div className="space-y-3">
                    <label className="flex items-center space-x-3 text-xs text-gray-300 cursor-pointer">
                      <input type="checkbox" defaultChecked className="rounded border-gray-800 bg-matte-black text-gold-500 focus:ring-0 h-4 w-4" />
                      <span>Recordatorios por correo electrónico (24 horas antes)</span>
                    </label>
                    <label className="flex items-center space-x-3 text-xs text-gray-300 cursor-pointer">
                      <input type="checkbox" defaultChecked className="rounded border-gray-800 bg-matte-black text-gold-500 focus:ring-0 h-4 w-4" />
                      <span>Mensajes de confirmación por SMS en tiempo real</span>
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full sm:w-auto bg-gradient-to-r from-gold-600 to-gold-400 hover:from-gold-500 hover:to-gold-300 text-black font-semibold px-8 py-3.5 rounded-lg shadow-lg transition-all text-xs uppercase tracking-wider cursor-pointer"
                >
                  Guardar Perfil Premium
                </button>
              </form>
            </div>
          )}

        </section>
      </main>

      {/* Modal: Cancel Confirmation */}
      {cancellingApt && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-charcoal border border-gray-800 rounded-2xl max-w-sm w-full p-6 space-y-5 animate-scale-up">
            <div className="mx-auto w-12 h-12 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center text-red-500">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div className="text-center">
              <h3 className="font-heading text-lg font-bold text-white">¿Cancelar Reserva?</h3>
              <p className="text-gray-400 text-xs font-light mt-2 leading-relaxed">
                Esta acción no se puede deshacer. ¿Seguro que deseas cancelar tu cita para el {formatDate(cancellingApt.date)} a las {cancellingApt.time} hs?
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setCancellingApt(null)}
                className="flex-1 bg-matte-black border border-gray-800 hover:bg-charcoal-light text-white font-semibold py-3 rounded-lg text-xs uppercase tracking-wider transition-all cursor-pointer"
              >
                No, Volver
              </button>
              <button
                onClick={confirmCancel}
                className="flex-1 bg-red-500 hover:bg-red-400 text-white font-semibold py-3 rounded-lg text-xs uppercase tracking-wider transition-all cursor-pointer"
              >
                Sí, Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Reschedule Portal */}
      {reschedulingApt && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-charcoal border border-gray-800 rounded-2xl max-w-xl w-full p-6 space-y-6 animate-scale-up max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-805/85 border-gray-800 pb-3">
              <h3 className="font-heading text-base font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                <CalendarIcon className="h-5 w-5 text-gold-500" />
                <span>Reprogramar Cita</span>
              </h3>
              <button 
                onClick={() => setReschedulingApt(null)}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Calendar Grid */}
              <div className="bg-matte-black border border-gray-800 rounded-xl p-4">
                <h4 className="text-xs font-heading font-bold text-white uppercase tracking-widest mb-3 text-center">Junio 2026</h4>
                
                <div className="grid grid-cols-7 gap-1 text-center text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-2">
                  <span>Lun</span><span>Mar</span><span>Mié</span><span>Jue</span><span>Vie</span><span>Sáb</span><span>Dom</span>
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {rescheduleDays.map((dayItem, idx) => {
                    const isSelected = newDate === dayItem.dateString;
                    const canSelect = dayItem.isAvailable;

                    return (
                      <button
                        key={`resched-${idx}`}
                        disabled={!canSelect}
                        onClick={() => {
                          setNewDate(dayItem.dateString);
                          setNewTime("");
                        }}
                        className={`aspect-square rounded-lg flex items-center justify-center text-[10px] font-semibold transition-all ${
                          isSelected
                            ? "bg-gold-500 text-black font-bold"
                            : canSelect
                            ? "bg-charcoal hover:bg-gold-500/10 text-white hover:text-gold-500 border border-gray-800"
                            : "bg-matte-black text-gray-650 text-gray-650 text-gray-600 border border-transparent cursor-not-allowed line-through"
                        }`}
                      >
                        {dayItem.day}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time Slots Grid */}
              <div className="bg-matte-black border border-gray-800 rounded-xl p-4 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-heading font-bold text-white uppercase tracking-widest mb-4 border-b border-gray-850 pb-2">
                    Horarios Disponibles
                  </h4>

                  {!newDate ? (
                    <p className="text-[10px] text-gray-500 font-light text-center py-10">
                      Selecciona un día para ver horas.
                    </p>
                  ) : rescheduleTimes.length === 0 ? (
                    <p className="text-[10px] text-red-400 font-light text-center py-10">
                      Sin horarios libres.
                    </p>
                  ) : (
                    <div className="grid grid-cols-2 gap-1.5">
                      {rescheduleTimes.map((time) => {
                        const isTimeSelected = newTime === time;
                        return (
                          <button
                            key={time}
                            onClick={() => setNewTime(time)}
                            className={`py-2 rounded-lg text-[10px] font-semibold transition-all border text-center ${
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

                {newDate && newTime && (
                  <button
                    onClick={confirmReschedule}
                    className="w-full bg-gradient-to-r from-gold-600 to-gold-400 hover:from-gold-500 hover:to-gold-300 text-black font-semibold py-2.5 rounded-lg text-xs uppercase tracking-wider transition-all mt-4 cursor-pointer"
                  >
                    Guardar Cambios
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-charcoal border border-gold-500/40 text-white rounded-xl shadow-2xl p-4 flex items-center space-x-3 animate-fade-in max-w-sm">
          <div className="p-2 bg-gold-500/10 rounded-lg text-gold-500">
            <CheckCircle className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-200">{toastMessage}</p>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
