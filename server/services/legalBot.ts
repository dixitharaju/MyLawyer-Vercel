import { QdrantClient } from "@qdrant/js-client-rest";
import { GoogleGenerativeAI } from "@google/generative-ai";

// -------------------------------
// 1. Connect to Qdrant Cloud
// -------------------------------
const qdrant = new QdrantClient({
  url: "https://ab30581e-64fe-4bb1-b0b2-42b96413ffac.eu-central-1-0.aws.cloud.qdrant.io",
  apiKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3MiOiJtIn0.P6JKrEix7m_CWXhg-yOUHHIz11Y-83qM4kzfPl1DaFg"
});

// -------------------------------
// 2. Setup Gemini
// -------------------------------
const genai = new GoogleGenerativeAI("AIzaSyC_PSB2UoEVXPNpHT2MMUSrOhThj5J_jhA");
const gemini = genai.getGenerativeModel({ model: "gemini-2.5-flash" });

// -------------------------------
// 3. Simple embedding function (since sentence-transformers is Python)
// -------------------------------
function createEmbedding(text: string): number[] {
  // Simple hash-based embedding for demonstration
  // In production, you'd want to use a proper embedding service or API
  const words = text.toLowerCase().split(/\s+/);
  const embedding = new Array(384).fill(0);
  
  words.forEach((word, index) => {
    const hash = word.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    embedding[index % 384] += hash / 1000000;
  });
  
  return embedding;
}



// -------------------------------
// 4. Query Function
// -------------------------------
export async function queryLegalBot(userQuery: string): Promise<string> {
  try {
    // Convert query to vector
    const queryVector = createEmbedding(userQuery);

    // Search in Qdrant
    const searchResult = await qdrant.search("legal_docs", {
      vector: queryVector,
      limit: 3,
      with_payload: true
    });

    // Collect context from matches
    const context = searchResult.map((hit: any) => hit.payload?.text || "").join("\n");

    // Create adaptive prompt
    const prompt = `
    You are a helpful Indian legal assistant chatbot.

    User asked: "${userQuery}"

    Relevant documents from the database:
    ${context}

    Answer guidelines:
    - If the query is about crimes (e.g., accident, theft, harassment), include:
      • Practical steps to take
      • FIR filing process (if applicable)
      • Related IPC sections or rights
    - If the query is civil / general (contracts, property, rights, etc.):
      • Provide practical steps
      • Relevant Indian laws / acts
      • Avoid FIR unless it's a criminal matter
    - Always give the answer clearly in steps.
    - Use simple, easy-to-understand language.
    - Be helpful and supportive while maintaining legal accuracy.
    `;

    // Generate response
    const result = await gemini.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Legal bot error:", error);
    return "I apologize, but I'm having trouble accessing the legal database right now. Please try again in a moment, or consider consulting with a qualified lawyer for immediate assistance.";
  }
}

// -------------------------------
// 5. Enhanced chat function that integrates with existing system
// -------------------------------
export async function generateEnhancedLegalResponse(userQuery: string, conversationHistory?: string[]): Promise<string> {
  try {
    // Convert query to vector
    const queryVector = createEmbedding(userQuery);

    // Search in Qdrant
    const searchResult = await qdrant.search("legal_docs", {
      vector: queryVector,
      limit: 3,
      with_payload: true
    });

    // Collect context from matches
    const context = searchResult.map((hit: any) => hit.payload?.text || "").join("\n");

    // Create enhanced prompt with conversation history
    const historyContext = conversationHistory && conversationHistory.length > 0 
      ? `\nPrevious conversation context:\n${conversationHistory.slice(-3).join("\n")}`
      : "";

    const prompt = `
    You are a helpful Indian legal assistant chatbot with access to a comprehensive legal database.

    User's current question: "${userQuery}"
    ${historyContext}

    Relevant legal documents from the database:
    ${context}

    Answer guidelines:
    - If the query is about crimes (e.g., accident, theft, harassment), include:
      • Practical steps to take
      • FIR filing process (if applicable)
      • Related IPC sections or rights
    - If the query is civil / general (contracts, property, rights, etc.):
      • Provide practical steps
      • Relevant Indian laws / acts
      • Avoid FIR unless it's a criminal matter
    - Always give the answer clearly in steps.
    - Use simple, easy-to-understand language.
    - Be helpful and supportive while maintaining legal accuracy.
    - If the user has asked follow-up questions, reference the conversation history.
    - Provide actionable advice while reminding users to consult qualified lawyers for serious matters.
    `;

    const result = await gemini.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error("Enhanced legal response error:", error);
    return "I apologize, but I'm having trouble accessing the legal database right now. Please try again in a moment, or consider consulting with a qualified lawyer for immediate assistance.";
  }
}
