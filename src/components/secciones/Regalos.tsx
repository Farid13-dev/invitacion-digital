import { useState } from "react";
import { Boton } from "@/components/ui/Boton";
import { Modal } from "@/components/ui/Modal";
import { Ornamento } from "@/components/ui/Ornamento";
import { TextoRico } from "@/components/ui/TextoRico";
import { TituloSeccion } from "@/components/ui/TituloSeccion";
import type { Detalle } from "@/config/tipos";

export function Regalos({ regalos }: { regalos: Detalle }) {
  const [abierto, setAbierto] = useState(false);

  return (
    <section className="relative overflow-hidden bg-sage px-6 py-24 text-center">
      <Ornamento className="-bottom-14 -right-14 h-56 w-56 rotate-180 opacity-20" />

      <div className="relative z-10">
        <TituloSeccion tono="claro" subtitulo={regalos.resumen}>
          {regalos.titulo}
        </TituloSeccion>

        <div className="mt-8">
          <Boton onClick={() => setAbierto(true)}>{regalos.cta}</Boton>
        </div>
      </div>

      <Modal abierto={abierto} alCerrar={() => setAbierto(false)} titulo={regalos.titulo}>
        <TextoRico texto={regalos.contenido} />
      </Modal>
    </section>
  );
}
