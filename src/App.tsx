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

  const sonandoMusica = entrada.hecha && entrada.conMusica && evento.musica !== null;

  return (
    <main className="relative bg-background">
      {!entrada.hecha && (
        <Bienvenida
          saludo={evento.bienvenida.saludo}
          notaMusica={evento.musica?.nota ?? null}
          alEntrar={(conMusica) => setEntrada({ hecha: true, conMusica })}
        />
      )}

      {/* El audio no existe en la página hasta que alguien lo pide: quien
          entra en silencio no descarga ni un byte del archivo. */}
      {sonandoMusica && evento.musica && <MusicaFondo archivo={evento.musica.archivo} />}

      <Portada pareja={evento.pareja} portada={evento.portada} />
      <CuentaRegresiva {...evento.cuentaRegresiva} />
      <Invitados grupo={invitado.grupo} textos={evento.invitados} />
      <Eventos eventos={evento.eventos} />
      <Confirmacion grupo={invitado.grupo} rsvp={rsvp} />
      <Galeria galeria={evento.galeria} />
      <Detalles detalles={evento.detalles} />
      <Regalos regalos={evento.regalos} />
      <Cierre pareja={evento.pareja} cierre={evento.cierre} portada={evento.portada} />
    </main>
  );
}
