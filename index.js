const cron = require("node-cron");
const express = require("express");
const axios = require("axios");

const fs = require("fs");

const configPath = "./config.json";
const auth = require("./auth");
const config = require(configPath);

const app = express();

const PORT = process.env.port || 9000;

app.get("/health", (req, res) => res.send("Up and running"));

app.post("/changed", auth, (req, res) => {
  try {
    const userIndex = config.findIndex((user) => user.key === req.user.key);
    if (userIndex === -1) {
      return res.status(404).send("User not found");
    }
    config[userIndex].changed = true;

    fs.writeFile(configPath, JSON.stringify(config, null, 2), "utf8", (err) => {
      if (err) {
        return res.status(500).send("Error updating configuration");
      }
      res.send("Configuration updated");
    });
  } catch (parseError) {
    res.status(500).send("Error parsing configuration");
  }
});

cron.schedule("* * * * *", async () => {
  console.log("Running a task every 5 minutes");
  try {
    for (const user of config) {
      if (user.changed) {
        try {
          await axios.post(user.callback);
          console.log(`Callback successful for ${user.name} ${user.callback}`);
        } catch (callbackErr) {
          console.error(`Error in callback for ${user.name}:`, callbackErr);
        }
        user.changed = false;
      }
    }

    fs.writeFile(configPath, JSON.stringify(config, null, 2), "utf8", (err) => {
      if (err) {
        console.error("Error writing updated configuration:", err);
      }
    });
  } catch (parseError) {
    console.error("Error parsing configuration:", parseError);
  }
});

app.listen(PORT, () =>
  console.log(`Server running at http://localhost:${PORT}`)
);
