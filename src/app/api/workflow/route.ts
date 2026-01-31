
import { GoogleGenAI } from "@google/genai";
import { WorkflowPlan } from "../../../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function POST(req: Request) {
  try {
    const { problem, tool } = await req.json();

    if (!problem || !tool) {
      return Response.json({ error: "Context missing" }, { status: 400 });
    }

    const prompt = `
      Original Problem: "${problem}"
      Target Tool: "${tool.name} (${tool.url})"

      You are a specialized workflow consultant. Create a 3-step practical execution plan to solve the user's problem using THIS specific tool.
      
      Return JSON format:
      {
        "toolName": "${tool.name}",
        "steps": [
          { "action": "Step 1 Action", "description": "Specific detail on what to click or configure." },
          { "action": "Step 2 Action", "description": "Next logical step in the tool UI." },
          { "action": "Step 3 Action", "description": "Final step to get the result." }
        ],
        "uploadGuide": "Specific instructions on what files or data to feed into this tool (e.g., 'Upload your MP4 raw file' or 'Paste your CSV exported from Shopify').",
        "promptTemplate": "A highly optimized, copy-pasteable prompt or configuration setting to use WITHIN the tool to get the best result for the original problem."
      }
      
      Rules:
      - Be extremely practical and tool-specific.
      - Ensure the promptTemplate is ready to use.
      - DO NOT add markdown formatting.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    const text = response.text?.replace(/```json|```/g, '').trim();
    const plan = JSON.parse(text || "{}") as WorkflowPlan;

    return Response.json({ plan });
  } catch (error: any) {
    console.error("Workflow API Error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
