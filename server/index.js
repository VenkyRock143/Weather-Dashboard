const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const cityRoutes = require("./routes/cityRoutes");
const weatherRoutes = require("./routes/weatherRoutes");
const aiRoutes = require("./routes/aiRoutes");
const agentRoutes = require("./routes/agentRoutes");
const ai = require("./routes/ai")



const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

app.use(limiter);

connectDB();

app.use("/api/auth", authRoutes);
app.use("/api/cities", cityRoutes);
app.use("/api/weather", weatherRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/agent", agentRoutes);
app.use("/api/ai", require("./routes/ai"));

app.listen(5000, () => console.log("Server running on port 5000"));