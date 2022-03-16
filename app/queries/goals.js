const db = require('../db.js')

async function getGoalsByAA (actionAreaID) {
  const queryText = `
      SELECT id, description
      FROM goals
      WHERE action_area = $1
      ORDER BY id;
  `
  const result = await db.query(queryText, [actionAreaID])
  const items = result.rows
  return items
}

module.exports = {
  getGoalsByAA
}
