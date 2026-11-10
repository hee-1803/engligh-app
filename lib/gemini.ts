import { GoogleGenAI } from "@google/genai";

// Chỉ import file này ở phía server (route.ts, server action)
// Tắt tự thử lại của thư viện: route /api/ai tự quyết định thử lại hay chuyển sang chấm cơ bản
export const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY!, httpOptions: { retryOptions: { attempts: 1 } } });
export const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

export async function askJSON<T>(system: string, prompt: string, schema: object): Promise<T> {
  const res = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
    config: {
      systemInstruction: system,
      responseMimeType: "application/json",
      responseSchema: schema,
      temperature: 0.4,
    },
  });
  return JSON.parse(res.text ?? "{}") as T;
}
