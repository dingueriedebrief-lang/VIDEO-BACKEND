const express = require("express");

const app = express();

// route test
app.get("/", (req, res) => {
  res.send("API is working 🚀");
});

app.listen(process.env.PORT, () => {
  console.log("Server running on port " + process.env.PORT);
});