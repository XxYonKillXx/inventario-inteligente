"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  LoaderCircle,
  CircleAlert,
  Mountain,
    Salad,
  Package,
  BellRing,
  ChartNoAxesCombined,
} from "lucide-react";
import Image from "next/image";

interface FormErrors {
  correo?: string;
  password?: string;
  general?: string;
}

export default function LoginPage() {
  const router = useRouter();

  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [mostrarPass, setMostrarPass] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [errores, setErrores] = useState<FormErrors>({});

  useEffect(() => {
    const token = localStorage.getItem("ii_token");
    if (token) router.replace("/dashboard");
  }, [router]);

  function validarFormulario(): boolean {
    const nuevosErrores: FormErrors = {};

    if (!correo.trim()) {
      nuevosErrores.correo = "El correo electrónico es requerido.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim())) {
      nuevosErrores.correo = "Ingresa un correo electrónico válido.";
    }

    if (!password) {
      nuevosErrores.password = "La contraseña es requerida.";
    } else if (password.length < 6) {
      nuevosErrores.password = "La contraseña debe tener al menos 6 caracteres.";
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  }

  async function manejarEnvio(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrores({});

    if (!validarFormulario()) return;

    setCargando(true);

    try {
      const respuesta = await fetch("http://localhost:3001/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          correo: correo.trim().toLowerCase(),
          password,
        }),
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        setErrores({
          general: datos.mensaje || "Credenciales incorrectas. Verifica tu correo y contraseña.",
        });
        return;
      }

      if (typeof window !== "undefined") {
        localStorage.setItem("ii_token", datos.token);
        localStorage.setItem("ii_usuario", JSON.stringify(datos.usuario));
      }

      router.push("/dashboard");
    } catch {
      setErrores({
        general: "No se pudo conectar con el servidor. Verifica que el backend esté en ejecución.",
      });
    } finally {
      setCargando(false);
    }
  }

  const caracteristicas = [
  {
    icono: Salad,
    texto: "Control de ingredientes e insumos",
  },
  {
    icono: Package,
    texto: "Existencias y niveles de inventario",
  },
  {
    icono: BellRing,
    texto: "Alertas para reponer productos",
  },
  {
    icono: ChartNoAxesCombined,
    texto: "Información para tomar mejores decisiones",
  },
];

  return (
    <main className="min-h-screen bg-[#f6f3eb] lg:grid lg:grid-cols-[1.08fr_0.92fr]">
      {/* Panel de marca */}
      <section className="relative hidden min-h-screen overflow-hidden bg-[#243c32] px-10 py-12 text-[#fffaf0] lg:flex lg:flex-col lg:justify-between xl:px-16">
        <div className="pointer-events-none absolute -left-36 -top-32 h-[430px] w-[430px] rounded-full bg-[#6c8766]/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -right-28 h-[480px] w-[480px] rounded-full bg-[#c18b54]/20 blur-3xl" />
        <div className="pointer-events-none absolute right-12 top-1/3 h-56 w-56 rounded-full border border-white/10" />
        <div className="pointer-events-none absolute right-20 top-[36%] h-40 w-40 rounded-full border border-white/10" />

        <div className="relative z-10 flex items-center gap-3">
          {/* Espacio de marca: puedes reemplazar este emblema por el logo real */}
          <div className="flex h-[68px] w-[68px] shrink-0 items-center justify-center rounded-2xl border border-[#e9d9b5]/35 bg-white/10 shadow-lg backdrop-blur-sm">
              <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl">
                <Image
                  src="/img/logo.jpeg"
                  alt="Logo El Balcón del Cielo"
                  width={80}
                  height={80}
                  priority
                  className="h-full w-full object-cover"
                />
              </div>
          </div>
          <div>
            <p className="font-serif text-xl font-semibold tracking-wide">El Balcón del Cielo</p>
            <p className="mt-1 text-xs uppercase tracking-[0.22em] text-[#d9c9a5]">Restaurante · Mirador</p>
          </div>
        </div>

        <div className="relative z-10 max-w-xl py-12">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#d9c9a5]/30 bg-white/5 px-4 py-2 text-xs font-medium tracking-wide text-[#e8ddc5]">
            <span className="h-2 w-2 rounded-full bg-[#e7bd71]" />
            GESTIÓN INTERNA DEL RESTAURANTE
          </div>
          <h1 className="font-serif text-5xl font-semibold leading-[1.12] tracking-tight xl:text-6xl">
            Todo bajo control,
            <span className="mt-2 block text-[#e7bd71]">desde la cocina</span>
            hasta el mirador.
          </h1>
          <p className="mt-6 max-w-lg text-base leading-7 text-[#e2e8df]/80 xl:text-lg">
            Organiza tus productos, registra las compras y anticipa lo que hace falta para que cada servicio esté listo.
          </p>

          <div className="mt-10 grid gap-3 sm:grid-cols-2">
            {caracteristicas.map(({ icono: Icono, texto }) => (
              <div key={texto} className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-[#F4C66A]">
                  <Icono size={20} strokeWidth={1.8} aria-hidden="true" />
                </div>

                <span className="text-sm text-white/85">{texto}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex items-end justify-between gap-6 border-t border-white/10 pt-5">
          <div>
            <p className="font-serif text-lg italic text-[#e7bd71]">El sabor de compartir, la tranquilidad de estar preparados.</p>
            <p className="mt-2 text-xs text-white/50">Sistema de inventario · Uso interno</p>
          </div>
          <div className="hidden text-right text-xs leading-5 text-white/45 xl:block">
            Inventario<br />Inteligente
          </div>
        </div>
      </section>

      {/* Formulario */}
      <section className="flex min-h-screen flex-col items-center justify-center px-5 py-8 sm:px-10 lg:px-12">
        {/* Marca visible en pantallas pequeñas */}
        <div className="mb-8 flex w-full max-w-md items-center gap-3 lg:hidden">
          <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl">
            <Image
              src="/img/logo.jpeg"
              alt="Logo El Balcón del Cielo"
              width={80}
              height={80}
              priority
              className="h-full w-full object-cover"
            />
          </div>

          <div>
            <p className="font-serif text-xl font-semibold text-[#243c32]">
              El Balcón del Cielo
            </p>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7b856d]">
              Restaurante · Mirador
            </p>
          </div>
        </div>

        <div className="w-full max-w-md">
          <div className="mb-8">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#8a956f]">Inventario inteligente</p>
            <h2 className="mt-3 font-serif text-3xl font-semibold tracking-tight text-[#243c32] sm:text-4xl">
              ¡Qué bueno tenerte aquí!
            </h2>
            <p className="mt-3 text-sm leading-6 text-[#73786f]">
              Ingresa con tu cuenta para administrar el inventario del restaurante.
            </p>
          </div>

          {errores.general && (
            <div role="alert" className="mb-5 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <span className="mt-0.5 shrink-0"><CircleAlert /></span>
              <p>{errores.general}</p>
            </div>
          )}

          <form onSubmit={manejarEnvio} noValidate className="space-y-5">
            <div>
              <label htmlFor="correo" className="mb-2 block text-sm font-semibold text-[#39483d]">
                Correo electrónico <span className="text-[#b65f43]">*</span>
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#8a958a]">
                  <Mail />
                </span>
                <input
                  id="correo"
                  name="correo"
                  type="email"
                  autoComplete="email"
                  value={correo}
                  onChange={(e) => {
                    setCorreo(e.target.value);
                    if (errores.correo) setErrores((prev) => ({ ...prev, correo: undefined }));
                  }}
                  disabled={cargando}
                  placeholder="usuario@ejemplo.com"
                  aria-invalid={Boolean(errores.correo)}
                  aria-describedby={errores.correo ? "correo-error" : undefined}
                  className={`w-full rounded-xl border bg-white py-3.5 pl-12 pr-4 text-sm text-[#25372c] outline-none transition placeholder:text-[#a3a89f] focus:ring-4 disabled:cursor-not-allowed disabled:bg-[#f0eee7] ${
                    errores.correo
                      ? "border-red-400 focus:border-red-400 focus:ring-red-100"
                      : "border-[#d9ddd2] hover:border-[#9ba88f] focus:border-[#647c5d] focus:ring-[#647c5d]/10"
                  }`}
                />
              </div>
              {errores.correo && (
                <p id="correo-error" className="mt-2 flex items-center gap-1 text-xs text-red-600">
                  <CircleAlert /> {errores.correo}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-semibold text-[#39483d]">
                Contraseña <span className="text-[#b65f43]">*</span>
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#8a958a]">
                  <LockKeyhole />
                </span>
                <input
                  id="password"
                  name="password"
                  type={mostrarPass ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errores.password) setErrores((prev) => ({ ...prev, password: undefined }));
                  }}
                  disabled={cargando}
                  placeholder="Ingresa tu contraseña"
                  aria-invalid={Boolean(errores.password)}
                  aria-describedby={errores.password ? "password-error" : undefined}
                  className={`w-full rounded-xl border bg-white py-3.5 pl-12 pr-12 text-sm text-[#25372c] outline-none transition placeholder:text-[#a3a89f] focus:ring-4 disabled:cursor-not-allowed disabled:bg-[#f0eee7] ${
                    errores.password
                      ? "border-red-400 focus:border-red-400 focus:ring-red-100"
                      : "border-[#d9ddd2] hover:border-[#9ba88f] focus:border-[#647c5d] focus:ring-[#647c5d]/10"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setMostrarPass(!mostrarPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-[#879184] transition hover:bg-[#f3f2eb] hover:text-[#344a38] focus:outline-none focus:ring-2 focus:ring-[#647c5d]/30"
                  aria-label={mostrarPass ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {mostrarPass ? <EyeOff /> : <Eye />}
                </button>
              </div>
              {errores.password && (
                <p id="password-error" className="mt-2 flex items-center gap-1 text-xs text-red-600">
                  <CircleAlert /> {errores.password}
                </p>
              )}
            </div>

            <button
              id="btn-login"
              type="submit"
              disabled={cargando}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#b66e48] px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#b66e48]/20 transition duration-200 hover:-translate-y-0.5 hover:bg-[#9e5b39] focus:outline-none focus:ring-4 focus:ring-[#b66e48]/25 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {cargando ? (
                <>
                  <LoaderCircle />
                  Iniciando sesión...
                </>
              ) : (
                <>
                  Iniciar sesión
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                  </svg>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 flex items-start gap-3 rounded-xl border border-[#e0e3d8] bg-white/70 p-4">
            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#e8ede2] text-[#4d684d]">
              <LockKeyhole />
            </span>
            <div>
              <p className="text-sm font-semibold text-[#39483d]">Acceso protegido</p>
              <p className="mt-1 text-xs leading-5 text-[#73786f]">
                Este sistema es de uso interno. Si no tienes credenciales o necesitas ayuda, contacta al administrador.
              </p>
            </div>
          </div>

          <p className="mt-8 text-center text-xs leading-5 text-[#969b91]">
           © 2026 El Balcón del Cielo
            <span className="mx-2">·</span>
            Inventario Inteligente
          </p>
        </div>
      </section>
    </main>
  );
}
