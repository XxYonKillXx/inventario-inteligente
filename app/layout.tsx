import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    default: "Inventario Inteligente",
    template: "%s | Inventario Inteligente",
  },
  description:
    "Sistema de gestión de inventario: productos, compras, movimientos, proveedores y reportes.",
  keywords: ["inventario", "stock", "productos", "gestión", "almacén"],
  authors: [{ name: "Inventario Inteligente" }],
  robots: "noindex, nofollow",
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="es" className={`${inter.variable} h-full`}>
      <body className="h-full antialiased">{children}</body>
    </html>
  );
}
