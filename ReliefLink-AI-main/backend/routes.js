const express = require("express");
const router = express.Router();

const { handleRequest } = require("./services/mainService");
const { getAllIssues } = require("./services/dbService");

// MAIN API
router.post("/report", async (req, res) => {

  console.log("Full request body:", req.body);
  console.log("Incoming text:", req.body.text);

  try {
    const { text } = req.body;

    if (typeof text !== "string" || text.trim().length === 0) {
      return res.status(400).json({
        error: "Text is required"
      });
    }

    const result = await handleRequest(text.trim());

    console.log("AI response:", result);

    res.json(result);

  } catch (error) {
    console.error("Error in /report:", error);

    res.status(500).json({
      error: "Something went wrong"
    });
  }
});


// DASHBOARD
router.get("/issues", async (req, res) => {
  try {
    const data = await getAllIssues();
    res.json(data);

  } catch (error) {
    console.error("Error in /issues:", error);

    res.status(500).json({
      error: "Failed to fetch issues"
    });
  }
});

module.exports = router;