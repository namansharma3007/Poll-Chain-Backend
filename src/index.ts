import type { Request, Response } from "express";
import express from "express";
import cors from "cors";
import cron from "node-cron";
import cookieParser from "cookie-parser"; // Import cookie-parser
import "dotenv/config";

import { errorHandler } from "./middleware/errorHandling.middleware";
import { authRoute } from "./routes/auth.routes";
import { connectDB } from "./db/db";

const app = express();

const PORT = process.env.PORT || 5555;


app.use(
  cors({
    origin: process.env.ACCESS_ORIGIN_URL || "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());


// This code is only written because render automatically gets inactive after 15 minutes so this is in order to hit api url after every 14 minutes
cron.schedule('*/14 * * * *', async () => {
  try {
    console.log('Running scheduled task:', new Date().toISOString());
        const response = await fetch('https://poll-chain-backend.onrender.com/api/test', {
        method: 'GET'
    });
    const data = await response.json();
    console.log('Scheduled API call response:', data);
  } catch (error) {
    console.error('Error in scheduled task:', error);
  }
});

app.use("/api/v1/auth", authRoute);
app.get("/api/test", async (req: Request, res: Response) => {
  res.status(200).json({ message: "Hey, I am active" })
})

app.use(errorHandler);

app.listen(PORT, () => {
  connectDB();
  console.log(`Server is running on port ${PORT}`);
});
