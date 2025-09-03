import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../services/api";

// Async thunks
export const fetchVersionHistory = createAsyncThunk(
  "versions/fetchVersionHistory",
  async (documentId, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/api/versions/history/${documentId}`);
      return { documentId, versions: data.versions || [] };
    } catch (error) {
      const message = error?.response?.data?.message || error.message || "Failed to fetch version history";
      return rejectWithValue(message);
    }
  }
);

export const fetchVersion = createAsyncThunk(
  "versions/fetchVersion",
  async (versionId, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/api/versions/${versionId}`);
      return data.version;
    } catch (error) {
      const message = error?.response?.data?.message || error.message || "Failed to fetch version";
      return rejectWithValue(message);
    }
  }
);

export const restoreVersion = createAsyncThunk(
  "versions/restoreVersion",
  async ({ versionId, documentId }, { rejectWithValue }) => {
    try {
      const { data } = await api.post(`/api/versions/restore/${versionId}`);
      return { restoredDoc: data.doc, versionId, documentId };
    } catch (error) {
      const message = error?.response?.data?.message || error.message || "Failed to restore version";
      return rejectWithValue(message);
    }
  }
);

const initialState = {
  versionHistory: {}, // Keyed by documentId
  currentVersion: null,
  loading: false,
  error: null,
};

const versionSlice = createSlice({
  name: "versions",
  initialState,
  reducers: {
    clearVersionError(state) {
      state.error = null;
    },
    clearCurrentVersion(state) {
      state.currentVersion = null;
    },
    clearVersionHistory(state, action) {
      if (action.payload) {
        delete state.versionHistory[action.payload];
      } else {
        state.versionHistory = {};
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Version History
      .addCase(fetchVersionHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVersionHistory.fulfilled, (state, action) => {
        state.loading = false;
        const { documentId, versions } = action.payload;
        state.versionHistory[documentId] = versions;
      })
      .addCase(fetchVersionHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      // Fetch Specific Version
      .addCase(fetchVersion.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVersion.fulfilled, (state, action) => {
        state.loading = false;
        state.currentVersion = action.payload;
      })
      .addCase(fetchVersion.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      // Restore Version
      .addCase(restoreVersion.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(restoreVersion.fulfilled, (state, action) => {
        state.loading = false;
        state.currentVersion = null;
        // Clear version history for this document since it's been restored
        if (action.payload.documentId) {
          delete state.versionHistory[action.payload.documentId];
        }
      })
      .addCase(restoreVersion.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      });
  },
});

export const { clearVersionError, clearCurrentVersion, clearVersionHistory } = versionSlice.actions;

export default versionSlice.reducer;
