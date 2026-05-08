import { HfInference } from "@huggingface/inference";

const hfToken = import.meta.env.VITE_AI_TOKEN;
const hf = new HfInference(hfToken || "dummy_token_for_init");

// Fallback to Llama-3 because Mistral-7B is currently throwing provider errors on HF
const MODEL = "meta-llama/Meta-Llama-3-8B-Instruct";

export async function getChatCompletion(userMessage, dashboardContext) {
  if (!hfToken || hfToken === 'your_huggingface_KEY') {
    return "Error: Hugging Face API token is missing or invalid. Please add VITE_AI_TOKEN to your .env file.";
  }

  const systemPrompt = `You are an AI assistant for an ISS and News Dashboard.
  
You MUST follow these strict rules:
1. ONLY answer questions using the dashboard data provided below.
2. DO NOT use external knowledge, internet knowledge, or guess.
3. If the user asks something not covered by the provided data, politely say: "I can only answer questions based on the current ISS dashboard and news data."
4. Be concise and helpful.

CURRENT DASHBOARD DATA:
ISS Speed: ${dashboardContext.speed} km/h
ISS Nearest Location: ${dashboardContext.location}
Number of People in Space: ${dashboardContext.astronautsCount}
Top News Headlines:
${dashboardContext.newsArticles.map((n, i) => `${i + 1}. ${n.title} (Source: ${n.source?.name})`).join('\n')}
`;



  try {
    const response = await hf.chatCompletion({
      model: MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage }
      ],
      max_tokens: 250,
      temperature: 0.1,
    });

    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error("AI Service Error:", error);
    return "I'm sorry, I encountered an error communicating with the AI model. Please try again later.";
  }
}
