
import { GoogleGenAI } from "@google/genai";

export async function POST(req: Request) {
  try {
    const { problem, tool } = await req.json();
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const prompt = `Create a 3-step execution plan for solving "${problem}" using "${tool.name}". 
Return ONLY JSON:
{
  "toolName": "${tool.name}",
  "steps": [{ "action": "Action name", "description": "Details" }],
  "uploadGuide": "Instructions",
  "promptTemplate": "The internal prompt"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    const text = response.text?.replace(/```json|```/g, "").trim();
    return Response.json({ plan: JSON.parse(text || "{}") });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
