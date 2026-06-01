"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number; // in minutes
  category: "corte" | "barba" | "facial" | "combo";
}

export interface Barber {
  id: string;
  name: string;
  role: string;
  rating: number;
  reviewsCount: number;
  bio: string;
  image: string;
  status: "active" | "inactive";
  availableDays: number[]; // 0: Sunday, 1: Monday, etc.
}

export interface Appointment {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  serviceId: string;
  barberId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  status: "pending" | "confirmed" | "rescheduled" | "cancelled" | "completed";
  price: number;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalVisits: number;
  totalSpent: number;
}

export interface ClientProfile {
  name: string;
  email: string;
  phone: string;
  avatar: string;
}

interface AppContextType {
  services: Service[];
  barbers: Barber[];
  appointments: Appointment[];
  customers: Customer[];
  clientProfile: ClientProfile;
  addAppointment: (appointment: Omit<Appointment, "id" | "status">) => Appointment;
  cancelAppointment: (id: string) => void;
  rescheduleAppointment: (id: string, date: string, time: string) => void;
  updateProfile: (profile: Partial<ClientProfile>) => void;
  // Admin Operations
  addService: (service: Omit<Service, "id">) => void;
  updateService: (service: Service) => void;
  deleteService: (id: string) => void;
  addBarber: (barber: Omit<Barber, "id" | "rating" | "reviewsCount">) => void;
  updateBarber: (barber: Barber) => void;
  deleteBarber: (id: string) => void;
  updateAppointmentStatus: (id: string, status: Appointment["status"]) => void;
  getAnalytics: () => {
    totalRevenue: number;
    activeClientsCount: number;
    completedBookings: number;
    pendingBookings: number;
    averageTicket: number;
    servicesPopularity: { name: string; value: number }[];
    revenueByBarber: { name: string; revenue: number; bookings: number }[];
    monthlyBookings: { month: string; bookings: number }[];
  };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// LocalStorage helpers to work cleanly on SSR
const loadFromLocalStorage = <T,>(key: string, defaultValue: T): T => {
  if (typeof window === "undefined") return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error("Error reading localStorage key", key, error);
    return defaultValue;
  }
};

const saveToLocalStorage = <T,>(key: string, value: T) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error("Error writing localStorage key", key, error);
  }
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  // Pre-populated data
  const initialServices: Service[] = [
    {
      id: "srv-1",
      name: "Corte de Pelo Imperial",
      description: "Asesoramiento de estilo, lavado con champú premium, corte personalizado a tijera/máquina, toalla caliente y peinado final con pomada orgánica.",
      price: 35,
      duration: 45,
      category: "corte",
    },
    {
      id: "srv-2",
      name: "Esculpido de Barba & Ritual",
      description: "Diseño de barba con máquina y tijera, afeitado de contornos a navaja con toallas calientes aromatizadas, bálsamos de hidratación profunda y masaje relajante.",
      price: 25,
      duration: 30,
      category: "barba",
    },
    {
      id: "srv-3",
      name: "Afeitado Clásico a Navaja",
      description: "Ritual tradicional para cara completa. Doble toalla caliente, espuma caliente batida a brocha de pelo de tejón, afeitado clásico, toalla fría y loción calmante.",
      price: 30,
      duration: 40,
      category: "barba",
    },
    {
      id: "srv-4",
      name: "Tratamiento Facial Exfoliante",
      description: "Limpieza facial profunda con vapor de ozono, exfoliación con micropartículas de carbón activo, mascarilla purificante y masaje hidratante de rostro.",
      price: 40,
      duration: 30,
      category: "facial",
    },
    {
      id: "srv-5",
      name: "Experiencia Studio Full (Combo)",
      description: "El servicio definitivo: Corte de Pelo Imperial + Esculpido de Barba & Ritual + Mascarilla Facial Exfoliante de Carbón Activo. Bebida de cortesía incluida.",
      price: 80,
      duration: 90,
      category: "combo",
    },
  ];

  const initialBarbers: Barber[] = [
    {
      id: "bar-1",
      name: "Alexander Pierce",
      role: "Master Barber & Fundador",
      rating: 4.9,
      reviewsCount: 142,
      bio: "Con más de 12 años perfeccionando el arte de la barbería tradicional en Londres y Nueva York, Alexander se especializa en cortes clásicos atemporales y afeitado tradicional a navaja.",
      image: "alexander-pierce",
      status: "active",
      availableDays: [1, 2, 3, 4, 5, 6], // Monday to Saturday
    },
    {
      id: "bar-2",
      name: "Mateo Silva",
      role: "Especialista en Estilo Urbano",
      rating: 4.8,
      reviewsCount: 98,
      bio: "Un artista en el degradado (fade) y las texturas modernas. Mateo siempre está al día con las últimas tendencias de street style urbano y cortes creativos estructurados.",
      image: "mateo-silva",
      status: "active",
      availableDays: [1, 2, 3, 4, 5], // Monday to Friday
    },
    {
      id: "bar-3",
      name: "Marcus Vance",
      role: "Grooming & Beard Expert",
      rating: 4.9,
      reviewsCount: 115,
      bio: "Marcus trata la barba como una escultura. Su precisión matemática en el delineado y sus amplios conocimientos en cuidado de la piel masculina garantizan una barba perfecta y saludable.",
      image: "marcus-vance",
      status: "active",
      availableDays: [2, 3, 4, 5, 6], // Tuesday to Saturday
    },
  ];

  // Default logged in client: "Andrés Robles"
  const defaultClientProfile: ClientProfile = {
    name: "Andrés Robles",
    email: "andres@gmail.com",
    phone: "+57 300 123 4567",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
  };

  const initialAppointments: Appointment[] = [
    {
      id: "apt-1",
      customerName: "Andrés Robles",
      customerEmail: "andres@gmail.com",
      customerPhone: "+57 300 123 4567",
      serviceId: "srv-1",
      barberId: "bar-1",
      date: "2026-06-05", // Future date relative to June 1, 2026
      time: "10:30",
      status: "confirmed",
      price: 35,
    },
    {
      id: "apt-2",
      customerName: "Andrés Robles",
      customerEmail: "andres@gmail.com",
      customerPhone: "+57 300 123 4567",
      serviceId: "srv-2",
      barberId: "bar-3",
      date: "2026-05-15", // Past date
      time: "15:00",
      status: "completed",
      price: 25,
    },
    {
      id: "apt-3",
      customerName: "Carlos Gómez",
      customerEmail: "carlos@gomez.com",
      customerPhone: "+57 312 987 6543",
      serviceId: "srv-5",
      barberId: "bar-1",
      date: "2026-06-02", // Future date
      time: "12:00",
      status: "confirmed",
      price: 80,
    },
    {
      id: "apt-4",
      customerName: "David Muñoz",
      customerEmail: "david@munoz.com",
      customerPhone: "+57 315 456 7890",
      serviceId: "srv-3",
      barberId: "bar-2",
      date: "2026-05-28", // Past date
      time: "17:30",
      status: "completed",
      price: 30,
    },
    {
      id: "apt-5",
      customerName: "Juan Pérez",
      customerEmail: "juan@perez.com",
      customerPhone: "+57 320 111 2233",
      serviceId: "srv-1",
      barberId: "bar-2",
      date: "2026-06-03", // Future date
      time: "16:15",
      status: "pending",
      price: 35,
    },
  ];

  const initialCustomers: Customer[] = [
    {
      id: "cust-1",
      name: "Andrés Robles",
      email: "andres@gmail.com",
      phone: "+57 300 123 4567",
      totalVisits: 2,
      totalSpent: 60,
    },
    {
      id: "cust-2",
      name: "Carlos Gómez",
      email: "carlos@gomez.com",
      phone: "+57 312 987 6543",
      totalVisits: 1,
      totalSpent: 80,
    },
    {
      id: "cust-3",
      name: "David Muñoz",
      email: "david@munoz.com",
      phone: "+57 315 456 7890",
      totalVisits: 3,
      totalSpent: 95,
    },
  ];

  // States with load from localStorage
  const [services, setServices] = useState<Service[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [clientProfile, setClientProfile] = useState<ClientProfile>(defaultClientProfile);

  // Sync to/from LocalStorage once page loads on client
  useEffect(() => {
    setServices(loadFromLocalStorage("barber_services", initialServices));
    setBarbers(loadFromLocalStorage("barber_barbers", initialBarbers));
    setAppointments(loadFromLocalStorage("barber_appointments", initialAppointments));
    setCustomers(loadFromLocalStorage("barber_customers", initialCustomers));
    setClientProfile(loadFromLocalStorage("barber_client_profile", defaultClientProfile));
  }, []);

  // Update localStorage when state changes
  useEffect(() => {
    if (services.length > 0) saveToLocalStorage("barber_services", services);
  }, [services]);

  useEffect(() => {
    if (barbers.length > 0) saveToLocalStorage("barber_barbers", barbers);
  }, [barbers]);

  useEffect(() => {
    if (appointments.length > 0) saveToLocalStorage("barber_appointments", appointments);
  }, [appointments]);

  useEffect(() => {
    if (customers.length > 0) saveToLocalStorage("barber_customers", customers);
  }, [customers]);

  useEffect(() => {
    saveToLocalStorage("barber_client_profile", clientProfile);
  }, [clientProfile]);

  // Actions
  const addAppointment = (aptData: Omit<Appointment, "id" | "status">): Appointment => {
    const newApt: Appointment = {
      ...aptData,
      id: `apt-${Date.now()}`,
      status: "confirmed", // Auto confirm in this client simulator
    };

    setAppointments((prev) => [...prev, newApt]);

    // Update customer stats
    setCustomers((prev) => {
      const existing = prev.find((c) => c.email.toLowerCase() === aptData.customerEmail.toLowerCase());
      if (existing) {
        return prev.map((c) =>
          c.id === existing.id
            ? { ...c, totalVisits: c.totalVisits + 1, totalSpent: c.totalSpent + aptData.price }
            : c
        );
      } else {
        return [
          ...prev,
          {
            id: `cust-${Date.now()}`,
            name: aptData.customerName,
            email: aptData.customerEmail,
            phone: aptData.customerPhone,
            totalVisits: 1,
            totalSpent: aptData.price,
          },
        ];
      }
    });

    return newApt;
  };

  const cancelAppointment = (id: string) => {
    setAppointments((prev) =>
      prev.map((apt) => (apt.id === id ? { ...apt, status: "cancelled" } : apt))
    );
  };

  const rescheduleAppointment = (id: string, date: string, time: string) => {
    setAppointments((prev) =>
      prev.map((apt) => (apt.id === id ? { ...apt, date, time, status: "rescheduled" } : apt))
    );
  };

  const updateProfile = (profile: Partial<ClientProfile>) => {
    setClientProfile((prev) => ({ ...prev, ...profile }));
  };

  // CRUD Services
  const addService = (srvData: Omit<Service, "id">) => {
    const newSrv: Service = {
      ...srvData,
      id: `srv-${Date.now()}`,
    };
    setServices((prev) => [...prev, newSrv]);
  };

  const updateService = (updatedSrv: Service) => {
    setServices((prev) => prev.map((s) => (s.id === updatedSrv.id ? updatedSrv : s)));
  };

  const deleteService = (id: string) => {
    setServices((prev) => prev.filter((s) => s.id !== id));
  };

  // CRUD Barbers
  const addBarber = (barberData: Omit<Barber, "id" | "rating" | "reviewsCount">) => {
    const newBarber: Barber = {
      ...barberData,
      id: `bar-${Date.now()}`,
      rating: 5.0,
      reviewsCount: 0,
    };
    setBarbers((prev) => [...prev, newBarber]);
  };

  const updateBarber = (updatedBarber: Barber) => {
    setBarbers((prev) => prev.map((b) => (b.id === updatedBarber.id ? updatedBarber : b)));
  };

  const deleteBarber = (id: string) => {
    setBarbers((prev) => prev.filter((b) => b.id !== id));
  };

  const updateAppointmentStatus = (id: string, status: Appointment["status"]) => {
    setAppointments((prev) =>
      prev.map((apt) => (apt.id === id ? { ...apt, status } : apt))
    );
  };

  // Compile real-time analytics
  const getAnalytics = () => {
    const activeAppointments = appointments.filter((a) => a.status !== "cancelled");
    const completed = appointments.filter((a) => a.status === "completed");
    const pending = appointments.filter((a) => a.status === "pending" || a.status === "confirmed" || a.status === "rescheduled");

    const totalRevenue = completed.reduce((sum, item) => sum + item.price, 0);
    const activeClientsCount = customers.length;
    const completedBookings = completed.length;
    const pendingBookings = pending.length;
    const averageTicket = completedBookings > 0 ? Math.round(totalRevenue / completedBookings) : 0;

    // Services popularity
    const serviceCounts: { [key: string]: number } = {};
    activeAppointments.forEach((apt) => {
      const srv = services.find((s) => s.id === apt.serviceId);
      if (srv) {
        serviceCounts[srv.name] = (serviceCounts[srv.name] || 0) + 1;
      }
    });
    const servicesPopularity = Object.keys(serviceCounts).map((name) => ({
      name,
      value: serviceCounts[name],
    })).sort((a, b) => b.value - a.value);

    // Revenue by barber
    const revenueByBarberMap: { [key: string]: { revenue: number; bookings: number } } = {};
    barbers.forEach((b) => {
      revenueByBarberMap[b.name] = { revenue: 0, bookings: 0 };
    });
    completed.forEach((apt) => {
      const barb = barbers.find((b) => b.id === apt.barberId);
      if (barb) {
        revenueByBarberMap[barb.name].revenue += apt.price;
        revenueByBarberMap[barb.name].bookings += 1;
      }
    });
    const revenueByBarber = Object.keys(revenueByBarberMap).map((name) => ({
      name,
      revenue: revenueByBarberMap[name].revenue,
      bookings: revenueByBarberMap[name].bookings,
    }));

    // Monthly bookings (mock representation for visual curves)
    const monthlyBookings = [
      { month: "Ene", bookings: 4 },
      { month: "Feb", bookings: 8 },
      { month: "Mar", bookings: 12 },
      { month: "Abr", bookings: 10 },
      { month: "May", bookings: completedBookings + 5 },
      { month: "Jun", bookings: pendingBookings + 2 },
    ];

    return {
      totalRevenue,
      activeClientsCount,
      completedBookings,
      pendingBookings,
      averageTicket,
      servicesPopularity,
      revenueByBarber,
      monthlyBookings,
    };
  };

  return (
    <AppContext.Provider
      value={{
        services,
        barbers,
        appointments,
        customers,
        clientProfile,
        addAppointment,
        cancelAppointment,
        rescheduleAppointment,
        updateProfile,
        addService,
        updateService,
        deleteService,
        addBarber,
        updateBarber,
        deleteBarber,
        updateAppointmentStatus,
        getAnalytics,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
