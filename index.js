const cron = require("node-cron");
const express = require("express");
const app = express();

const PORT = process.env.port || 9000;

app.get("/health", (req, res) => res.send("Up and running"));

cron.schedule("* * * * *", () => {
  console.log("running a task every minute");
});

app.listen(PORT, () =>
  console.log(`Server running at http://localhost:${PORT}`)
);
