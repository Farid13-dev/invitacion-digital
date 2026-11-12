import { useState } from "react";
import { Boton } from "@/components/ui/Boton";
import { Modal } from "@/components/ui/Modal";
import { Ramo } from "@/components/ui/Ornamento";
import { TextoRico } from "@/components/ui/TextoRico";
import { TituloSeccion } from "@/components/ui/TituloSeccion";
import type { Detalle } from "@/config/tipos";

export function Regalos({ regalos }: { regalos: Detalle }) {
  const [abierto, setAbierto] = useState(false);

  return (
    <section className="relative px-6 py-16 text-center md:py-24">
      <Ramo className="absolute -left-10 top-10 hidden w-32 md:block" />
      <TituloSeccion subtitulo={regalos.resumen} icono={regalos.icono}>
        {regalos.titulo}
      </TituloSeccion>
      <Boton variante="suave" className="mt-5" onClick={() => setAbierto(true)}>
        {regalos.cta}
      </Boton>

      <Modal abierto={abierto} alCerrar={() => setAbierto(false)} titulo={regalos.titulo}>
        <TextoRico texto={regalos.contenido} />
      </Modal>
    </section>
  );
}
