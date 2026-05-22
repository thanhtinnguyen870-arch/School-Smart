import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import http from "http";
import { Server } from "socket.io";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import classRoutes from "./routes/classRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import gradeRoutes from "./routes/gradeRoutes.js";
import assignmentRoutes from "./routes/assignmentRoutes.js";
import testRoutes from "./routes/testRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const server = http.createServer(app);
const allowedOrigins = (process.env.CLIENT_URLS || process.env.CLIENT_URL || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS blocked origin: ${origin}`));
  },
  credentials: true
};

const io = new Server(server, { cors: corsOptions });

connectDB();
app.set("io", io);
app.use(cors(corsOptions));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => res.json({ name: "SMART SCHOOL AI API", status: "online" }));
app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/classes", classRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/grades", gradeRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/tests", testRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/reports", reportRoutes);

app.use((req, res) => res.status(404).json({ message: "Route not found" }));
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || "Server error" });
});

io.on("connection", (socket) => {
  socket.emit("system", { message: "Realtime channel connected" });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
