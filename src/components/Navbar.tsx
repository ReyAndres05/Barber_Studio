"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Scissors, Menu, X, User, ShieldAlert, Calendar } from "lucide-react";
import { usePathname } from "next/navigation";
import { useSession, signIn, signOut } from "next-auth/react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const toggleMenu = () => setIsOpen(!isOpen);

  const navLinks = [
    { name: "Servicios", href: "/#servicios" },
    { name: "Sobre Nosotros", href: "/#sobre-nosotros" },
    { name: "Equipo", href: "/#equipo" },
    { name: "Galería", href: "/#galeria" },
    { name: "Testimonios", href: "/#testimonios" },
    { name: "Contacto", href: "/#contacto" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-effect border-b border-gold-500/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="p-2 bg-gold-500/10 rounded-lg group-hover:bg-gold-500/20 transition-all duration-300">
              <Scissors className="h-6 w-6 text-gold-500 transform group-hover:rotate-45 transition-transform duration-300" />
            </div>
            <span className="font-heading text-xl font-bold tracking-wider text-white">
              BARBER <span className="text-gold-500">STUDIO</span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-sm font-medium text-gray-300 hover:text-gold-500 transition-colors duration-200"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Dashboards & CTA Links */}
          <div className="hidden md:flex items-center space-x-4">
            {status === "authenticated" ? (
              <>
                <Link
                  href="/profile"
                  title="Mi Perfil"
                  className={`p-2 rounded-lg border text-gray-300 hover:text-gold-500 hover:border-gold-500/30 transition-all ${
                    pathname.startsWith("/profile") ? "border-gold-500 text-gold-500" : "border-gray-800"
                  }`}
                >
                  <User className="h-5 w-5" />
                </Link>
                {session.user.role === "admin" && (
                  <Link
                    href="/admin/dashboard"
                    title="Panel Administrativo"
                    className={`p-2 rounded-lg border text-gray-300 hover:text-gold-500 hover:border-gold-500/30 transition-all ${
                      pathname.startsWith("/admin") ? "border-gold-500 text-gold-500" : "border-gray-800"
                    }`}
                  >
                    <ShieldAlert className="h-5 w-5" />
                  </Link>
                )}
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="text-sm font-medium text-gray-300 hover:text-red-500 transition-colors"
                >
                  Salir
                </button>
              </>
            ) : (
              <button
                onClick={() => signIn()}
                className="text-sm font-medium text-gray-300 hover:text-gold-500 transition-colors"
              >
                Ingresar
              </button>
            )}
            
            <Link
              href="/reservar"
              className="flex items-center space-x-2 bg-gradient-to-r from-gold-600 to-gold-400 hover:from-gold-500 hover:to-gold-300 text-black font-semibold px-5 py-2.5 rounded-lg shadow-lg hover:shadow-gold-500/20 transition-all duration-300 text-sm"
            >
              <Calendar className="h-4 w-4" />
              <span>Reservar Cita</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            <Link
              href="/reservar"
              className="bg-gold-500 text-black font-semibold p-2.5 rounded-lg text-xs"
            >
              <Calendar className="h-4 w-4" />
            </Link>
            <button
              onClick={toggleMenu}
              className="p-2 rounded-lg border border-gray-800 text-gray-300 hover:text-gold-500 hover:border-gold-500/30 transition-colors"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isOpen && (
        <div className="md:hidden glass-effect border-b border-gold-500/10 px-4 pt-2 pb-6 space-y-3 animate-fade-in">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-gray-300 hover:text-gold-500 hover:bg-gold-500/5 transition-all"
            >
              {link.name}
            </Link>
          ))}
          <div className="border-t border-gray-800/60 my-4 pt-4 flex flex-col space-y-3">
            {status === "authenticated" ? (
              <>
                <Link
                  href="/profile"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center space-x-3 px-3 py-2 rounded-lg text-base font-medium text-gray-300 hover:text-gold-500 hover:bg-gold-500/5"
                >
                  <User className="h-5 w-5 text-gold-500" />
                  <span>Mi Perfil</span>
                </Link>
                {session.user.role === "admin" && (
                  <Link
                    href="/admin/dashboard"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center space-x-3 px-3 py-2 rounded-lg text-base font-medium text-gray-300 hover:text-gold-500 hover:bg-gold-500/5"
                  >
                    <ShieldAlert className="h-5 w-5 text-gold-500" />
                    <span>Panel Administrativo</span>
                  </Link>
                )}
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="flex items-center space-x-3 px-3 py-2 rounded-lg text-base font-medium text-red-400 hover:text-red-300 hover:bg-red-500/5 text-left"
                >
                  <span>Cerrar Sesión</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => signIn()}
                className="flex items-center space-x-3 px-3 py-2 rounded-lg text-base font-medium text-gray-300 hover:text-gold-500 hover:bg-gold-500/5 text-left"
              >
                <span>Ingresar</span>
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
