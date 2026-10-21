const DEFAULT_TIMEOUT_MS = 20_000;

export type N8nWebhookResponse = {
  ok: boolean;
  status: number;
  /** Corpo da resposta já sem espaços nas pontas. */
  text: string;
};

/** Lê a URL do webhook de uma variável de ambiente, com valor padrão. */
export function webhookUrl(envName: string, fallback: string): string {
  return process.env[envName]?.trim() || fallback;
}

/** POSTa um JSON no webhook do n8n e devolve a resposta crua para o chamador interpretar. */
export async function postToN8n(
  url: string,
  payload: unknown,
  timeoutMs: number = DEFAULT_TIMEOUT_MS,
): Promise<N8nWebhookResponse> {
  const secret = process.env.N8N_WEBHOOK_SECRET?.trim();

  let response: Response;

  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(secret ? { "X-Webhook-Secret": secret } : {}),
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(timeoutMs),
      cache: "no-store",
    });
  } catch (error) {
    if (error instanceof Error && error.name === "TimeoutError") {
      throw new Error("O fluxo do n8n não respondeu a tempo.");
    }

    throw new Error("Não foi possível alcançar o webhook do n8n.");
  }

  return {
    ok: response.ok,
    status: response.status,
    text: (await response.text()).trim(),
  };
}

function readJson(text: string): unknown {
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

/** Nome do primeiro item quando o n8n devolve um array com um registro só. */
function firstRecord(value: unknown): Record<string, unknown> | null {
  const item = Array.isArray(value) ? value[0] : value;

  return item && typeof item === "object" ? (item as Record<string, unknown>) : null;
}

/** Campo `erro` que os fluxos devolvem quando a transformação falha. */
export function readWebhookError(text: string): string | null {
  const record = firstRecord(readJson(text));
  const erro = record?.erro;

  return typeof erro === "string" && erro.trim() ? erro.trim() : null;
}

/** Campo `ai_score` gravado pelo fluxo de score. */
export function readWebhookScore(text: string): number | null {
  const record = firstRecord(readJson(text));
  const score = Number(record?.ai_score);

  return Number.isFinite(score) ? score : null;
}

/** Campo `mensagem` devolvido pelo fluxo da tendência. */
export function readWebhookMessage(text: string): string | null {
  const record = firstRecord(readJson(text));
  const mensagem = record?.mensagem;

  return typeof mensagem === "string" && mensagem.trim()
    ? mensagem.trim()
    : null;
}

/** Mensagem curta para o toast quando a resposta não veio 2xx. */
export function describeWebhookFailure(response: N8nWebhookResponse): string {
  const erro = readWebhookError(response.text);

  if (erro) return `O n8n respondeu com ${response.status}: ${erro}`;

  return response.text
    ? `O n8n respondeu com ${response.status}: ${response.text.slice(0, 200)}`
    : `O n8n respondeu com ${response.status}.`;
}
