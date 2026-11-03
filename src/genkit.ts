import 'dotenv/config';
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

const normalizeModelName = (value: string | undefined): string => {
  const candidate = value?.trim() ?? 'gemini-3.5-flash-lite';
  const withoutProvider = candidate.replace(/^googleai\//i, '');
  return `googleai/${withoutProvider}`;
};

export const modelName = normalizeModelName(process.env.GEMINI_MODEL);

export const ai = genkit({
  plugins: [googleAI()],
  model: modelName,
});
