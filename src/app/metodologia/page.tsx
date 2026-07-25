import { STATUS_META, STATUS_ORDER } from "@/lib/ui";
import { DEFAULT_DIMENSIONS } from "@/lib/scoring";

export const metadata = {
  title: "Metodología · Promesómetro",
};

export default function MethodologyPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-10">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Metodología</h1>
        <p className="mt-2 text-lg text-gray-600">
          Cómo seguimos las promesas, cómo puntuamos su cumplimiento y cómo
          mantenemos la independencia.
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Independencia</h2>
        <p className="text-gray-600">
          Promesómetro es un proyecto de interés público que no está afiliado a
          ningún partido, campaña ni institución. Todas las promesas parten de
          documentos públicos (programas electorales, boletines oficiales,
          diarios de sesiones) y se contrastan con evidencia verificable.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Estados de una promesa</h2>
        <p className="text-gray-600">
          Cada promesa tiene un estado editorial derivado de la evidencia y
          revisado antes de publicarse.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {STATUS_ORDER.map((status) => {
            const meta = STATUS_META[status];
            return (
              <div
                key={status}
                className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-4"
              >
                <span
                  className="mt-1 h-3 w-3 shrink-0 rounded-full"
                  style={{ backgroundColor: meta.color }}
                />
                <div>
                  <div className="font-medium text-gray-900">{meta.label}</div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Puntuación (0–100)</h2>
        <p className="text-gray-600">
          La puntuación de cumplimiento es explicable y reproducible: los mismos
          datos producen siempre el mismo resultado. Se calcula ponderando
          cuatro dimensiones, cada una alimentada por evidencia verificada y
          matizada por la confianza de la fuente.
        </p>
        <div className="overflow-hidden rounded-lg border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-500">
              <tr>
                <th className="px-4 py-2 font-medium">Dimensión</th>
                <th className="px-4 py-2 font-medium">Peso</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {DEFAULT_DIMENSIONS.map((d) => (
                <tr key={d.key}>
                  <td className="px-4 py-2 text-gray-800">{d.label}</td>
                  <td className="px-4 py-2 text-gray-500">
                    {Math.round(d.weight * 100)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-sm text-gray-500">
          La confianza de cada evidencia depende del tipo de fuente (oficial,
          prensa, ONG, académica) y de si ha sido verificada. La evidencia sin
          verificar aporta la mitad de peso.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Trazabilidad</h2>
        <p className="text-gray-600">
          Cada cambio de estado y cada cálculo de puntuación queda registrado
          con su motivo y versión del algoritmo, de forma que cualquier persona
          pueda auditar cómo se llegó a una conclusión.
        </p>
      </section>
    </div>
  );
}
