"use client";

import React, { useState } from "react";
import { useApp, Appointment, Service, Barber } from "@/context/AppContext";
import Link from "next/link";
import { 
  BarChart3, 
  Calendar, 
  Scissors, 
  Users, 
  UserCheck, 
  DollarSign, 
  Plus, 
  Edit3, 
  Trash2, 
  Check, 
  X, 
  CheckCircle,
  TrendingUp,
  CircleDot,
  FileText
} from "lucide-react";

export default function AdminDashboard() {
  const { 
    services, 
    barbers, 
    appointments, 
    customers, 
    addService, 
    updateService, 
    deleteService,
    addBarber,
    updateBarber,
    deleteBarber,
    updateAppointmentStatus,
    getAnalytics
  } = useApp();

  const [activeTab, setActiveTab] = useState<"analytics" | "bookings" | "services" | "barbers" | "customers">("analytics");
  const [toastMessage, setToastMessage] = useState("");

  // CRUD Editing Modals / Forms States
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isAddingService, setIsAddingService] = useState(false);
  const [serviceForm, setServiceForm] = useState({ name: "", description: "", price: 20, duration: 30, category: "corte" as Service["category"] });

  const [editingBarber, setEditingBarber] = useState<Barber | null>(null);
  const [isAddingBarber, setIsAddingBarber] = useState(false);
  const [barberForm, setBarberForm] = useState({ name: "", role: "", bio: "", availableDays: [1, 2, 3, 4, 5], status: "active" as Barber["status"] });

  // Compile live analytics
  const analytics = getAnalytics();

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4000);
  };

  // Helper date formatter
  const formatDate = (dateStr: string) => {
    const [, month, day] = dateStr.split("-");
    const monthNames: { [key: string]: string } = { "05": "Mayo", "06": "Junio", "07": "Julio" };
    return `${day} de ${monthNames[month] || "Junio"}, 2026`;
  };

  // Service Handlers
  const handleCreateService = (e: React.FormEvent) => {
    e.preventDefault();
    addService(serviceForm);
    setIsAddingService(false);
    setServiceForm({ name: "", description: "", price: 25, duration: 30, category: "corte" });
    triggerToast("Servicio creado exitosamente.");
  };

  const handleUpdateService = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingService) {
      updateService(editingService);
      setEditingService(null);
      triggerToast("Servicio actualizado exitosamente.");
    }
  };

  const handleDeleteService = (id: string) => {
    if (confirm("¿Estás seguro de que deseas eliminar este servicio?")) {
      deleteService(id);
      triggerToast("Servicio eliminado.");
    }
  };

  // Barber Handlers
  const handleCreateBarber = (e: React.FormEvent) => {
    e.preventDefault();
    addBarber({
      ...barberForm,
      image: "placeholder-barber"
    });
    setIsAddingBarber(false);
    setBarberForm({ name: "", role: "", bio: "", availableDays: [1, 2, 3, 4, 5], status: "active" });
    triggerToast("Barbero contratado exitosamente.");
  };

  const handleUpdateBarber = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBarber) {
      updateBarber(editingBarber);
      setEditingBarber(null);
      triggerToast("Perfil de barbero actualizado.");
    }
  };

  const handleDeleteBarber = (id: string) => {
    if (confirm("¿Estás seguro de desvincular a este barbero del staff?")) {
      deleteBarber(id);
      triggerToast("Barbero desvinculado.");
    }
  };

  // Toggle available day checkbox
  const handleDayToggle = (day: number, isEditing: boolean) => {
    if (isEditing && editingBarber) {
      const days = editingBarber.availableDays.includes(day)
        ? editingBarber.availableDays.filter((d) => d !== day)
        : [...editingBarber.availableDays, day].sort();
      setEditingBarber({ ...editingBarber, availableDays: days });
    } else {
      const days = barberForm.availableDays.includes(day)
        ? barberForm.availableDays.filter((d) => d !== day)
        : [...barberForm.availableDays, day].sort();
      setBarberForm({ ...barberForm, availableDays: days });
    }
  };

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
            <p className="text-xs font-semibold text-white">Administrador Global</p>
            <p className="text-[10px] text-gray-500 font-light">conserje@barberstudio.com</p>
          </div>
          <Link href="/" className="text-xs text-gold-500 border border-gold-500/20 hover:bg-gold-500 hover:text-black px-4.5 py-2 rounded-lg font-semibold uppercase tracking-wider transition-all">
            Ir a Web Principal
          </Link>
        </div>
      </header>

      {/* Main Admin Panel Layout */}
      <div className="flex-1 pt-20 flex flex-col lg:flex-row min-h-screen">
        
        {/* Left Sidebar Menu */}
        <aside className="w-full lg:w-64 border-r border-gray-805/85 border-gray-800 bg-charcoal/40 p-6 space-y-6 lg:fixed lg:top-20 lg:bottom-0 lg:left-0 z-30">
          <nav className="flex flex-row lg:flex-col flex-wrap gap-2 lg:space-y-2">
            {[
              { id: "analytics", name: "Estadísticas", icon: BarChart3 },
              { id: "bookings", name: "Reservas", icon: Calendar },
              { id: "services", name: "Servicios", icon: Scissors },
              { id: "barbers", name: "Barberos", icon: Users },
              { id: "customers", name: "Clientes", icon: UserCheck }
            ].map((menu) => {
              const Icon = menu.icon;
              const isActive = activeTab === menu.id;
              return (
                <button
                  key={menu.id}
                  onClick={() => setActiveTab(menu.id as any)}
                  className={`px-4 py-3 rounded-lg text-xs font-semibold uppercase tracking-wider flex items-center space-x-3 transition-all cursor-pointer ${
                    isActive
                      ? "bg-gold-500 text-black font-bold shadow-md shadow-gold-500/5"
                      : "bg-matte-black border border-gray-850 text-gray-400 hover:text-white"
                  }`}
                >
                  <Icon className="h-4.5 w-4.5 shrink-0" />
                  <span>{menu.name}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Center Content Area */}
        <main className="flex-1 lg:pl-64 p-6 sm:p-8 space-y-8 pb-16">
          
          {/* TAB: Analytics Summary */}
          {activeTab === "analytics" && (
            <div className="space-y-8 animate-fade-in">
              
              {/* Head title */}
              <div>
                <h2 className="font-heading text-2xl font-bold text-white">Resumen Administrativo</h2>
                <p className="text-gray-400 text-xs font-light mt-1">Monitoreo de ingresos, reservas y rendimiento del staff en tiempo real.</p>
              </div>

              {/* Stat Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { name: "Ingresos Totales", value: `$${analytics.totalRevenue}`, desc: "De citas completadas", icon: DollarSign, color: "text-green-400" },
                  { name: "Ticket Promedio", value: `$${analytics.averageTicket}`, desc: "Por servicio finalizado", icon: TrendingUp, color: "text-gold-500" },
                  { name: "Citas Pendientes", value: analytics.pendingBookings, desc: "Por atender hoy / semana", icon: Calendar, color: "text-blue-400" },
                  { name: "Clientes Activos", value: analytics.activeClientsCount, desc: "Registrados en el sistema", icon: Users, color: "text-purple-400" }
                ].map((stat, idx) => {
                  const Icon = stat.icon;
                  return (
                    <div key={idx} className="bg-charcoal border border-gray-800 rounded-2xl p-6 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-450 text-gray-400 font-medium">{stat.name}</span>
                        <div className={`p-2 bg-matte-black/60 rounded-lg ${stat.color}`}>
                          <Icon className="h-4.5 w-4.5" />
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

              {/* Analytical Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Bookings Monthly Trend */}
                <div className="bg-charcoal border border-gray-800 rounded-2xl p-6 space-y-6">
                  <h3 className="font-heading text-sm font-bold text-white uppercase tracking-wider border-b border-gray-850 pb-3 flex items-center space-x-2">
                    <TrendingUp className="h-4.5 w-4.5 text-gold-500" />
                    <span>Tendencia Mensual de Reservas</span>
                  </h3>
                  
                  {/* SVG Line Chart */}
                  <div className="w-full aspect-[2/1] relative">
                    <svg viewBox="0 0 500 200" className="w-full h-full text-gray-700">
                      {/* Grid lines */}
                      <line x1="40" y1="20" x2="480" y2="20" stroke="#1e1e1e" strokeWidth="1" strokeDasharray="4" />
                      <line x1="40" y1="70" x2="480" y2="70" stroke="#1e1e1e" strokeWidth="1" strokeDasharray="4" />
                      <line x1="40" y1="120" x2="480" y2="120" stroke="#1e1e1e" strokeWidth="1" strokeDasharray="4" />
                      <line x1="40" y1="170" x2="480" y2="170" stroke="#2a2a2a" strokeWidth="1" />
                      
                      {/* Chart Line Path */}
                      <path
                        d="M 60,170 C 120,150 180,110 240,75 C 305,95 380,50 460,25"
                        fill="none"
                        stroke="#d4af37"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                      />
                      
                      {/* Gradient area */}
                      <path
                        d="M 60,170 C 120,150 180,110 240,75 C 305,95 380,50 460,25 L 460,170 L 60,170 Z"
                        fill="url(#gold-gradient)"
                        opacity="0.1"
                      />
                      
                      {/* Gradient Definitions */}
                      <defs>
                        <linearGradient id="gold-gradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#d4af37" />
                          <stop offset="100%" stopColor="#d4af37" stopOpacity="0" />
                        </linearGradient>
                      </defs>

                      {/* Dots */}
                      <circle cx="60" cy="170" r="4.5" fill="#121212" stroke="#d4af37" strokeWidth="2.5" />
                      <circle cx="240" cy="75" r="4.5" fill="#121212" stroke="#d4af37" strokeWidth="2.5" />
                      <circle cx="460" cy="25" r="4.5" fill="#121212" stroke="#d4af37" strokeWidth="2.5" />

                      {/* Month labels */}
                      <text x="60" y="192" fill="#757575" fontSize="10" textAnchor="middle" fontWeight="bold">Ene</text>
                      <text x="240" y="192" fill="#757575" fontSize="10" textAnchor="middle" fontWeight="bold">Mar</text>
                      <text x="460" y="192" fill="#d4af37" fontSize="10" textAnchor="middle" fontWeight="bold">Junio (Live)</text>
                    </svg>
                  </div>
                </div>

                {/* Staff performance: Revenue by Barber */}
                <div className="bg-charcoal border border-gray-800 rounded-2xl p-6 space-y-6">
                  <h3 className="font-heading text-sm font-bold text-white uppercase tracking-wider border-b border-gray-850 pb-3 flex items-center space-x-2">
                    <UserCheck className="h-4.5 w-4.5 text-gold-500" />
                    <span>Facturación por Barbero (Completados)</span>
                  </h3>

                  <div className="space-y-4">
                    {analytics.revenueByBarber.map((barb, idx) => {
                      const maxRevenue = Math.max(...analytics.revenueByBarber.map((b) => b.revenue), 1);
                      const percent = Math.max(Math.round((barb.revenue / maxRevenue) * 100), 5);
                      
                      return (
                        <div key={idx} className="space-y-1.5">
                          <div className="flex justify-between text-xs font-semibold">
                            <span className="text-white">{barb.name}</span>
                            <span className="text-gold-500">${barb.revenue} <span className="text-gray-550 text-gray-500 font-light">({barb.bookings} citas)</span></span>
                          </div>
                          <div className="h-2.5 bg-matte-black rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-gold-700 to-gold-400 rounded-full transition-all duration-1000"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB: Bookings Management */}
          {activeTab === "bookings" && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex justify-between items-center flex-wrap gap-4">
                <div>
                  <h2 className="font-heading text-2xl font-bold text-white">Gestión de Reservas</h2>
                  <p className="text-gray-400 text-xs font-light mt-1">Delinea los estados de los servicios confirmando o finalizando las visitas.</p>
                </div>
              </div>

              {/* Table */}
              <div className="bg-charcoal border border-gray-800 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-800 text-[10px] text-gray-500 uppercase tracking-widest bg-matte-black/40">
                        <th className="py-4 px-6 font-semibold">Cliente</th>
                        <th className="py-4 px-6 font-semibold">Contacto</th>
                        <th className="py-4 px-6 font-semibold">Servicio</th>
                        <th className="py-4 px-6 font-semibold">Barbero</th>
                        <th className="py-4 px-6 font-semibold">Fecha / Hora</th>
                        <th className="py-4 px-6 font-semibold">Estado</th>
                        <th className="py-4 px-6 font-semibold text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-850 text-xs">
                      {appointments.map((apt) => {
                        const srv = services.find((s) => s.id === apt.serviceId);
                        const bar = barbers.find((b) => b.id === apt.barberId);

                        return (
                          <tr key={apt.id} className="hover:bg-matte-black/10 transition-colors">
                            <td className="py-4 px-6 font-semibold text-white">{apt.customerName}</td>
                            <td className="py-4 px-6 text-gray-400">
                              <p>{apt.customerEmail}</p>
                              <p className="text-[10px] text-gray-500">{apt.customerPhone}</p>
                            </td>
                            <td className="py-4 px-6 text-white font-medium">
                              <p>{srv?.name || "Servicio Eliminado"}</p>
                              <p className="text-[10px] text-gold-500 font-semibold">${apt.price}</p>
                            </td>
                            <td className="py-4 px-6 text-gray-300">{bar?.name || "Desvinculado"}</td>
                            <td className="py-4 px-6 text-gray-400">
                              <p>{formatDate(apt.date)}</p>
                              <p className="text-[10px] text-gray-500 font-semibold mt-0.5">{apt.time} hs</p>
                            </td>
                            <td className="py-4 px-6">
                              <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                                apt.status === "completed" 
                                  ? "bg-green-500/10 text-green-400 border border-green-500/20"
                                  : apt.status === "cancelled"
                                  ? "bg-red-500/10 text-red-400 border border-red-500/20"
                                  : apt.status === "rescheduled"
                                  ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                                  : "bg-gold-500/10 text-gold-500 border border-gold-500/20"
                              }`}>
                                {apt.status === "completed" && "Completado"}
                                {apt.status === "cancelled" && "Cancelado"}
                                {apt.status === "rescheduled" && "Reprogramado"}
                                {apt.status === "confirmed" && "Confirmado"}
                                {apt.status === "pending" && "Pendiente"}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-right space-x-1.5 whitespace-nowrap">
                              {apt.status !== "completed" && apt.status !== "cancelled" && (
                                <>
                                  <button
                                    onClick={() => {
                                      updateAppointmentStatus(apt.id, "completed");
                                      triggerToast("Cita marcada como completada.");
                                    }}
                                    title="Marcar como Completada"
                                    className="p-1.5 bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg hover:bg-green-500 hover:text-black transition-all cursor-pointer inline-block"
                                  >
                                    <Check className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      updateAppointmentStatus(apt.id, "cancelled");
                                      triggerToast("Reserva cancelada.");
                                    }}
                                    title="Cancelar Cita"
                                    className="p-1.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition-all cursor-pointer inline-block"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                </>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: Services Catalog Management */}
          {activeTab === "services" && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex justify-between items-center flex-wrap gap-4">
                <div>
                  <h2 className="font-heading text-2xl font-bold text-white">Catálogo de Servicios</h2>
                  <p className="text-gray-400 text-xs font-light mt-1">Crea, edita o elimina tratamientos y cortes del portafolio.</p>
                </div>
                <button
                  onClick={() => setIsAddingService(true)}
                  className="bg-gold-500 hover:bg-gold-400 text-black font-semibold text-xs px-5 py-3 rounded-lg uppercase tracking-wider transition-all flex items-center space-x-2 cursor-pointer"
                >
                  <Plus className="h-4.5 w-4.5" />
                  <span>Añadir Servicio</span>
                </button>
              </div>

              {/* Services grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((srv) => (
                  <div key={srv.id} className="bg-charcoal border border-gray-800 rounded-2xl p-6 flex flex-col justify-between hover:border-gold-500/10 transition-all">
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <span className="text-[9px] uppercase font-bold px-2 py-0.5 bg-gold-500/10 border border-gold-500/20 text-gold-500 rounded">
                          {srv.category}
                        </span>
                        <span className="text-gold-500 font-heading font-bold text-xl">${srv.price}</span>
                      </div>
                      <h3 className="font-heading text-base font-bold text-white">{srv.name}</h3>
                      <p className="text-gray-400 text-xs font-light mt-2 leading-relaxed">{srv.description}</p>
                    </div>
                    
                    <div className="border-t border-gray-850 pt-4 mt-6 flex items-center justify-between text-xs">
                      <span className="text-gray-500">{srv.duration} minutos</span>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setEditingService(srv)}
                          className="p-2 bg-matte-black border border-gray-800 text-gray-300 hover:text-gold-500 rounded-lg hover:border-gold-500/30 transition-all cursor-pointer"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteService(srv.id)}
                          className="p-2 bg-matte-black border border-gray-805/85 border-gray-800 text-red-400 hover:bg-red-500/5 rounded-lg transition-all cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: Barbers CRUD */}
          {activeTab === "barbers" && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex justify-between items-center flex-wrap gap-4">
                <div>
                  <h2 className="font-heading text-2xl font-bold text-white">Equipo de Barberos</h2>
                  <p className="text-gray-400 text-xs font-light mt-1">Gestiona el staff técnico del estudio y sus días de disponibilidad laboral.</p>
                </div>
                <button
                  onClick={() => setIsAddingBarber(true)}
                  className="bg-gold-500 hover:bg-gold-400 text-black font-semibold text-xs px-5 py-3 rounded-lg uppercase tracking-wider transition-all flex items-center space-x-2 cursor-pointer"
                >
                  <Plus className="h-4.5 w-4.5" />
                  <span>Contratar Barbero</span>
                </button>
              </div>

              {/* Barbers list */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {barbers.map((barber) => (
                  <div key={barber.id} className="bg-charcoal border border-gray-805/85 border-gray-800 rounded-2xl overflow-hidden group hover:border-gold-500/15 transition-all flex flex-col justify-between">
                    <div>
                      {/* Barber Top details */}
                      <div className="p-6 pb-4 flex items-start justify-between">
                        <div>
                          <h3 className="font-heading text-base font-bold text-white">{barber.name}</h3>
                          <p className="text-gold-500 text-[10px] font-semibold uppercase tracking-wider mt-0.5">{barber.role}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                          barber.status === "active" 
                            ? "bg-green-500/10 text-green-400 border border-green-500/20" 
                            : "bg-red-500/10 text-red-400 border border-red-500/20"
                        }`}>
                          {barber.status === "active" ? "Activo" : "Inactivo"}
                        </span>
                      </div>

                      {/* Bio */}
                      <div className="px-6 pb-4">
                        <p className="text-gray-400 text-xs font-light leading-relaxed">{barber.bio}</p>
                      </div>

                      {/* Available days */}
                      <div className="px-6 pb-6 space-y-1.5 border-t border-gray-850 pt-4 mt-2">
                        <h4 className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Días Laborales:</h4>
                        <div className="flex gap-1.5 flex-wrap">
                          {["D", "L", "M", "M", "J", "V", "S"].map((dayName, idx) => {
                            const isWorking = barber.availableDays.includes(idx);
                            return (
                              <span 
                                key={idx}
                                className={`h-6 w-6 rounded-full flex items-center justify-center text-[9px] font-bold border ${
                                  isWorking 
                                    ? "bg-gold-500/10 border-gold-500/20 text-gold-500" 
                                    : "bg-matte-black/40 border-gray-800 text-gray-600"
                                }`}
                              >
                                {dayName}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-matte-black/40 border-t border-gray-850 flex items-center justify-end space-x-2">
                      <button
                        onClick={() => setEditingBarber(barber)}
                        className="p-2 bg-matte-black border border-gray-800 text-gray-300 hover:text-gold-500 rounded-lg hover:border-gold-500/30 transition-all cursor-pointer"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteBarber(barber.id)}
                        className="p-2 bg-matte-black border border-gray-800 text-red-400 hover:bg-red-500/5 rounded-lg transition-all cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: Customers List */}
          {activeTab === "customers" && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="font-heading text-2xl font-bold text-white">Control de Clientes</h2>
                <p className="text-gray-400 text-xs font-light mt-1">Historial de lealtad, visitas totales e ingresos generados por cada caballero.</p>
              </div>

              <div className="bg-charcoal border border-gray-800 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-800 text-[10px] text-gray-500 uppercase tracking-widest bg-matte-black/40">
                        <th className="py-4 px-6 font-semibold">Cliente</th>
                        <th className="py-4 px-6 font-semibold">Correo Electrónico</th>
                        <th className="py-4 px-6 font-semibold">Teléfono</th>
                        <th className="py-4 px-6 font-semibold">Total Visitas</th>
                        <th className="py-4 px-6 font-semibold text-right">Inversión Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-850 text-xs">
                      {customers.map((cust) => (
                        <tr key={cust.id} className="hover:bg-matte-black/10 transition-colors">
                          <td className="py-4 px-6 font-semibold text-white">{cust.name}</td>
                          <td className="py-4 px-6 text-gray-300">{cust.email}</td>
                          <td className="py-4 px-6 text-gray-405 text-gray-400">{cust.phone}</td>
                          <td className="py-4 px-6 text-white font-medium">{cust.totalVisits} visitas</td>
                          <td className="py-4 px-6 text-gold-500 font-semibold text-right">${cust.totalSpent}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* MODAL: Add/Edit Service Dialog */}
      {(isAddingService || editingService) && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-charcoal border border-gray-800 rounded-2xl max-w-md w-full p-6 space-y-6 animate-scale-up">
            <div className="flex items-center justify-between border-b border-gray-850 pb-3">
              <h3 className="font-heading text-base font-bold text-white uppercase tracking-wider">
                {isAddingService ? "Nuevo Servicio" : "Editar Servicio"}
              </h3>
              <button 
                onClick={() => {
                  setIsAddingService(false);
                  setEditingService(null);
                }} 
                className="text-gray-450 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form 
              onSubmit={isAddingService ? handleCreateService : handleUpdateService} 
              className="space-y-4 text-xs"
            >
              <div className="space-y-1.5">
                <label className="text-gray-400 uppercase font-semibold tracking-wider">Nombre del Servicio</label>
                <input 
                  type="text" 
                  required
                  value={isAddingService ? serviceForm.name : editingService?.name}
                  onChange={(e) => isAddingService 
                    ? setServiceForm({ ...serviceForm, name: e.target.value })
                    : setEditingService({ ...editingService!, name: e.target.value })
                  }
                  className="w-full bg-matte-black border border-gray-850 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-gold-500/40"
                  placeholder="Ej. Corte & Exfoliación"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-gray-400 uppercase font-semibold tracking-wider">Descripción Breve</label>
                <textarea 
                  required
                  rows={3}
                  value={isAddingService ? serviceForm.description : editingService?.description}
                  onChange={(e) => isAddingService 
                    ? setServiceForm({ ...serviceForm, description: e.target.value })
                    : setEditingService({ ...editingService!, description: e.target.value })
                  }
                  className="w-full bg-matte-black border border-gray-850 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-gold-500/40 resize-none"
                  placeholder="Detalles del servicio..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-gray-400 uppercase font-semibold tracking-wider">Precio ($)</label>
                  <input 
                    type="number" 
                    required
                    min={5}
                    value={isAddingService ? serviceForm.price : editingService?.price}
                    onChange={(e) => isAddingService 
                      ? setServiceForm({ ...serviceForm, price: parseInt(e.target.value) })
                      : setEditingService({ ...editingService!, price: parseInt(e.target.value) })
                    }
                    className="w-full bg-matte-black border border-gray-850 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-gold-500/40"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-gray-400 uppercase font-semibold tracking-wider">Duración (Minutos)</label>
                  <input 
                    type="number" 
                    required
                    min={15}
                    value={isAddingService ? serviceForm.duration : editingService?.duration}
                    onChange={(e) => isAddingService 
                      ? setServiceForm({ ...serviceForm, duration: parseInt(e.target.value) })
                      : setEditingService({ ...editingService!, duration: parseInt(e.target.value) })
                    }
                    className="w-full bg-matte-black border border-gray-850 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-gold-500/40"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-gray-400 uppercase font-semibold tracking-wider">Categoría</label>
                <select
                  value={isAddingService ? serviceForm.category : editingService?.category}
                  onChange={(e) => isAddingService 
                    ? setServiceForm({ ...serviceForm, category: e.target.value as any })
                    : setEditingService({ ...editingService!, category: e.target.value as any })
                  }
                  className="w-full bg-matte-black border border-gray-850 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-gold-500/40"
                >
                  <option value="corte">Corte</option>
                  <option value="barba">Barba</option>
                  <option value="facial">Cuidado Facial</option>
                  <option value="combo">Combo Premium</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-gold-600 to-gold-400 hover:from-gold-500 text-black font-bold py-3.5 rounded-lg uppercase tracking-wider text-xs transition-all mt-4 cursor-pointer"
              >
                {isAddingService ? "Crear Servicio Imperial" : "Guardar Cambios"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Add/Edit Barber Staff Dialog */}
      {(isAddingBarber || editingBarber) && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-charcoal border border-gray-800 rounded-2xl max-w-md w-full p-6 space-y-6 animate-scale-up">
            <div className="flex items-center justify-between border-b border-gray-850 pb-3">
              <h3 className="font-heading text-base font-bold text-white uppercase tracking-wider">
                {isAddingBarber ? "Contratar Barbero" : "Editar Barbero"}
              </h3>
              <button 
                onClick={() => {
                  setIsAddingBarber(false);
                  setEditingBarber(null);
                }} 
                className="text-gray-450 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form 
              onSubmit={isAddingBarber ? handleCreateBarber : handleUpdateBarber} 
              className="space-y-4 text-xs"
            >
              <div className="space-y-1.5">
                <label className="text-gray-400 uppercase font-semibold tracking-wider">Nombre del Barbero</label>
                <input 
                  type="text" 
                  required
                  value={isAddingBarber ? barberForm.name : editingBarber?.name}
                  onChange={(e) => isAddingBarber 
                    ? setBarberForm({ ...barberForm, name: e.target.value })
                    : setEditingBarber({ ...editingBarber!, name: e.target.value })
                  }
                  className="w-full bg-matte-black border border-gray-850 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-gold-500/40"
                  placeholder="Ej. Christian Dior"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-gray-400 uppercase font-semibold tracking-wider">Rol / Cargo</label>
                <input 
                  type="text" 
                  required
                  value={isAddingBarber ? barberForm.role : editingBarber?.role}
                  onChange={(e) => isAddingBarber 
                    ? setBarberForm({ ...barberForm, role: e.target.value })
                    : setEditingBarber({ ...editingBarber!, role: e.target.value })
                  }
                  className="w-full bg-matte-black border border-gray-850 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-gold-500/40"
                  placeholder="Ej. Master Barber"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-gray-400 uppercase font-semibold tracking-wider">Biografía Breve</label>
                <textarea 
                  required
                  rows={2}
                  value={isAddingBarber ? barberForm.bio : editingBarber?.bio}
                  onChange={(e) => isAddingBarber 
                    ? setBarberForm({ ...barberForm, bio: e.target.value })
                    : setEditingBarber({ ...editingBarber!, bio: e.target.value })
                  }
                  className="w-full bg-matte-black border border-gray-850 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-gold-500/40 resize-none"
                  placeholder="Trayectoria o especialidad..."
                />
              </div>

              {/* Day schedule toggle checks */}
              <div className="space-y-1.5">
                <label className="text-gray-400 uppercase font-semibold tracking-wider">Días Laborales</label>
                <div className="flex gap-2 justify-between py-2 bg-matte-black/50 border border-gray-850 rounded-lg px-3">
                  {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((dayName, idx) => {
                    const isChecked = isAddingBarber 
                      ? barberForm.availableDays.includes(idx)
                      : editingBarber?.availableDays.includes(idx);

                    return (
                      <label key={idx} className="flex flex-col items-center space-y-1 cursor-pointer">
                        <span className="text-[8px] text-gray-500 font-bold uppercase">{dayName}</span>
                        <input 
                          type="checkbox" 
                          checked={isChecked}
                          onChange={() => handleDayToggle(idx, !isAddingBarber)}
                          className="rounded border-gray-800 bg-matte-black text-gold-500 h-3.5 w-3.5"
                        />
                      </label>
                    );
                  })}
                </div>
              </div>

              {!isAddingBarber && (
                <div className="space-y-1.5">
                  <label className="text-gray-400 uppercase font-semibold tracking-wider">Estado Operativo</label>
                  <select
                    value={editingBarber?.status}
                    onChange={(e) => setEditingBarber({ ...editingBarber!, status: e.target.value as any })}
                    className="w-full bg-matte-black border border-gray-850 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-gold-500/40"
                  >
                    <option value="active">Activo</option>
                    <option value="inactive">Inactivo</option>
                  </select>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-gold-600 to-gold-400 hover:from-gold-500 text-black font-bold py-3.5 rounded-lg uppercase tracking-wider text-xs transition-all mt-4 cursor-pointer"
              >
                {isAddingBarber ? "Vincular al Staff" : "Guardar Perfil"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Toast popup */}
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

    </div>
  );
}
