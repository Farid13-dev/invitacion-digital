import { useMemo } from "react";
import { parseInvitado, type GrupoInvitado } from "@/lib/invitados";
import { normalizarTelefono } from "@/lib/telefono";

export type Invitado = {
  grupo: GrupoInvitado;
  /** Cadena original de `?inv=`. Se reenvía tal cual para que la fila de la hoja coincida. */
  grupoBruto: string;
  telefono: string;
  /** Firma HMAC de `?f=`: prueba que el enlace lo generamos nosotros. */
  firma: string;
  /** Falso cuando alguien abre la invitación sin enlace personalizado. */
  identificado: boolean;
};

/**
 * Lee la identidad del invitado de la URL: `?inv=<nombres>&tel=<telefono>&f=<firma>`.
 *
 * Se resuelve en el primer render, no en un efecto. Leerlo en un `useEffect`
 * provoca un parpadeo: el invitado ve un instante el saludo genérico antes de
 * que aparezca su nombre.
 */
export function useInvitado(): Invitado {
  return useMemo(() => {
    const params = new URLSearchParams(window.location.search);

    // URLSearchParams ya decodifica; decodeURIComponent otra vez rompería
    // cualquier nombre que contenga un "%" literal.
    const grupoBruto = (params.get("inv") ?? "").trim();
    const telefono = normalizarTelefono(params.get("tel"));
    const firma = (params.get("f") ?? "").trim();

    const grupo = parseInvitado(grupoBruto);

    return {
      grupo,
      grupoBruto,
      telefono,
      firma,
      identificado: grupo.todos.length > 0 && telefono !== "",
    };
  }, []);
}
