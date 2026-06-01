import type { Metadata } from "next";
import { Montserrat, Poppins } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Barber Studio | Barbería Premium & Reservas Online",
  description: "Experimenta el lujo y la exclusividad en Barber Studio. Reserva tu cita online, elige a tu barbero preferido y disfruta de un servicio de nivel profesional en un ambiente diseñado para el caballero moderno.",
  keywords: ["barbería premium", "barbero", "reserva online", "corte de pelo caballero", "barba", "lujo", "exclusivo"],
  authors: [{ name: "Barber Studio" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${montserrat.variable} ${poppins.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-matte-black text-white selection:bg-gold-500 selection:text-black">
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
