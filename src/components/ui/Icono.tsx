import type { ReactNode } from "react";
import type { NombreIcono } from "@/config/tipos";
import { cn } from "@/lib/cn";

/**
 * Iconos de trazo fino, en SVG en línea.
 *
 * No es una librería de iconos a propósito: diez dibujos pesan menos que el
 * import de cualquier paquete y no añaden una dependencia que mantener.
 */
const TRAZOS: Record<NombreIcono, ReactNode> = {
  anillos: (
    <>
      <circle cx="9" cy="14.5" r="5" />
      <circle cx="15" cy="14.5" r="5" />
      <path d="m13.6 6.8 1.4-2 1.4 2-1.4 1.4-1.4-1.4Z" />
    </>
  ),
  brindis: (
    <>
      <g transform="rotate(-14 8.5 12)">
        <path d="M6.6 4h3.8v5.2a1.9 1.9 0 0 1-3.8 0V4Z" />
        <path d="M8.5 11.1V19M6.6 19h3.8M6.6 7h3.8" />
      </g>
      <g transform="rotate(14 15.5 12)">
        <path d="M13.6 4h3.8v5.2a1.9 1.9 0 0 1-3.8 0V4Z" />
        <path d="M15.5 11.1V19M13.6 19h3.8M13.6 7h3.8" />
      </g>
      <path d="M12 1.6v1.6M9.9 2.4l.8 1M14.1 2.4l-.8 1" />
    </>
  ),
  calendario: (
    <>
      <rect x="4" y="5" width="16" height="15.5" rx="2" />
      <path d="M4 9.6h16M8.5 3v4M15.5 3v4" />
    </>
  ),
  camara: (
    <>
      <path d="M4 8.5A1.5 1.5 0 0 1 5.5 7h2.3l1.4-2h5.6l1.4 2h2.3A1.5 1.5 0 0 1 20 8.5v9A1.5 1.5 0 0 1 18.5 19h-13A1.5 1.5 0 0 1 4 17.5v-9Z" />
      <circle cx="12" cy="13" r="3.4" />
    </>
  ),
  iglesia: (
    <>
      <path d="M12 2v4M10.2 3.6h3.6M5 11.2 12 6l7 5.2" />
      <path d="M6.2 10.4V21h11.6V10.4M10 21v-3.6a2 2 0 0 1 4 0V21M3.5 21h17" />
      <circle cx="12" cy="12.6" r="1.4" />
    </>
  ),
  musica: (
    <>
      <path d="M9 18V5.5l11-2V16" />
      <circle cx="6.5" cy="18" r="2.5" />
      <circle cx="17.5" cy="16" r="2.5" />
    </>
  ),
  nota: (
    <>
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <path d="M8.5 8h7M8.5 11.5h7M8.5 15h4" />
    </>
  ),
  percha: (
    <>
      <path d="M10 5.4a2 2 0 1 1 2.9 1.8c-.5.3-.9.7-.9 1.3V9.2" />
      <path d="M12 9.2 3.4 15.6c-.8.6-.4 1.6.6 1.6h16c1 0 1.4-1 .6-1.6L12 9.2Z" />
    </>
  ),
  regalo: (
    <>
      <rect x="4" y="10" width="16" height="10.5" rx="1" />
      <rect x="3" y="7" width="18" height="3" rx="0.8" />
      <path d="M12 7v13.5M12 7c-1.6-3.2-5.4-3.6-5.4-1.3C6.6 7 8.8 7 12 7Zm0 0c1.6-3.2 5.4-3.6 5.4-1.3C17.4 7 15.2 7 12 7Z" />
    </>
  ),
};

export function Icono({ nombre, className }: { nombre: NombreIcono; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.1"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={cn("size-8", className)}
    >
      {TRAZOS[nombre]}
    </svg>
  );
}

/** El icono dentro de un círculo blanco con sombra rosa: cabecera de cada evento. */
export function CirculoIcono({ nombre }: { nombre: NombreIcono }) {
  return (
    <div className="mx-auto flex size-24 items-center justify-center rounded-full border border-borde bg-marfil text-rosa-claro shadow-rosa md:size-28">
      <Icono nombre={nombre} className="size-11 md:size-12" />
    </div>
  );
}
