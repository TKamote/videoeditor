import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export const geminiModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function analyzeVideoHighlights(analysisData: any, userPrompt: string) {
  const prompt = `
    Based on the following video analysis data:
    ${JSON.stringify(analysisData)}
    
    ${userPrompt || "Find the most exciting moments with action/reactions."}
    
    Return a JSON array of objects, each with:
    - startTime: number (seconds)
    - endTime: number (seconds)
    - description: string
    - importance: number (1-10)
  `;

  const result = await geminiModel.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  
  // Extract JSON from the response text (it might be wrapped in markdown code blocks)
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }
  
  throw new Error("Failed to parse Gemini response as JSON");
}

