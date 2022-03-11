const db = require('../db.js')

async function getObjectiveByAA(actionArea) {
  const queryText = `
      SELECT *
      FROM objectives
      WHERE action_area = $1;
    `
  const result = await db.query(queryText, [actionArea])
  const items = result.rows
  return items
}

async function getUniques(field) {
  const queryText = `
      SELECT DISTINCT ${field}
      FROM objectives;
    `
  const result = await db.query(queryText)
  const items = result.rows
  return items
}

module.exports = {
  getObjectiveByAA,
  getUniques
}