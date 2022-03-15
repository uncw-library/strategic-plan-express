const db = require('../db.js')

const notesQueries = require('./notes.js')
const actionAreasQueries = require('./actionAreas.js')

async function getObjectivesByAA(actionArea) {
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

async function getObjectiveByObjectiveID(objectiveID) {
  const queryText = `
      SELECT *
      FROM objectives
      WHERE id = $1
  `
  const result = await db.query(queryText, [objectiveID])
  const objective = result.rows[0]
  objective['notes'] = await notesQueries.getNotesByObjectiveID(objective.id)
  objective['actionArea'] = await actionAreasQueries.getActionAreaByObjectiveID(objective.id)
  return objective
}

module.exports = {
  getObjectivesByAA,
  getUniques,
  getObjectiveByObjectiveID
}