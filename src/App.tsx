import { useState } from "react";
import { MusicaFondo } from "@/components/MusicaFondo";
import { Bienvenida } from "@/components/secciones/Bienvenida";
import { Cierre } from "@/components/secciones/Cierre";
import { Confirmacion } from "@/components/secciones/Confirmacion";
import { CuentaRegresiva } from "@/components/secciones/CuentaRegresiva";
import { Detalles } from "@/components/secciones/Detalles";
import { Eventos } from "@/components/secciones/Eventos";
import { Galeria } from "@/components/secciones/Galeria";
import { Invitados } from "@/components/secciones/Invitados";
import { Portada } from "@/components/secciones/Portada";
import { Regalos } from "@/components/secciones/Regalos";
import { evento } from "@/config/evento";
import { useBloqueoScroll } from "@/hooks/useBloqueoScroll";
import { useInvitado } from "@/hooks/useInvitado";
import { useRsvp } from "@/hooks/useRsvp";

type Entrada = { hecha: boolean; conMusica: boolean };

/**
 * Composición de la invitación.
 *
 * Este archivo es deliberadamente aburrido: enchufa la configuración a las
 * secciones y no decide nada más. Ninguna sección sabe de qué boda se trata,
 * y añadir o quitar una es mover una línea de aquí.
 */
export function App() {
  const [entrada, setEntrada] = useState<Entrada>({ hecha: false, conMusica: false });

  const invitado = useInvitado();
  const rsvp = useRsvp(invitado, evento.rsvp);

  // Basta con haber entrado: el botón de la música existe aunque el invitado
  // eligiera el silencio, para que pueda cambiar de idea sin recargar.
  const hayMusica = entrada.hecha && evento.musica !== null;

  // La bienvenida es una capa fija; sin esto la página de debajo se
  // desplaza igual y el invitado entra a mitad de la invitación.
  useBloqueoScroll(!entrada.hecha);

  return (
    <main className="relative bg-background">
      {!entrada.hecha && (
        <Bienvenida
          saludo={evento.bienvenida.saludo}
          notaMusica={evento.musica?.nota ?? null}
          alEntrar={(conMusica) => setEntrada({ hecha: true, conMusica })}
        />
      )}

      {/* El archivo no se descarga hasta que alguien pide la música: el
          componente monta el botón, pero deja el <audio> sin `src`. */}
      {hayMusica && evento.musica && (
        <MusicaFondo archivo={evento.musica.archivo} arrancarSonando={entrada.conMusica} />
      )}

      <Portada pareja={evento.pareja} portada={evento.portada} />
      <CuentaRegresiva {...evento.cuentaRegresiva} />
      <Invitados grupo={invitado.grupo} textos={evento.invitados} />
      <Eventos eventos={evento.eventos} />
      <Confirmacion grupo={invitado.grupo} identificado={invitado.identificado} rsvp={rsvp} />
      <Galeria galeria={evento.galeria} />
      <Detalles detalles={evento.detalles} />
      <Regalos regalos={evento.regalos} />
      <Cierre pareja={evento.pareja} cierre={evento.cierre} portada={evento.portada} />
    </main>
  );
}
