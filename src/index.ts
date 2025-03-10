import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser"; // Import cookie-parser 
import "dotenv/config";

import { errorHandler } from "./middleware/errorHandling.middleware";
import { authRoute } from "./routes/auth.routes";
import { connectDB } from "./db/db";

const app = express();

const PORT = process.env.PORT || 5555;

app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

app.use("/api/v1/auth", authRoute);

app.use(errorHandler);

app.listen(PORT, () => {
  connectDB();
  console.log(`Server is running on port ${PORT}`);
});

