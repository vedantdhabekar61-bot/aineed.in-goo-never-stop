import { GoogleGenAI } from "@google/genai";
import { ToolRecommendation, ToolResponse, GroundingSource } from "../../../types";

const apiKey = process.env.API_KEY;

if (!apiKey) {
  throw new Error("API_KEY is missing from environment variables");
}

const ai = new GoogleGenAI({ apiKey });

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
            "description": "A brief 1-sentence explanation of how it specifically solves the user's problem.",
            "url": "https://website.com"
          }
        ]
      }
      
      Important Rules:
      - Ensure the URLs are valid and point to the main product page.
      - If no exact tool exists, find the closest category of tools.
      - DO NOT add any markdown formatting outside the JSON (like \`\`\`json). Just return the JSON string if possible, or wrap it in a code block if you must.
      - Focus on high-quality, popular, or highly relevant tools.
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
    
    if (!textResponse) {
      throw new Error("No response received from Gemini.");
    }

    const recommendations = parseResponse(textResponse);
    return { recommendations, sources };

  } catch (error: any) {
    console.error("Gemini Service Error:", error);
    throw new Error(error.message || "Failed to fetch AI recommendations.");
  }
}

/**
 * Helper to parse the JSON output from the model.
 */
const parseResponse = (text: string): ToolRecommendation[] => {
  try {
    const data = JSON.parse(text) as ToolResponse;
    if (data.recommendations) return data.recommendations;
  } catch (e) {
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/```\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      try {
        const data = JSON.parse(jsonMatch[1]) as ToolResponse;
        if (data.recommendations) return data.recommendations;
      } catch (innerE) {
        console.warn("Failed to parse JSON from code block", innerE);
      }
    }
    
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
      try {
        const jsonStr = text.substring(firstBrace, lastBrace + 1);
        const data = JSON.parse(jsonStr) as ToolResponse;
        if (data.recommendations) return data.recommendations;
      } catch (finalE) {
        console.warn("Failed to fuzzy parse JSON", finalE);
      }
    }
  }
  throw new Error("Could not parse the AI recommendations.");
};