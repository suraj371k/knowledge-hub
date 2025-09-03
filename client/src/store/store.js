import { configureStore } from "@reduxjs/toolkit";
import documentReducer from "../features/documentSlice";
import authReducer from '../features/authSlice'
import activityReducer from '../features/activitySlice'
import versionReducer from '../features/versionSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    documents: documentReducer,
    activities: activityReducer,
    versions: versionReducer,
  },
});
