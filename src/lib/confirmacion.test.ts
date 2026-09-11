import { describe, expect, it } from "vitest";
import {
  despedida,
  etiquetaAccion,
  hayCambios,
  mismasListas,
  resumenGuardado,
  resumirAsistencia,
} from "./confirmacion";

const GRUPO = ["Andrés Betancur", "Laura Mejía", "Tomás", "Sara"];

describe("resumirAsistencia", () => {
  it("separa quiénes van de quiénes no", () => {
    const r = resumirAsistencia(GRUPO, [true, true, false, true]);
    expect(r.asisten).toEqual(["Andrés Betancur", "Laura Mejía", "Sara"]);
    expect(r.noAsisten).toEqual(["Tomás"]);
    expect(r.total).toBe(3);
    expect(r.deCuantos).toBe(4);
  });

  it("detecta que no va nadie", () => {
    const r = resumirAsistencia(GRUPO, [false, false, false, false]);
    expect(r.nadieAsiste).toBe(true);
    expect(r.todosAsisten).toBe(false);
  });

  it("detecta que van todos", () => {
    const r = resumirAsistencia(GRUPO, [true, true, true, true]);
    expect(r.todosAsisten).toBe(true);
    expect(r.nadieAsiste).toBe(false);
  });

  it("una casilla sin valor cuenta como no asiste, no como asiste", () => {
    // Si el array de casillas llega corto, lo que falta no puede colarse
    // como asistente: acabaría en la cuenta que se le da al salón.
    const r = resumirAsistencia(GRUPO, [true]);
    expect(r.asisten).toEqual(["Andrés Betancur"]);
    expect(r.total).toBe(1);
  });

  it("un grupo vacío no asiste ni deja de asistir", () => {
    const r = resumirAsistencia([], []);
    expect(r.total).toBe(0);
    expect(r.todosAsisten).toBe(false);
  });
});

describe("etiquetaAccion", () => {
  it("dice lo mismo en el botón, el título y el envío", () => {
    expect(etiquetaAccion(false)).toBe("Confirmar asistencia");
    expect(etiquetaAccion(true)).toBe("Actualizar asistencia");
  });
});

describe("resumenGuardado", () => {
  it("describe cuántos de cuántos, no un genérico", () => {
    expect(resumenGuardado(resumirAsistencia(GRUPO, [true, true, false, true]))).toBe(
      "Confirmaste 3 de 4 personas. 🎉",
    );
  });

  it("cuando van todos lo dice sin números sueltos", () => {
    expect(resumenGuardado(resumirAsistencia(GRUPO, [true, true, true, true]))).toBe(
      "Confirmaste la asistencia de los 4. 🎉",
    );
  });

  it("a quien viene solo le habla en singular", () => {
    expect(resumenGuardado(resumirAsistencia(["Camila Ospina"], [true]))).toBe(
      "Confirmaste tu asistencia. 🎉",
    );
  });

  it("no celebra a quien acaba de decir que no puede ir", () => {
    const texto = resumenGuardado(resumirAsistencia(GRUPO, [false, false, false, false]));
    expect(texto).toBe("Nos avisaste que no podrán acompañarnos.");
    expect(texto).not.toContain("🎉");
  });

  it("y en singular si iba una sola persona", () => {
    expect(resumenGuardado(resumirAsistencia(["Camila Ospina"], [false]))).toBe(
      "Nos avisaste que no podrás acompañarnos.",
    );
  });
});

describe("despedida", () => {
  it("se despide distinto de quien viene y de quien no", () => {
    expect(despedida(resumirAsistencia(GRUPO, [true, false, false, false]))).toBe(
      "¡Nos vemos en la boda!",
    );
    expect(despedida(resumirAsistencia(GRUPO, [false, false, false, false]))).toBe(
      "Gracias por avisarnos. Los vamos a extrañar.",
    );
  });
});

describe("mismasListas", () => {
  it("ignora el orden", () => {
    expect(mismasListas(["Laura", "Andrés"], ["Andrés", "Laura"])).toBe(true);
  });

  it("distingue contenidos distintos", () => {
    expect(mismasListas(["Andrés"], ["Andrés", "Laura"])).toBe(false);
    expect(mismasListas(["Andrés"], ["Laura"])).toBe(false);
  });

  it("dos listas vacías son iguales", () => {
    expect(mismasListas([], [])).toBe(true);
  });
});

describe("hayCambios", () => {
  const guardado = { asistencia: [true, true, false, true], mensaje: "Allá nos vemos" };

  it("sin nada guardado, siempre hay algo que enviar", () => {
    expect(hayCambios({ asistencia: [true], mensaje: "" }, null)).toBe(true);
  });

  it("reconoce que no se tocó nada", () => {
    expect(hayCambios({ ...guardado }, guardado)).toBe(false);
  });

  it("detecta una casilla cambiada", () => {
    expect(hayCambios({ ...guardado, asistencia: [true, false, false, true] }, guardado)).toBe(
      true,
    );
  });

  it("detecta un mensaje cambiado", () => {
    expect(hayCambios({ ...guardado, mensaje: "Otra cosa" }, guardado)).toBe(true);
  });

  it("los espacios sobrantes del mensaje no son un cambio", () => {
    expect(hayCambios({ ...guardado, mensaje: "  Allá nos vemos  " }, guardado)).toBe(false);
  });

  it("detecta que el grupo del enlace cambió de tamaño", () => {
    expect(hayCambios({ ...guardado, asistencia: [true, true, false] }, guardado)).toBe(true);
  });
});
