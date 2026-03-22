const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

// 🔥 Fix DNS (MongoDB SRV)
const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const app = express();

// ✅ Middleware
app.use(cors());
app.use(express.json());

// ✅ Debug (optional)
console.log("MONGO_URI exists:", !!process.env.MONGO_URI);

// ✅ MongoDB Connection
const connectDB = async () => {
  try {
    console.log("Connecting to MongoDB...");

    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      family: 4
    });

    console.log("MongoDB Connected ✅");

  } catch (err) {
    console.error("MongoDB Connection Error ❌", err);
    process.exit(1);
  }
};

connectDB();

// ✅ Schema
const contactSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    message: String
  },
  { timestamps: true }
);

const Contact = mongoose.model("Contact", contactSchema);

// ================= ROUTES =================

// ✅ ROOT ROUTE (IMPORTANT)
app.get("/", (req, res) => {
  res.status(200).send("Backend running 🚀");
});

// ✅ TEST ROUTE (for debugging)
app.get("/test", (req, res) => {
  res.status(200).send("Test route working ✅");
});

// ✅ CONTACT ROUTE
app.post("/contact", async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: "All fields are required ❌" });
    }

    const newContact = new Contact({ name, email, message });
    await newContact.save();

    res.status(200).json({ message: "Data saved successfully ✅" });

  } catch (error) {
    console.error("Save Error ❌", error);
    res.status(500).json({ error: "Error saving data ❌" });
  }
});

// ❗ 404 HANDLER (MUST BE LAST)
app.use((req, res) => {
  res.status(404).json({
    message: `Route ${req.method}:${req.originalUrl} not found`,
    error: "Not Found"
  });
});

// ✅ START SERVER
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});