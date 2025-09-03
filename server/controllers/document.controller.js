import Document from "../models/document.model.js";
import { answerWithDocs, generateSummary, generateTags } from "../services/geminiService.js";
import { createVersion } from "./version.controller.js";
import { createActivity } from "./activity.controller.js";



export const createDocument = async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res
        .status(400)
        .json({ success: false, message: "Please provide the required fields" });
    }

    // AI generate summary and tags
    const summary = await generateSummary(content);
    const tags = await generateTags(content);

    const doc = await Document.create({
      title,
      content,
      summary,
      tags,
      createdBy: req.user.id,
    });

    // Create activity for document creation
    await createActivity("create", doc._id, req.user.id);

    // Populate the user detail in createdBy
    const populatedDoc = await Document.findById(doc._id).populate("createdBy");

    res.status(201).json({ success: true, doc: populatedDoc });
  } catch (error) {
    console.log("Error in create document", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const getAllDocuments = async (req, res) => {
  try {
    const docs = await Document.find().populate("createdBy");
    res.status(200).json({ success: true, docs });
  } catch (error) {
    console.log("Error in get all documents", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const getDocumentById = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await Document.findById(id).populate("createdBy");
    if (!doc) {
      return res
        .status(404)
        .json({ success: false, message: "Document not found" });
    }
    res.status(200).json({ success: true, doc });
  } catch (error) {
    console.log("Error in get single document", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};


export const updateDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, summary, tags } = req.body;

    // Find the document
    const doc = await Document.findById(id);
    if (!doc) {
      return res
        .status(404)
        .json({ success: false, message: "Document not found" });
    }

    // Store old data for versioning
    const oldData = {
      title: doc.title,
      content: doc.content,
      summary: doc.summary,
      tags: doc.tags,
    };

    if (title !== undefined) doc.title = title;
    if (content !== undefined) doc.content = content;
    if (summary !== undefined) doc.summary = summary;
    if (tags !== undefined) doc.tags = tags;

    await doc.save();

    // Create version for the update
    await createVersion(doc._id, oldData, req.user.id);

    // Create activity for document update
    await createActivity("update", doc._id, req.user.id);

    const updatedDoc = await Document.findById(doc._id).populate("createdBy");

    res.status(200).json({ success: true, doc: updatedDoc });
  } catch (error) {
    console.log("Error in update document", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await Document.findById(id);
    if (!doc) {
      return res
        .status(404)
        .json({ success: false, message: "Document not found" });
    }

    // Create activity for document deletion before deleting
    await createActivity("delete", doc._id, req.user.id);

    await doc.deleteOne();

    res.status(200).json({ success: true, message: "Document deleted successfully" });
  } catch (error) {
    console.log("Error in delete document", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};


export const searchDocument = async (req , res) => {
   try {
      console.log("Full request query:", req.query);
      console.log("Full request params:", req.params);
      console.log("Full request body:", req.body);
      
      const { query } = req.query;
      
      console.log("Search query received:", query, "Type:", typeof query);
      
      // Validate query parameter
      if (!query || typeof query !== 'string' || query.trim() === '') {
         console.log("Invalid query parameter:", query);
         return res.status(400).json({
            success: false, 
            message: "Query parameter is required and must be a non-empty string"
         });
      }
      
      const trimmedQuery = query.trim();
      console.log("Searching for:", trimmedQuery);
      
      // Additional safety check - ensure query is a valid string for regex
      if (typeof trimmedQuery !== 'string' || trimmedQuery.length === 0) {
         console.log("Query validation failed after trimming:", trimmedQuery);
         return res.status(400).json({
            success: false, 
            message: "Invalid query format"
         });
      }
      
      const docs = await Document.find({
         $or: [
            {title: {$regex: trimmedQuery , $options: "i"}},
            {content: {$regex: trimmedQuery , $options: 'i'}}
         ]
      }).populate("createdBy");

      console.log(`Found ${docs.length} documents matching "${trimmedQuery}"`);
      res.status(200).json({success: true , docs})
   } catch (error) {
      console.log("Error in search document controller " , error)
      return res.status(500).json({success: false , message: "Internal server error"})
   }
}

export const semanticSearch = async (req , res) => {
   try {
      const { query } = req.body;
      
      if (!query) {
         return res.status(400).json({success: false , message: "Query is required"})
      }
      
      const docs = await Document.find().populate("createdBy");

      // Import the semantic search function from geminiService
      const { semanticSearchAI } = await import("../services/geminiService.js");
      const results = await semanticSearchAI(query , docs)
      
      // Add additional document details to results
      const enhancedResults = results.map(result => {
         const fullDoc = docs.find(doc => doc._id.toString() === result.documentId);
         return {
            ...result,
            document: fullDoc ? {
               _id: fullDoc._id,
               title: fullDoc.title,
               content: fullDoc.content,
               summary: fullDoc.summary,
               tags: fullDoc.tags,
               createdBy: fullDoc.createdBy,
               createdAt: fullDoc.createdAt,
               updatedAt: fullDoc.updatedAt
            } : null
         };
      });
      
      res.status(200).json({
         success: true, 
         query: query,
         totalResults: enhancedResults.length,
         results: enhancedResults
      })
   } catch (error) {
      console.log("Error in semantic search controller " , error)
      return res.status(500).json({success: false , message: "Internal server error"})
   }
}

export const answerQuestion = async (req, res) => {
   try {
      const { question } = req.body;
      
      if (!question || typeof question !== 'string' || question.trim() === '') {
         return res.status(400).json({
            success: false, 
            message: "Question is required and must be a non-empty string"
         });
      }
      
      // Get all documents to use as context
      const docs = await Document.find().populate("createdBy");
      
      if (!docs || docs.length === 0) {
         return res.status(404).json({
            success: false,
            message: "No documents found to answer the question"
         });
      }
      
      const answer = await answerWithDocs(question.trim(), docs);
      
      res.status(200).json({
         success: true,
         question: question.trim(),
         answer: answer,
         documentsUsed: docs.length
      });
      
   } catch (error) {
      console.log("Error in answer question controller:", error);
      return res.status(500).json({
         success: false, 
         message: "Internal server error"
      });
   }
}
