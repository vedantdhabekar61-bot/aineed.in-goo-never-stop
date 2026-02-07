
import { GoogleGenAI } from "@google/genai";
// Explicitly importing from index to resolve module ambiguity between directory and file
import { ToolRecommendation, GroundingSource } from "../../../types/index";

export async function POST(req: Request) {
  try {
    const { query } = await req.json();
    if (!query) return Response.json({ error: "Query is required" }, { status: 400 });

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `User Problem: "${query}"
Find 3-5 real-world AI tools that solve this problem. 
Return ONLY JSON:
{
  "recommendations": [
    {
      "name": "Tool Name",
      "description": "Short description",
      "reasoning": "Why it fits",
      "url": "https://..."
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: { tools: [{ googleSearch: {} }] },
    });

    const sources: GroundingSource[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks) {
      chunks.forEach((chunk: any) => {
        if (chunk.web) sources.push({ title: chunk.web.title || "Source", uri: chunk.web.uri || "#" });
      });
    }

    const text = response.text || "{}";
    const cleaned = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    return Response.json({ result: { recommendations: parsed.recommendations, sources } });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
