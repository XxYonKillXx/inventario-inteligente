import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Acceso",
    template: "%s | Inventario Inteligente",
  },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
