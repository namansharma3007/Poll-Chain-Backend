import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI;

const connectDB = async () => {
  mongoose
    .connect(MONGO_URI!)
    .then(() => console.log("DB connection established"))
    .catch((error: any) => {
      console.log("Error while connecting to Mongo DB: ", error.message);
    });
};

export { connectDB };
