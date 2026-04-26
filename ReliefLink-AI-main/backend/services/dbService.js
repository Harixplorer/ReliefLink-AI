const supabase = require("../supabase");

// SAVE ISSUE
async function saveIssue(text, result) {
  const { error } = await supabase
    .from("issues")
    .insert([
      {
        text: text,
        category: result.category,
        priority: result.priority,
        volunteer: result.volunteer
      }
    ]);

  if (error) {
    console.error("Error saving issue:", error);
  }
}

// GET ALL ISSUES
async function getAllIssues() {
  const { data, error } = await supabase
    .from("issues")
    .select("*");

  if (error) {
    console.error(error);
    return [];
  }

  return data;
}

module.exports = { saveIssue, getAllIssues };