const db = require('../db.js')

async function getNotesByObjectiveID (objectiveID) {
  const queryText = `
      SELECT id, text, notes.user as user, updated_at, created_at 
      FROM notes
      WHERE objective_id = $1
      ORDER BY id;
  `
  const result = await db.query(queryText, [objectiveID])
  const items = result.rows
  return items
}

async function getActionAreaObjectiveByNoteID (noteID) {
  const queryText = `
      SELECT action_areas.title, objectives.description, objectives.id AS objectives_pk
      FROM notes
      LEFT JOIN objectives
        ON notes.objective_id = objectives.id
      LEFT JOIN action_areas
        ON action_areas.id = objectives.action_area
      WHERE notes.id = $1;
  `
  const result = await db.query(queryText, [noteID])
  const items = result.rows[0]
  return items
}

async function addNote (name, notetext, objectiveID) {
  const updatedDate = new Date()
  const createdDate = new Date()
  const queryText = `
    INSERT INTO notes ("user", "text", objective_id, updated_at, created_at)
    VALUES ($1, $2, $3, $4, $5)
  `
  return await db.query(queryText, [name, notetext, objectiveID, updatedDate, createdDate])
}

module.exports = {
  getNotesByObjectiveID,
  getActionAreaObjectiveByNoteID,
  addNote
}
