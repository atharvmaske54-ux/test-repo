const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config();
const dns = require("dns");



dns.setServers(['8.8.8.8', '8.8.4.4']);

const app = express();
app.use(express.json());

const mongoUrl = process.env.MONGO_URL;
if (!mongoUrl) {
    console.error("Missing MONGO_URL in .env");
    process.exit(1);
}

mongoose.connect(mongoUrl)
    .then(() => console.log("MongoDB connected successfully"))
    .catch((error) => {
        console.error("MongoDB connection error:", error);
        process.exit(1);
    });

// routes
const helloRoutes = require("./routes/helloRouts");
const authRoutes = require("./routes/authRoutes");
const profileRoutes = require("./routes/profileRoutes");
app.use("/api", helloRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});