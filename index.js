const express = require("express");

const app = express();

// route test
app.get("/", (req, res) => {
  res.send("API is working 🚀");
});
const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
app.listen(process.env.PORT, () => {
  console.log("Server running on port " + process.env.PORT);
});