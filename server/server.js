import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import connectDb from "./config/db.js";

//routes import
import userRoutes from "./routes/user.routes.js";
import documentRoutes from "./routes/document.routes.js";
import versionRoutes from "./routes/version.routes.js";
import activityRoutes from "./routes/activity.routes.js";

dotenv.config();
const app = express();

app.use(express.json());
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(cookieParser());

//routes
app.use("/api/user", userRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/versions", versionRoutes);
app.use("/api/activities", activityRoutes);

//db connection
connectDb();

const port = 5000;

app.listen(port, () => {
  console.log(`App is running on ${port}`);
});
