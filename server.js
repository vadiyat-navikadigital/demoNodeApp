const dotenv = require("dotenv");
const connectDB = require("./config/db");
const app = require("./index.js");

dotenv.config();
connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

