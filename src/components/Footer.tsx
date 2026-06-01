"use client";

import React from "react";
import Link from "next/link";
import { Scissors, Phone, Mail, MapPin, Clock } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-matte-black border-t border-gold-500/10 text-gray-400 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Info */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="p-2 bg-gold-500/10 rounded-lg">
                <Scissors className="h-6 w-6 text-gold-500" />
              </div>
              <span className="font-heading text-xl font-bold tracking-wider text-white">
                BARBER <span className="text-gold-500">STUDIO</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed">
              Redefiniendo el cuidado personal masculino. Combinamos las técnicas clásicas de barbería con las últimas tendencias contemporáneas en un ambiente exclusivo de lujo.
            </p>
            <div className="flex space-x-4 pt-2">
              <a href="#" className="p-2 bg-charcoal rounded-lg hover:bg-gold-500 hover:text-black transition-all duration-300">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </a>
              <a href="#" className="p-2 bg-charcoal rounded-lg hover:bg-gold-500 hover:text-black transition-all duration-300">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Horario */}
          <div>
            <h3 className="font-heading text-white text-base font-semibold mb-4 flex items-center space-x-2">
              <Clock className="h-5 w-5 text-gold-500" />
              <span>Horarios de Atención</span>
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex justify-between border-b border-gray-800/50 pb-2">
                <span>Lunes a Viernes</span>
                <span className="text-white font-medium">9:00 AM - 8:00 PM</span>
              </li>
              <li className="flex justify-between border-b border-gray-800/50 pb-2">
                <span>Sábado</span>
                <span className="text-white font-medium">9:00 AM - 7:00 PM</span>
              </li>
              <li className="flex justify-between">
                <span>Domingo</span>
                <span className="text-gold-500 font-semibold">Cerrado</span>
              </li>
            </ul>
          </div>

          {/* Enlaces rápidos */}
          <div>
            <h3 className="font-heading text-white text-base font-semibold mb-4">Secciones</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/#servicios" className="hover:text-gold-500 transition-colors">
                  Nuestros Servicios
                </Link>
              </li>
              <li>
                <Link href="/#sobre-nosotros" className="hover:text-gold-500 transition-colors">
                  Sobre Nosotros
                </Link>
              </li>
              <li>
                <Link href="/#equipo" className="hover:text-gold-500 transition-colors">
                  Nuestro Equipo
                </Link>
              </li>
              <li>
                <Link href="/#galeria" className="hover:text-gold-500 transition-colors">
                  Galería de Estilos
                </Link>
              </li>
              <li>
                <Link href="/reservar" className="text-gold-500 font-medium hover:underline transition-all">
                  Reservar Cita Online
                </Link>
              </li>
            </ul>
          </div>

          {/* Datos de contacto */}
          <div>
            <h3 className="font-heading text-white text-base font-semibold mb-4">Ubicación y Contacto</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-gold-500 shrink-0 mt-0.5" />
                <span>Av. del Lujo 777, Barber District, Ciudad Alta</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-gold-500 shrink-0" />
                <span>+57 (300) 123-4567</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-gold-500 shrink-0" />
                <span>contacto@barberstudio.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800/80 pt-8 mt-8 flex flex-col md:flex-row justify-between items-center text-xs space-y-4 md:space-y-0">
          <p>&copy; {currentYear} Barber Studio. Todos los derechos reservados.</p>
          <div className="flex space-x-6">
            <a href="#" className="hover:text-gold-500 transition-colors">Políticas de Privacidad</a>
            <a href="#" className="hover:text-gold-500 transition-colors">Términos del Servicio</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
