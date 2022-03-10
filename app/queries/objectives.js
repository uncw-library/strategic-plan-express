const db = require('../db.js')

async function getObjectiveByAA(actionArea) {
  const queryText = `
      SELECT id, rank, description
      FROM objectives
      WHERE action_area = $1
    `
  const result = await db.query(queryText, [actionArea])
  const items = result.rows
  return items
}

module.exports = {
  getObjectiveByAA
}