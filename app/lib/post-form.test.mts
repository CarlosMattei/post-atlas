import assert from "node:assert/strict";
import test from "node:test";
import {
  canReject,
  getPrimaryAction,
  getReadiness,
  isDirty,
  type PostFormValues,
  type PostReadiness,
} from "./post-form.ts";

function values(overrides: Partial<PostFormValues> = {}): PostFormValues {
  return {
    title: "Como estruturei meu segundo cérebro",
    body: "Um passo a passo honesto sobre captura, conexão e revisão.",
    tags: ["produtividade", "obsidian"],
    images: [],
    strategy: "fila",
    scheduledAtDraft: "",
    ...overrides,
  };
}

function ready(overrides: Partial<PostReadiness> = {}): PostReadiness {
  return {
    title: true,
    body: true,
    tags: true,
    strategy: true,
    contentReady: true,
    allReady: true,
    ...overrides,
  };
}

test("isDirty: valores iguais não sujam o formulário", () => {
  const saved = values();

  assert.equal(isDirty(values(), saved), false);
});

test("isDirty: título, texto, tags, imagens, estratégia e data contam", () => {
  const saved = values();

  assert.equal(isDirty(values({ title: "Outro título" }), saved), true);
  assert.equal(isDirty(values({ body: "Outro texto" }), saved), true);
  assert.equal(isDirty(values({ strategy: "fixo" }), saved), true);
  assert.equal(
    isDirty(values({ scheduledAtDraft: "2026-10-22T09:00" }), saved),
    true,
  );
  assert.equal(
    isDirty(values({ tags: ["obsidian", "produtividade"] }), saved),
    true,
  );
  assert.equal(
    isDirty(
      values({
        images: [{ id: "img-1", url: "blob:1", alt: "Capa" }],
      }),
      saved,
    ),
    true,
  );
});

test("isDirty: texto alternativo e ordem das imagens contam", () => {
  const first = { id: "img-1", url: "blob:1", alt: "Capa" };
  const second = { id: "img-2", url: "blob:2", alt: "Detalhe" };
  const saved = values({ images: [first, second] });

  assert.equal(isDirty(values({ images: [first, second] }), saved), false);
  assert.equal(
    isDirty(values({ images: [{ ...first, alt: "Nova capa" }, second] }), saved),
    true,
  );
  assert.equal(isDirty(values({ images: [second, first] }), saved), true);
});

test("getReadiness: apenas estratégia fixa exige data", () => {
  assert.deepEqual(getReadiness(values()), {
    title: true,
    body: true,
    tags: true,
    strategy: true,
    contentReady: true,
    allReady: true,
  });

  assert.equal(
    getReadiness(values({ strategy: "fixo", scheduledAtDraft: "" })).strategy,
    false,
  );
  assert.equal(
    getReadiness(values({ strategy: "fixo", scheduledAtDraft: "" })).allReady,
    false,
  );
  assert.equal(
    getReadiness(
      values({ strategy: "fixo", scheduledAtDraft: "2026-10-22T09:00" }),
    ).allReady,
    true,
  );
});

test("getReadiness: título, texto e tags alimentam o checklist", () => {
  const empty = getReadiness(values({ title: "  ", body: "", tags: [] }));

  assert.equal(empty.title, false);
  assert.equal(empty.body, false);
  assert.equal(empty.tags, false);
  assert.equal(empty.contentReady, false);
  assert.equal(empty.allReady, false);

  const noTags = getReadiness(values({ tags: [] }));

  assert.equal(noTags.contentReady, true);
  assert.equal(noTags.allReady, false);
});

test("getPrimaryAction: rascunho aprova e enfileira na estratégia de fila", () => {
  const action = getPrimaryAction("rascunho", "fila", ready());

  assert.equal(action.kind, "approve-queue");
  assert.equal(action.label, "Aprovar e enfileirar");
  assert.equal(action.disabled, false);
});

test("getPrimaryAction: rascunho sem conteúdo fica desabilitado", () => {
  const action = getPrimaryAction(
    "rascunho",
    "fila",
    ready({ title: false, contentReady: false, allReady: false }),
  );

  assert.equal(action.disabled, true);
});

test("getPrimaryAction: rascunho com data fixa aprova e agenda", () => {
  const action = getPrimaryAction("rascunho", "fixo", ready());

  assert.equal(action.kind, "approve-schedule");
  assert.equal(action.label, "Aprovar e agendar");
  assert.equal(action.disabled, false);
});

test("getPrimaryAction: data fixa sem data fica desabilitada", () => {
  const action = getPrimaryAction(
    "reprovado",
    "fixo",
    ready({ strategy: false, allReady: false }),
  );

  assert.equal(action.kind, "approve-schedule");
  assert.equal(action.disabled, true);
  assert.match(action.helper, /Defina data e hora/);
});

test("getPrimaryAction: aprovado envia para a fila ou agenda", () => {
  const queue = getPrimaryAction("aprovado", "fila", ready());
  const schedule = getPrimaryAction("aprovado", "fixo", ready());

  assert.equal(queue.kind, "queue");
  assert.equal(queue.label, "Enviar para a fila");
  assert.equal(queue.disabled, false);

  assert.equal(schedule.kind, "schedule");
  assert.equal(schedule.label, "Agendar");
  assert.equal(schedule.disabled, false);
});

test("getPrimaryAction: agendado oferece cancelar o agendamento", () => {
  const action = getPrimaryAction("agendado", "fixo", ready());

  assert.equal(action.kind, "cancel-schedule");
  assert.equal(action.label, "Cancelar agendamento");
  assert.equal(action.disabled, false);
});

test("getPrimaryAction: arquivado, publicando e publicado ficam indisponíveis", () => {
  for (const status of ["arquivado", "publicando", "publicado"] as const) {
    const action = getPrimaryAction(status, "fila", ready());

    assert.equal(action.kind, "unavailable");
    assert.equal(action.disabled, true);
  }

  assert.equal(
    getPrimaryAction("arquivado", "fila", ready()).label,
    "Restaure o post para continuar",
  );
});

test("getPrimaryAction: erro se comporta como rascunho", () => {
  const action = getPrimaryAction("erro", "fila", ready());

  assert.equal(action.kind, "approve-queue");
  assert.equal(action.disabled, false);
});

test("canReject: apenas status em revisão/fila podem ser reprovados", () => {
  assert.equal(canReject("rascunho"), true);
  assert.equal(canReject("aprovado"), true);
  assert.equal(canReject("agendado"), true);
  assert.equal(canReject("erro"), true);
  assert.equal(canReject("reprovado"), false);
  assert.equal(canReject("publicado"), false);
  assert.equal(canReject("publicando"), false);
  assert.equal(canReject("arquivado"), false);
});
