import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../services/api";

// Async thunks
export const fetchTeamActivityFeed = createAsyncThunk(
  "activities/fetchTeamActivityFeed",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/api/activities/team-feed");
      return data.activities || [];
    } catch (error) {
      const message = error?.response?.data?.message || error.message || "Failed to fetch team activity feed";
      return rejectWithValue(message);
    }
  }
);

export const fetchUserActivities = createAsyncThunk(
  "activities/fetchUserActivities",
  async (userId, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/api/activities/user/${userId}`);
      return data.activities || [];
    } catch (error) {
      const message = error?.response?.data?.message || error.message || "Failed to fetch user activities";
      return rejectWithValue(message);
    }
  }
);

export const fetchDocumentActivities = createAsyncThunk(
  "activities/fetchDocumentActivities",
  async (documentId, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/api/activities/document/${documentId}`);
      return data.activities || [];
    } catch (error) {
      const message = error?.response?.data?.message || error.message || "Failed to fetch document activities";
      return rejectWithValue(message);
    }
  }
);

export const fetchRecentEditedDocuments = createAsyncThunk(
  "activities/fetchRecentEditedDocuments",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/api/activities/recent-edits");
      return data.documents || [];
    } catch (error) {
      const message = error?.response?.data?.message || error.message || "Failed to fetch recent edited documents";
      return rejectWithValue(message);
    }
  }
);

const initialState = {
  teamFeed: [],
  userActivities: [],
  documentActivities: [],
  recentEditedDocs: [],
  loading: false,
  error: null,
};

const activitySlice = createSlice({
  name: "activities",
  initialState,
  reducers: {
    clearActivityError(state) {
      state.error = null;
    },
    clearUserActivities(state) {
      state.userActivities = [];
    },
    clearDocumentActivities(state) {
      state.documentActivities = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Team Activity Feed
      .addCase(fetchTeamActivityFeed.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTeamActivityFeed.fulfilled, (state, action) => {
        state.loading = false;
        state.teamFeed = action.payload || [];
      })
      .addCase(fetchTeamActivityFeed.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      // User Activities
      .addCase(fetchUserActivities.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserActivities.fulfilled, (state, action) => {
        state.loading = false;
        state.userActivities = action.payload || [];
      })
      .addCase(fetchUserActivities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      // Document Activities
      .addCase(fetchDocumentActivities.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDocumentActivities.fulfilled, (state, action) => {
        state.loading = false;
        state.documentActivities = action.payload || [];
      })
      .addCase(fetchDocumentActivities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      // Recent Edited Documents
      .addCase(fetchRecentEditedDocuments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRecentEditedDocuments.fulfilled, (state, action) => {
        state.loading = false;
        state.recentEditedDocs = action.payload || [];
      })
      .addCase(fetchRecentEditedDocuments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      });
  },
});

export const { clearActivityError, clearUserActivities, clearDocumentActivities } = activitySlice.actions;

export default activitySlice.reducer;
