
import { GoogleGenAI } from "@google/genai";
import { ToolRecommendation, ToolResponse, GroundingSource } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const MODEL_NAME = 'gemini-3-flash-preview';

export async function runGeminiSearch(problemDescription: string): Promise<{ recommendations: ToolRecommendation[], sources: GroundingSource[] }> {
  try {
    const prompt = `
      User Problem: "${problemDescription}"

      Your goal is to find 3-5 existing, real-world AI tools that solve this specific problem.
      
      Instructions:
      1. Use Google Search to find the most relevant and current tools.
      2. Analyze what each tool does.
      3. Return the data strictly in the following JSON format:
      {
        "recommendations": [
          {
            "name": "Tool Name",
            "description": "A brief 1-sentence explanation of what the tool is.",
            "reasoning": "A concise explanation of WHY this specific tool solves the user's bottleneck based on their input.",
            "url": "https://website.com"
          }
        ]
      }
      
      Important Rules:
      - Ensure the URLs are valid.
      - Be extremely specific in the "reasoning" field to build trust.
      - Focus on high-quality, popular, or highly relevant tools.
      - DO NOT add markdown formatting around the JSON.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const sources: GroundingSource[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks) {
      chunks.forEach((chunk: any) => {
        if (chunk.web) {
          sources.push({
            title: chunk.web.title ?? "Source",
            uri: chunk.web.uri ?? ""
          });
        }
      });
    }

    const textResponse = response.text;
    if (!textResponse) throw new Error("No response received from Gemini.");

    const recommendations = parseResponse(textResponse);
    return { recommendations, sources };

  } catch (error: any) {
    console.error("Gemini Service Error:", error);
    throw new Error(error.message || "Failed to fetch AI recommendations.");
  }
}

const parseResponse = (text: string): ToolRecommendation[] => {
  try {
    const cleaned = text.replace(/```json|```/g, '').trim();
    const data = JSON.parse(cleaned) as ToolResponse;
    return data.recommendations.map((item, idx) => ({
      ...item,
      id: `${Date.now()}-${idx}`
    }));
  } catch (e) {
    console.error("Parse Error:", e);
    throw new Error("Could not parse the AI recommendations. Please try a more specific query.");
  }
};
