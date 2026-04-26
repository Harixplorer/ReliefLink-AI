const { process_input } = require("./aiService");
const { saveIssue, getAllIssues } = require("./dbService");

async function handleRequest(text) {
  const result = await process_input(text);

  await saveIssue(text, result);

  // ✅ Move your flood logic INSIDE function
  const issues = await getAllIssues();

  const floodCount = issues.filter(i => i.category === "Disaster").length;

  if (floodCount > 3) {
    console.log("Flood risk detected");
  }

  return result;
}

module.exports = { handleRequest };