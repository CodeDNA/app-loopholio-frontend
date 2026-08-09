// import { RiskLevel } from "@/types/analysis";

// /**
//  * Direct ChatGPT API call for testing
//  * Usage:
//  * 1. Set OPENAI_API_KEY in .env.local
//  * 2. Call this function directly: analyzeWithChatGPT(tosText)
//  * 3. Returns: RiskLevel[] or raw response
//  */

// const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// export async function analyzeWithChatGPT(tosText: string): Promise<string> {
//   if (!OPENAI_API_KEY) {
//     throw new Error("OPENAI_API_KEY is not set in environment variables");
//   }

//   console.log("Calling ChatGPT API with text length:", tosText.length);

//   const prompt = `You are a ToS (Terms of Service) expert. Analyze the following document and identify the top 3 risks. For each risk, return a JSON object with this structure:

// {
//   "level": "High" | "Medium" | "Low",
//   "confidence": 0-100,
//   "category": "string",
//   "reason": "string",
//   "whyMatters": "string",
//   "recommendation": "string",
//   "exactClause": "string"
// }

// Return ONLY a JSON array of risks, no other text.

// Document:
// ${tosText}`;

//   try {
//     const response = await fetch("https://api.openai.com/v1/chat/completions", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${OPENAI_API_KEY}`,
//       },
//       body: JSON.stringify({
//         model: "gpt-4",
//         messages: [
//           {
//             role: "user",
//             content: prompt,
//           },
//         ],
//         temperature: 0.7,
//         max_tokens: 2000,
//       }),
//     });

//     if (!response.ok) {
//       const error = await response.json();
//       console.error("ChatGPT API Error:", error);
//       throw new Error(`ChatGPT API error: ${error.error.message}`);
//     }

//     const data = await response.json();
//     const content = data.choices[0].message.content;

//     console.log("ChatGPT Response:", content);

//     return content;
//   } catch (error) {
//     console.error("Error calling ChatGPT:", error);
//     throw error;
//   }
// }

// /**
//  * Parse ChatGPT response into RiskLevel array
//  */
// export async function parseAiResponse(tosText: string): Promise<RiskLevel[]> {
//   try {
//     const aiResponse = await analyzeWithChatGPT(tosText);

//     // Extract JSON from response (in case there's extra text)
//     const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
//     if (!jsonMatch) {
//       console.error("Could not find JSON in response");
//       return getDummyRisks();
//     }

//     const risks = JSON.parse(jsonMatch[0]) as RiskLevel[];
//     console.log("Parsed risks:", risks);

//     return risks;
//   } catch (error) {
//     console.error("Error parsing AI response:", error);
//     // Fallback to dummy data
//     return getDummyRisks();
//   }
// }

// /**
//  * Dummy risks for testing without AI
//  */
// export function getDummyRisks(): RiskLevel[] {
//   return [
//     {
//       level: "Low",
//       confidence: 72,
//       category: "Auto-Renewal",
//       reason: "Service auto-renews without reminder",
//       whyMatters: "You may be charged unexpectedly",
//       recommendation: "Set calendar reminders for renewal dates",
//       exactClause:
//         "Service automatically renews after trial period unless cancelled",
//     },
//   ];
// }
