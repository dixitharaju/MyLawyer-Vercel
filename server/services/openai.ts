import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || ""
});

export async function generateLegalResponse(question: string, context?: string): Promise<string> {
  try {
    const systemPrompt = `You are a helpful AI legal assistant for Indian law. Provide accurate, simplified legal information and guidance. Always:
1. Explain legal concepts in simple terms
2. Reference relevant Indian laws and acts when applicable
3. Suggest practical next steps
4. Remind users to consult with qualified lawyers for serious matters
5. Focus on educating users about their rights and legal procedures

${context ? `Additional context: ${context}` : ''}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: question }
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    return response.choices[0].message.content || "I'm sorry, I couldn't generate a response. Please try again.";
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw new Error("Failed to generate legal response. Please try again later.");
  }
}

export async function categorizeComplaint(description: string): Promise<{
  category: string;
  priority: string;
  suggestedActions: string[];
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a legal classification AI. Analyze the complaint and categorize it. Respond with JSON in this format:
{
  "category": "one of: Labor Law, Consumer Rights, Family Law, Criminal Law, Property Law, Other",
  "priority": "one of: low, medium, high",
  "suggestedActions": ["action1", "action2", "action3"]
}`
        },
        {
          role: "user",
          content: `Complaint: ${description}`
        }
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      category: result.category || "Other",
      priority: result.priority || "medium",
      suggestedActions: result.suggestedActions || [],
    };
  } catch (error) {
    console.error("OpenAI categorization error:", error);
    return {
      category: "Other",
      priority: "medium",
      suggestedActions: ["Contact legal support", "Gather relevant documents", "Consult with a lawyer"],
    };
  }
}

export async function generateConversationTitle(messages: string[]): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Generate a brief, descriptive title (max 6 words) for this legal conversation based on the messages."
        },
        {
          role: "user",
          content: `Messages: ${messages.join(" | ")}`
        }
      ],
      max_tokens: 20,
    });

    return response.choices[0].message.content || "Legal Consultation";
  } catch (error) {
    console.error("OpenAI title generation error:", error);
    return "Legal Consultation";
  }
}
