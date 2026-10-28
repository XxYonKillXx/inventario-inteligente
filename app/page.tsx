import { redirect } from "next/navigation";

/**
 * Página raíz: redirige al dashboard si hay sesión activa,
 * o a login si no la hay. La verificación real de sesión
 * ocurre en el layout del dashboard mediante middleware.
 */
export default function RootPage() {
  redirect("/login");
}
