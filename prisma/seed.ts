import { PrismaClient, type PromiseStatus } from "@prisma/client";
import { computeScore, DEFAULT_DIMENSIONS, type EvidenceInput } from "../src/lib/scoring";

const prisma = new PrismaClient();

// ─────────────────────────────────────────────────────────────
// DATOS DE EJEMPLO (España)
// Nota: los partidos son reales; los textos de promesa y las
// evidencias son ILUSTRATIVOS, con fines de demostración del
// sistema de seguimiento. No constituyen una valoración oficial.
// ─────────────────────────────────────────────────────────────

const PARTIES = [
  { shortName: "PSOE", name: "Partido Socialista Obrero Español", candidate: "Pedro Sánchez" },
  { shortName: "PP", name: "Partido Popular", candidate: "Alberto Núñez Feijóo" },
  { shortName: "VOX", name: "Vox", candidate: "Santiago Abascal" },
  { shortName: "SUMAR", name: "Sumar", candidate: "Yolanda Díaz" },
  { shortName: "ERC", name: "Esquerra Republicana de Catalunya", candidate: "Gabriel Rufián" },
  { shortName: "PNV", name: "Euzko Alderdi Jeltzalea – Partido Nacionalista Vasco", candidate: "Aitor Esteban" },
] as const;

type PartyKey = (typeof PARTIES)[number]["shortName"];

interface PromiseSeed {
  party: PartyKey;
  topic: string;
  title: string;
  description: string;
}

// Promesas ilustrativas por partido y tema.
const PROMISES: PromiseSeed[] = [
  {
    party: "PSOE",
    topic: "vivienda",
    title: "Movilizar suelo público para vivienda asequible",
    description:
      "Compromiso de destinar suelo y parque público a la construcción de vivienda de alquiler asequible.",
  },
  {
    party: "PSOE",
    topic: "empleo",
    title: "Reducir la jornada laboral máxima legal",
    description:
      "Reducción de la jornada laboral máxima sin merma salarial mediante reforma del Estatuto de los Trabajadores.",
  },
  {
    party: "PSOE",
    topic: "pensiones",
    title: "Revalorizar las pensiones con el IPC",
    description:
      "Mantener la revalorización anual de las pensiones conforme al índice de precios al consumo.",
  },
  {
    party: "PP",
    topic: "economia",
    title: "Bajada del IRPF a rentas medias y bajas",
    description:
      "Rebaja fiscal en el impuesto sobre la renta dirigida a rentas medias y bajas.",
  },
  {
    party: "PP",
    topic: "sanidad",
    title: "Plan nacional de reducción de listas de espera",
    description:
      "Plan de choque coordinado con las comunidades autónomas para reducir las listas de espera quirúrgicas.",
  },
  {
    party: "PP",
    topic: "vivienda",
    title: "Avales públicos para la compra de primera vivienda a jóvenes",
    description:
      "Sistema de avales del Estado para facilitar el acceso de los jóvenes a su primera vivienda.",
  },
  {
    party: "VOX",
    topic: "economia",
    title: "Simplificar la fiscalidad y reducir impuestos",
    description:
      "Reducción y unificación de figuras tributarias para aliviar la carga fiscal de familias y autónomos.",
  },
  {
    party: "VOX",
    topic: "justicia",
    title: "Reforma del sistema de elección del Poder Judicial",
    description:
      "Cambio en el modelo de elección de los órganos de gobierno del poder judicial.",
  },
  {
    party: "SUMAR",
    topic: "empleo",
    title: "Jornada laboral de 32 horas semanales",
    description:
      "Implantación progresiva de la semana laboral de cuatro días sin reducción salarial.",
  },
  {
    party: "SUMAR",
    topic: "derechos",
    title: "Ampliar los permisos de nacimiento y cuidados",
    description:
      "Ampliación de los permisos por nacimiento y cuidado equiparados e intransferibles.",
  },
  {
    party: "SUMAR",
    topic: "medioambiente",
    title: "Impulsar el transporte público gratuito de cercanías",
    description:
      "Extensión de la gratuidad en los abonos de transporte público de cercanías y media distancia.",
  },
  {
    party: "ERC",
    topic: "transporte",
    title: "Traspaso integral de Rodalies a la Generalitat",
    description:
      "Transferencia de la gestión completa de la red de cercanías ferroviarias a la administración catalana.",
  },
  {
    party: "ERC",
    topic: "educacion",
    title: "Aumentar la inversión educativa hasta el 6% del PIB",
    description:
      "Incremento progresivo del gasto público en educación hasta alcanzar el 6% del PIB.",
  },
  {
    party: "PNV",
    topic: "pensiones",
    title: "Gestión de la Seguridad Social en Euskadi",
    description:
      "Transferencia del régimen económico de la Seguridad Social a la comunidad autónoma vasca.",
  },
  {
    party: "PNV",
    topic: "economia",
    title: "Reforzar la financiación del sistema de conciertos",
    description:
      "Actualización del sistema de financiación autonómica y del cupo conforme a lo pactado.",
  },
  {
    party: "PSOE",
    topic: "sanidad",
    title: "Reforzar la atención primaria en el sistema público",
    description:
      "Incremento de recursos y personal en atención primaria del Sistema Nacional de Salud.",
  },
  {
    party: "PP",
    topic: "educacion",
    title: "Pacto nacional por la educación y el MIR educativo",
    description:
      "Impulso de un pacto de Estado por la educación y de un sistema de acceso docente tipo MIR.",
  },
  {
    party: "VOX",
    topic: "medioambiente",
    title: "Revisar la política de transición energética",
    description:
      "Revisión del calendario y de los objetivos de la política de transición energética estatal.",
  },
];

async function main() {
  // Dimensiones de scoring
  for (const d of DEFAULT_DIMENSIONS) {
    await prisma.scoringDimension.upsert({
      where: { key: d.key },
      update: { weight: d.weight, label: d.label },
      create: { key: d.key, label: d.label, weight: d.weight },
    });
  }

  // Usuario analista (autor)
  const analyst = await prisma.user.upsert({
    where: { email: "analista@promesometro.local" },
    update: {},
    create: {
      email: "analista@promesometro.local",
      name: "Equipo de análisis",
      role: "ANALYST",
    },
  });

  // Elección de referencia
  const generales = await prisma.election.upsert({
    where: {
      countryCode_name: { countryCode: "ES", name: "Elecciones Generales 2023" },
    },
    update: {},
    create: {
      countryCode: "ES",
      name: "Elecciones Generales 2023",
      type: "general",
      electionDate: new Date("2023-07-23"),
    },
  });

  // Partidos reales + candidaturas
  const partyByKey = new Map<PartyKey, { id: string }>();
  for (const p of PARTIES) {
    const party = await prisma.party.upsert({
      where: { countryCode_shortName: { countryCode: "ES", shortName: p.shortName } },
      update: { name: p.name },
      create: { countryCode: "ES", shortName: p.shortName, name: p.name },
    });
    partyByKey.set(p.shortName, party);

    await prisma.candidate.upsert({
      where: { fullName_electionId: { fullName: p.candidate, electionId: generales.id } },
      update: {},
      create: {
        fullName: p.candidate,
        partyId: party.id,
        electionId: generales.id,
      },
    });
  }

  // Fuentes de evidencia
  const boe = await prisma.evidenceSource.upsert({
    where: { name: "BOE" },
    update: {},
    create: {
      name: "BOE",
      type: "official",
      baseUrl: "https://www.boe.es",
      trustWeight: 0.95,
    },
  });
  const congreso = await prisma.evidenceSource.upsert({
    where: { name: "Congreso de los Diputados" },
    update: {},
    create: {
      name: "Congreso de los Diputados",
      type: "official",
      baseUrl: "https://www.congreso.es",
      trustWeight: 0.9,
    },
  });
  const prensa = await prisma.evidenceSource.upsert({
    where: { name: "Medio generalista" },
    update: {},
    create: { name: "Medio generalista", type: "press", trustWeight: 0.55 },
  });

  const dims: EvidenceInput["dimension"][] = [
    "avance_legislativo",
    "presupuesto",
    "ejecucion",
    "impacto",
  ];

  let i = 0;
  for (const seed of PROMISES) {
    i += 1;
    const party = partyByKey.get(seed.party)!;
    const slug = `${seed.party.toLowerCase()}-${seed.topic}-${i}`;

    const candidate = await prisma.candidate.findFirst({
      where: { partyId: party.id, electionId: generales.id },
      select: { id: true },
    });

    const promise = await prisma.promise.upsert({
      where: { slug },
      update: {
        title: seed.title,
        description: seed.description,
        topic: seed.topic,
      },
      create: {
        slug,
        title: seed.title,
        description: seed.description,
        topic: seed.topic,
        electionId: generales.id,
        partyId: party.id,
        candidateId: candidate?.id,
        authorId: analyst.id,
        isPublished: true,
      },
    });

    // Evidencias sintéticas deterministas (patrón reproducible por índice)
    await prisma.evidenceItem.deleteMany({ where: { promiseId: promise.id } });
    const evidenceInputs: EvidenceInput[] = [];
    for (let j = 0; j < dims.length; j++) {
      const dimension = dims[j]!;
      const source = j === 0 ? boe : j === 1 ? congreso : prensa;
      const supports = (i + j) % 3 !== 0; // patrón determinista
      await prisma.evidenceItem.create({
        data: {
          promiseId: promise.id,
          sourceId: source.id,
          url: `https://ejemplo.local/evidencia/${slug}/${dimension}`,
          title: `Evidencia sobre ${dimension.replace("_", " ")}`,
          excerpt:
            "Referencia ilustrativa a documentación pública para demostrar el seguimiento.",
          dimension,
          supportsProgress: supports,
          verified: source.type === "official",
        },
      });
      evidenceInputs.push({
        dimension,
        supportsProgress: supports,
        verified: source.type === "official",
        trustWeight: source.trustWeight,
      });
    }

    const result = computeScore(evidenceInputs);
    const status: PromiseStatus =
      result.scoreValue >= 85
        ? "cumplida"
        : result.scoreValue >= 60
        ? "parcialmente_cumplida"
        : result.scoreValue >= 25
        ? "en_progreso"
        : "no_iniciada";

    await prisma.promiseScore.create({
      data: {
        promiseId: promise.id,
        scoreValue: result.scoreValue,
        breakdown: result.breakdown,
        confidence: result.confidence,
        algoVersion: result.algoVersion,
        computedById: analyst.id,
        isPublished: true,
      },
    });

    await prisma.promiseStatusHistory.create({
      data: {
        promiseId: promise.id,
        toStatus: status,
        reason: "Estado inicial derivado de la evidencia registrada (seed).",
        changedById: analyst.id,
      },
    });

    await prisma.promise.update({
      where: { id: promise.id },
      data: { currentScore: result.scoreValue, currentStatus: status },
    });
  }

  console.log(
    `Seed completado: ${PARTIES.length} partidos, ${PROMISES.length} promesas.`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
