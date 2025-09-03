import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../services/api";

// Async thunks
export const createDocument = createAsyncThunk(
  "documents/createDocument",
  async ({ title, content }, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/api/documents/create", { title, content });
      return data.doc;
    } catch (error) {
      const message = error?.response?.data?.message || error.message || "Failed to create document";
      return rejectWithValue(message);
    }
  }
);

export const fetchAllDocuments = createAsyncThunk(
  "documents/fetchAllDocuments",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/api/documents/all");
      // Expecting { success, documents } or similar; align to controller shape
      return data.documents || data.docs || data.data || [];
    } catch (error) {
      const message = error?.response?.data?.message || error.message || "Failed to fetch documents";
      return rejectWithValue(message);
    }
  }
);

export const fetchDocumentById = createAsyncThunk(
  "documents/fetchDocumentById",
  async (documentId, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/api/documents/${documentId}`);
      return data.doc || data.document || data.data;
    } catch (error) {
      const message = error?.response?.data?.message || error.message || "Failed to fetch document";
      return rejectWithValue(message);
    }
  }
);

export const updateDocument = createAsyncThunk(
  "documents/updateDocument",
  async ({ id, updates }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/api/documents/update/${id}`, updates);
      return data.doc || data.document || data.data;
    } catch (error) {
      const message = error?.response?.data?.message || error.message || "Failed to update document";
      return rejectWithValue(message);
    }
  }
);

export const deleteDocument = createAsyncThunk(
  "documents/deleteDocument",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/api/documents/delete/${id}`);
      return id;
    } catch (error) {
      const message = error?.response?.data?.message || error.message || "Failed to delete document";
      return rejectWithValue(message);
    }
  }
);

export const searchDocuments = createAsyncThunk(
  "documents/searchDocuments",
  async (query, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/api/documents/search`, { params: { query: query } });
      return data.docs || data.documents || data.results || [];
    } catch (error) {
      const message = error?.response?.data?.message || error.message || "Failed to search documents";
      return rejectWithValue(message);
    }
  }
);

export const semanticSearchDocuments = createAsyncThunk(
  "documents/semanticSearchDocuments",
  async ({ query }, { rejectWithValue }) => {
    try {
      const { data } = await api.post(`/api/documents/semantic-search`, { query });
      return data.results || data.documents || data.docs || [];
    } catch (error) {
      const message = error?.response?.data?.message || error.message || "Failed to run semantic search";
      return rejectWithValue(message);
    }
  }
);

export const answerQuestionWithDocs = createAsyncThunk(
  'document/answer',
  async ({question} , {rejectWithValue}) => {
    try {
      const { data } = await api.post(`/api/documents/answer-question` , {question})
      return data.answer
    } catch (error) {
      const message = error?.response?.data?.message || error.message || "Failed to answer the question";
      return rejectWithValue(message);

    }
  }
)




const initialState = {
  items: [],
  current: null,
  searchResults: [],
  semanticResults: [],
  loading: false,
  error: null,
};

const documentSlice = createSlice({
  name: "documents",
  initialState,
  reducers: {
    clearDocumentError(state) {
      state.error = null;
    },
    clearCurrentDocument(state) {
      state.current = null;
    },
    // New actions for tag management
    setSelectedTags(state, action) {
      state.selectedTags = action.payload;
    },
    clearTagFilters(state) {
      state.selectedTags = [];
      state.tagFilteredDocuments = [];
    },
    clearQuestionAnswer(state) {
      state.questionAnswer = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create
      .addCase(createDocument.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createDocument.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) state.items.unshift(action.payload);
      })
      .addCase(createDocument.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      // Fetch all
      .addCase(fetchAllDocuments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllDocuments.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload || [];
      })
      .addCase(fetchAllDocuments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      // Fetch by id
      .addCase(fetchDocumentById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDocumentById.fulfilled, (state, action) => {
        state.loading = false;
        state.current = action.payload || null;
      })
      .addCase(fetchDocumentById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      // Update
      .addCase(updateDocument.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateDocument.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload;
        if (!updated) return;
        const index = state.items.findIndex((d) => d._id === updated._id);
        if (index !== -1) state.items[index] = updated;
        if (state.current && state.current._id === updated._id) state.current = updated;
      })
      .addCase(updateDocument.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      // Delete
      .addCase(deleteDocument.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteDocument.fulfilled, (state, action) => {
        state.loading = false;
        const id = action.payload;
        state.items = state.items.filter((d) => d._id !== id);
        if (state.current && state.current._id === id) state.current = null;
      })
      .addCase(deleteDocument.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      // Search
      .addCase(searchDocuments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchDocuments.fulfilled, (state, action) => {
        state.loading = false;
        state.searchResults = action.payload || [];
      })
      .addCase(searchDocuments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      // Semantic search
      .addCase(semanticSearchDocuments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(semanticSearchDocuments.fulfilled, (state, action) => {
        state.loading = false;
        state.semanticResults = action.payload || [];
      })
      .addCase(semanticSearchDocuments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      // Answer question with docs
      .addCase(answerQuestionWithDocs.pending, (state) => {
        state.questionAnswerLoading = true;
        state.error = null;
      })
      .addCase(answerQuestionWithDocs.fulfilled, (state, action) => {
        state.questionAnswerLoading = false;
        state.questionAnswer = action.payload;
      })
      .addCase(answerQuestionWithDocs.rejected, (state, action) => {
        state.questionAnswerLoading = false;
        state.error = action.payload || action.error.message;
      });
  },
});

export const { 
  clearDocumentError, 
  clearCurrentDocument, 
  setSelectedTags, 
  clearTagFilters, 
  clearQuestionAnswer 
} = documentSlice.actions;

export default documentSlice.reducer;
