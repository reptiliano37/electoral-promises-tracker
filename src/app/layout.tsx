import Link from "next/link";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Promesómetro · Seguimiento de promesas electorales",
  description:
    "Monitoriza las promesas electorales de los partidos políticos de España y su grado de cumplimiento, con evidencia verificable y metodología transparente.",
};

const NAV = [
  { href: "/", label: "Inicio" },
  { href: "/promesas", label: "Promesas" },
  { href: "/partidos", label: "Partidos" },
  { href: "/metodologia", label: "Metodología" },
] as const;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="flex min-h-screen flex-col bg-gray-50 text-gray-900 antialiased">
        <header className="sticky top-0 z-20 border-b border-gray-200 bg-white/90 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
            <Link href="/" className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-gray-900 text-sm font-bold text-white">
                P
              </span>
              <span className="text-lg font-bold tracking-tight">
                Promesómetro
              </span>
            </Link>
            <nav className="flex items-center gap-1 text-sm">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-md px-3 py-1.5 font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
          {children}
        </main>

        <footer className="border-t border-gray-200 bg-white">
          <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-gray-500">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="max-w-md">
                <div className="mb-1 font-semibold text-gray-900">
                  Promesómetro
                </div>
                <p>
                  Proyecto de interés público e independiente. No está
                  afiliado a ningún partido, campaña ni institución. Toda la
                  información procede de fuentes públicas verificables.
                </p>
              </div>
              <div className="flex gap-8">
                <div className="space-y-1">
                  <div className="font-semibold text-gray-900">Explorar</div>
                  <Link href="/promesas" className="block hover:text-gray-900">
                    Promesas
                  </Link>
                  <Link href="/partidos" className="block hover:text-gray-900">
                    Partidos
                  </Link>
                  <Link
                    href="/metodologia"
                    className="block hover:text-gray-900"
                  >
                    Metodología
                  </Link>
                </div>
                <div className="space-y-1">
                  <div className="font-semibold text-gray-900">API</div>
                  <a
                    href="/api/v1/promises"
                    className="block hover:text-gray-900"
                  >
                    /api/v1/promises
                  </a>
                </div>
              </div>
            </div>
            <div className="mt-6 border-t border-gray-100 pt-4 text-xs">
              © {new Date().getFullYear()} Promesómetro · Beta · Datos de
              ejemplo con fines demostrativos.
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
