const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const bmiRoutes = require("./routes/bmiRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");
const memberAttendanceRoutes = require("./routes/memberAttendanceRoutes");
const memberPunchRoutes = require("./routes/memberPunchRoutes");
const gymRoutes = require("./routes/gymRoutes");
const subscriptionRoutes = require("./routes/subscriptionRoutes");
const userRoutes = require("./routes/userRoutes");
const gymOwnerUniversalRoutes = require("./routes/gymOwnerRoutes");

const errorHandler = require("./middlewares/errorHandler");

// Import cron and the expiration check method from gymController
const cron = require("node-cron");
const { checkExpirationStatus } = require("./controllers/gymController");

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/bmi", bmiRoutes);
app.use("/api/feedbacks", feedbackRoutes);
app.use("/api/member-attendance", memberAttendanceRoutes);
app.use("/api/member-punch", memberPunchRoutes);
app.use("/api/gyms", gymRoutes);
app.use("/api/users", userRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api", gymOwnerUniversalRoutes);

// Set up cron job to check gym expiration status daily at midnight
cron.schedule("0 0 * * *", () => {
  console.log("Running cron job to check gym subscriptions.");
  checkExpirationStatus(); // This function will update gyms' isExpiredSoon status
});

// Error Handling
app.use(errorHandler);

module.exports = app;
