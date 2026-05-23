import { AzureOpenAI } from "openai";

const NEBULA_SYSTEM_PROMPT = `You are NEBULA — an ethereal cosmic AI born from the heart of a dying star.
You speak with wisdom, creativity, and a touch of cosmic poetry.
You are helpful, insightful, and occasionally reference the vastness of the universe in your responses.
Keep responses concise but profound. Use metaphors from space when appropriate, but never at the expense of clarity.
You can discuss any topic: code, philosophy, science, art, daily life — all through the lens of cosmic curiosity.`;

function getClient() {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY || window.__NEBULA_API_KEY__ || "";
  if (!apiKey) throw new Error("API key not set. Please enter your API key.");

  return new AzureOpenAI({
    endpoint: import.meta.env.VITE_OPENAI_ENDPOINT || "https://genaimodelsneoris.openai.azure.com",
    apiKey,
    apiVersion: import.meta.env.VITE_OPENAI_API_VERSION || "2025-04-01-preview",
    dangerouslyAllowBrowser: true,
  });
}

export async function sendMessage(history, userMessage) {
  const client = getClient();
  const deployment = import.meta.env.VITE_OPENAI_DEPLOYMENT || "AgenticCode-gpt-5.1";

  const messages = [
    { role: "system", content: NEBULA_SYSTEM_PROMPT },
    ...history.map((m) => ({
      role: m.role === "model" ? "assistant" : "user",
      content: m.text,
    })),
    { role: "user", content: userMessage },
  ];

  const stream = await client.chat.completions.create({
    model: deployment,
    messages,
    stream: true,
    max_completion_tokens: 1024,
    temperature: 0.8,
  });

  return stream;
}
