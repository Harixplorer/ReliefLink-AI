const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
require('dotenv').config();
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;// ⚠️ replace with NEW key (not leaked one)

// 🔥 CALL OPENROUTER AI
async function callAI(text) {
  console.log("🚀 CALLAI STARTED");

  const response = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost",
        "X-Title": "ReliefLink-AI",
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3.1-8b-instruct",
        messages: [
          {
            role: "user",
            content: `
You are an emergency response AI system.            
Return ONLY valid JSON.no explanation,no test.
Rules:

Categories:
- Disaster → fire, flood, accident, earthquake
- Medical → injury, illness, ambulance needed
- Supplies → food, water, clothes, essentials
- General → anything else

Priority rules:
- Disaster or life-threatening → High
- Medical urgent → High
- Food/water shortage → Medium
- Minor issues → Low

Volunteer mapping:
- Disaster → fire brigade / rescue team
- Medical → doctors / ambulance / medical team
- Supplies → food volunteers / relief workers
- General → general volunteers
IMPORTANT:
-explanation must be 1-2 cler sentences.
-explanation must explain why the category, priority, and volunteer were chosen based on the input text.

Response format:
{
  "category": "",
  "priority": "",
  "volunteer": "",
  "explanation": ""
}

Message: ${text}
            `,
          },
        ],
      }),
    }
  );

  const data = await response.json();

  console.log("🧠 OPENROUTER RESPONSE:", JSON.stringify(data, null, 2));

  if (!data.choices || !data.choices[0]) {
    throw new Error("Invalid OpenRouter response");
  }

  return data.choices[0].message.content;
}

// 🔥 PROCESS INPUT (USED BY BACKEND)
async function process_input(text) {
  console.log("🔥 AI SERVICE FILE LOADED:", __filename);
  console.log("🔥 PROCESS INPUT:", text);

  try {
    const aiRaw = await callAI(text);

    console.log("🧾 RAW AI:", aiRaw);

    // 🧹 Clean response
    const cleaned = aiRaw
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    // 🔍 Extract JSON safely
    const match = cleaned.match(/{[\s\S]*}/);

    if (!match) {
      throw new Error("No JSON found in AI response");
    }

    const parsed = JSON.parse(match[0]);

    console.log("✅ FINAL PARSED RESULT:", parsed);

    return parsed;
  } catch (error) {
    console.error("❌ AI ERROR:", error.message);

    return {
      category: "Unknown",
      priority: "Low",
      volunteer: "None",
      explanation: "AI failed",
    };
  }
}

module.exports = { process_input };