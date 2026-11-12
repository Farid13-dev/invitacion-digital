import { useCallback, useState } from "react";
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
import { Ola } from "@/components/ui/Ondas";
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
  // El portón sobrevive unos instantes a la entrada para desvanecerse.
  const [portonRetirado, setPortonRetirado] = useState(false);
  const retirarPorton = useCallback(() => setPortonRetirado(true), []);

  const invitado = useInvitado();
  const rsvp = useRsvp(invitado, evento.rsvp);

  // La bienvenida es una capa fija; sin esto la página de debajo se
  // desplaza igual y el invitado entra a mitad de la invitación.
  useBloqueoScroll(!entrada.hecha);

  return (
    <main className="relative overflow-x-hidden">
      {!portonRetirado && (
        <Bienvenida
          pareja={evento.pareja}
          saludo={evento.bienvenida.saludo}
          notaMusica={evento.musica?.nota ?? null}
          saliendo={entrada.hecha}
          alEntrar={(conMusica) => setEntrada({ hecha: true, conMusica })}
          alTerminar={retirarPorton}
        />
      )}

      {/* El botón existe aunque el invitado entrara en silencio, para que
          pueda cambiar de idea sin recargar; el archivo no se descarga hasta
          que alguien pide la música. */}
      {entrada.hecha && evento.musica && (
        <MusicaFondo archivo={evento.musica.archivo} arrancarSonando={entrada.conMusica} />
      )}

      <Portada pareja={evento.pareja} portada={evento.portada} revelada={entrada.hecha} />
      <CuentaRegresiva {...evento.cuentaRegresiva} />
      <Invitados grupo={invitado.grupo} textos={evento.invitados} />
      <Eventos eventos={evento.eventos} />
      <Ola />
      <Confirmacion
        grupo={invitado.grupo}
        identificado={invitado.identificado}
        rsvp={rsvp}
        textos={evento.confirmacion}
      />
      <Galeria galeria={evento.galeria} />
      <Detalles detalles={evento.detalles} invitado={invitado} endpoint={evento.rsvp.endpoint} />
      <Ola invertida />
      <Regalos regalos={evento.regalos} />
      <Cierre
        pareja={evento.pareja}
        cierre={evento.cierre}
        eventos={evento.eventos}
        hayCancion={evento.detalles.cancion !== null}
      />
    </main>
  );
}
