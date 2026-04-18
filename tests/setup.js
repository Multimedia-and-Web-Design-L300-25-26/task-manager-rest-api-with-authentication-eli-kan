import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "../src/config/db.js";
import User from "../src/models/User.js";
import Task from "../src/models/Task.js";

dotenv.config({ path: ".env.test", quiet: true });

beforeAll(async () => {
	await connectDB();
	await Promise.all([User.deleteMany({}), Task.deleteMany({})]);
});

afterAll(async () => {
	await Promise.all([User.deleteMany({}), Task.deleteMany({})]);
	await mongoose.connection.close();
});