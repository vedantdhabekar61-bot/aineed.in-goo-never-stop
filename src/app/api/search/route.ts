import { runGeminiSearch } from "./geminiService";

export async function POST(req: Request) {
  try {
    const { query } = await req.json();

    if (!query) {
      return Response.json({ error: "Query missing" }, { status: 400 });
    }

    const result = await runGeminiSearch(query);

    return Response.json({ result });
  } catch (error: any) {
    console.error("API Route Error:", error);
    return Response.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}