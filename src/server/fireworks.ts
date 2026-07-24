const FIREWORKS_BASE =
  process.env.FIREWORKS_BASE_URL?.replace(/\/$/, "") ||
  "https://api.fireworks.ai/inference/v1";

export interface FireworksResult {
  model_id: string;
  provider: "fireworks";
  text: string;
  tokens_in: number;
  tokens_out: number;
  raw_id?: string;
  mock?: boolean;
}

const DEFAULT_MODEL =
  process.env.FIREWORKS_MODEL || "accounts/fireworks/models/glm-5p1";

export async function fireworksComplete(prompt: string, model = DEFAULT_MODEL): Promise<FireworksResult> {
  const key = process.env.FIREWORKS_API_KEY;
  if (!key) {
    const text = mockExtract(prompt);
    return {
      model_id: "mock/fireworks-offline",
      provider: "fireworks",
      text,
      tokens_in: Math.ceil(prompt.length / 4),
      tokens_out: Math.ceil(text.length / 4),
      mock: true,
    };
  }

  const res = await fetch(`${FIREWORKS_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0,
      max_tokens: 512,
      messages: [
        {
          role: "system",
          content:
            "Extract factual claims as a JSON array of strings. No prose. If none, return [].",
        },
        { role: "user", content: prompt },
      ],
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Fireworks ${res.status}: ${body.slice(0, 400)}`);
  }

  const data = (await res.json()) as {
    id?: string;
    choices?: Array<{ message?: { content?: string } }>;
    usage?: { prompt_tokens?: number; completion_tokens?: number };
  };

  const text = data.choices?.[0]?.message?.content?.trim() || "[]";
  return {
    model_id: model,
    provider: "fireworks",
    text,
    tokens_in: data.usage?.prompt_tokens ?? 0,
    tokens_out: data.usage?.completion_tokens ?? 0,
    raw_id: data.id,
  };
}

function mockExtract(prompt: string): string {
  const lines = prompt
    .split(/[.!\n]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 20)
    .slice(0, 3);
  return JSON.stringify(lines);
}
