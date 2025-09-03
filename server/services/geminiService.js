import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI("AIzaSyAbjSpI1FmQl5F0YvtDpllu4jWgiY82x5I");

export const generateSummary = async (content) => {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  const prompt = `Summarize the following document in 3-4 sentences sentences:\n\n${content}`;
  const result = await model.generateContent(prompt);
  return result.response.text();
};

export const generateTags = async (content) => {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  const prompt = `Generate 5 short tags for this document:\n\n${content} and do not give me other things only give me tags and use # symbol before the each tags`;
  const result = await model.generateContent(prompt);
  return result.response
    .text()
    .split(",")
    .map((t) => t.trim());
};

export const semanticSearchAI = async (query, docs) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

    const prompt = `You are a semantic search engine. Given this query: "${query}", 
    analyze the following documents and return a JSON array of the top 5 most relevant documents.
    
    For each document, provide:
    - documentId: the document ID
    - title: the document title
    - relevanceScore: a score from 0.0 to 1.0 indicating relevance
    - matchedContent: a brief snippet of the most relevant content
    - reason: why this document is relevant to the query
    
    Documents to analyze:
    ${docs
      .map(
        (d) =>
          `ID:${d._id}, Title:${d.title}, Content:${d.content.substring(
            0,
            500
          )}...`
      )
      .join("\n\n")}
    
    Return ONLY valid JSON array format like this:
    [
      {
        "documentId": "id_here",
        "title": "Document Title",
        "relevanceScore": 0.95,
        "matchedContent": "Relevant content snippet...",
        "reason": "Why this document is relevant"
      }
    ]`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Try to parse the JSON response
    try {
      const parsedResults = JSON.parse(responseText);
      return parsedResults;
    } catch (parseError) {
      // If parsing fails, return a structured fallback
      console.log("Failed to parse AI response, using fallback format");
      return docs.slice(0, 5).map((doc, index) => ({
        documentId: doc._id.toString(),
        title: doc.title,
        relevanceScore: 1.0 - index * 0.1,
        matchedContent: doc.content.substring(0, 150) + "...",
        reason: "Relevant document based on semantic analysis",
      }));
    }
  } catch (error) {
    console.log("Error in semantic search AI:", error);
    // Return fallback results
    return docs.slice(0, 5).map((doc, index) => ({
      documentId: doc._id.toString(),
      title: doc.title,
      relevanceScore: 1.0 - index * 0.1,
      matchedContent: doc.content.substring(0, 150) + "...",
      reason: "Relevant document based on semantic analysis",
    }));
  }
};

export const answerWithDocs = async (question, docs) => {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  const prompt = `Answer the following question using only the context from these documents:\n${JSON.stringify(
    docs
  )}\n\nQuestion: ${question}`;
  const result = await model.generateContent(prompt);
  return result.response.text();
};
