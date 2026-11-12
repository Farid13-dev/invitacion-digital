import corona from "@/assets/ornamentos/corona.png?w=320;640&format=avif;webp;png&as=picture";
import flores from "@/assets/ornamentos/flores.png?w=320;640;960&format=avif;webp;png&as=picture";
import ramo from "@/assets/ornamentos/ramo.png?w=160;320;480&format=avif;webp;png&as=picture";
import type { ImagenResponsive } from "@/config/tipos";
import { cn } from "@/lib/cn";
import { Imagen } from "./Imagen";

type Props = { className?: string };

/**
 * Acuarelas florales de la invitación (procedencia en
 * `src/assets/ornamentos/LEEME.md`).
 *
 * Son puramente decorativas: `alt=""` y `aria-hidden` para que un lector de
 * pantalla no anuncie diez "imagen" seguidas, y `pointer-events-none` para
 * que no roben clics a los botones que quedan debajo. La posición y el tamaño
 * llegan siempre por `className`.
 */
function Adorno({
  imagen,
  sizes,
  prioritario = false,
  className,
}: Props & { imagen: ImagenResponsive; sizes: string; prioritario?: boolean }) {
  return (
    <div aria-hidden="true" className={cn("pointer-events-none select-none", className)}>
      <Imagen
        imagen={imagen}
        alt=""
        sizes={sizes}
        loading={prioritario ? "eager" : "lazy"}
        fetchPriority={prioritario ? "high" : undefined}
        className="h-auto w-full"
      />
    </div>
  );
}

/** Ramo de esquina: rosas amarillas y blancas con mimosa y eucalipto. */
export function Ramo({ className }: Props) {
  return <Adorno imagen={ramo} sizes="(min-width: 768px) 192px, 160px" className={className} />;
}

/**
 * Guirnalda horizontal del portón. Es lo primero que ve el invitado, así
 * que se pide de inmediato y con prioridad alta. La máscara funde su borde
 * inferior para que parezca apoyada sobre el filete que la sigue.
 */
export function Guirnalda({ invertida = false, className }: Props & { invertida?: boolean }) {
  return (
    <Adorno
      imagen={flores}
      sizes="(min-width: 1024px) 384px, (min-width: 640px) 320px, 224px"
      prioritario
      className={cn(
        "[mask-image:linear-gradient(to_bottom,black_70%,transparent)]",
        invertida && "rotate-180",
        className,
      )}
    />
  );
}

/** Marco hexagonal dorado con flores: enmarca la cuenta regresiva. */
export function Corona({ className }: Props) {
  return <Adorno imagen={corona} sizes="(min-width: 768px) 416px, 90vw" className={className} />;
}
