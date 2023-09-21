const db = require('../db.js')

/*  DB table 'notes' is:
  - id            int           UID
  - updated_at    timestamp
  - text          text
  - user          text          like 'smithj'
  - objective_id  int           objectives table item this note belongs to
*/

async function getNotesByObjectiveID (objectiveID, next) {
  const queryText = `
      SELECT id, text, notes.user as user, updated_at
      FROM notes
      WHERE objective_id = $1
      ORDER BY id;
  `
  const result = await db.query(queryText, [objectiveID])
    .catch(next)
  const items = result.rows
  return items
}

async function getActionAreaObjectiveByNoteID (noteID, next) {
  const queryText = `
      SELECT action_areas.title, objectives.description, objectives.id AS objectives_pk
      FROM notes
      LEFT JOIN objectives
        ON notes.objective_id = objectives.id
      LEFT JOIN goals
        ON objectives.goal = goal.id
      LEFT JOIN action_areas
        ON goal.action_area = action_areas.id
      WHERE notes.id = $1;
  `
  const result = await db.query(queryText, [noteID])
    .catch(next)
  const items = result.rows[0]
  return items
}

async function addNote (name, notetext, objectiveID, next) {
  const updatedDate = new Date()
  const queryText = `
    INSERT INTO notes ("user", "text", objective_id, updated_at)
    VALUES ($1, $2, $3, $4)
  `
  return await db.query(queryText, [name, notetext, objectiveID, updatedDate])
    .catch(next)
}

module.exports = {
  getNotesByObjectiveID,
  getActionAreaObjectiveByNoteID,
  addNote
}
