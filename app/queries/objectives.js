const db = require('../db.js')

const notesQueries = require('./notes.js')
const actionAreasQueries = require('./actionAreas.js')

async function getObjectivesByAA (actionArea) {
  const queryText = `
      SELECT *
      FROM objectives
      WHERE action_area = $1;
    `
  const result = await db.query(queryText, [actionArea])
  const items = result.rows
  return items
}

async function getObjectivesByAAWithSearchOption (actionArea, options) {
  // Example:   options = {
  //              status: ['asdf', 'qwer'] or 'asdf'
  //              target_academic_year: ['asdf', 'asdf'] or 'asdf'
  //              members_and_leads: ['asdf', 'asdf'] or 'asdf'
  //            }

  // convert v to array if v is string
  for (const [k, v] of Object.entries(options) ) {
    if (typeof v === 'string') {
      options[k] = [v]
    }
  }

  const queryText = `
      SELECT *
      FROM objectives
      WHERE action_area = $1
        AND objectives.status = ANY($2)
        AND objectives.target_academic_year = ANY($3)
        AND (
           objectives.leads = ANY ($4)
           OR objectives.project_members = ANY ($4)
        )
      ;        
  `
  const result = await db.query(queryText, [
    actionArea,
    options.status,
    options.target_academic_year,
    options.members_and_leads
  ])
  const items = result.rows
  return items
}

async function getUniques (field) {
  const queryText = `
      SELECT DISTINCT ${field}
      FROM objectives;
    `
  const result = await db.query(queryText)
  const items = result.rows
  return items
}

async function getObjectiveByObjectiveID (objectiveID) {
  const queryText = `
      SELECT *
      FROM objectives
      WHERE id = $1
  `
  const result = await db.query(queryText, [objectiveID])
  const objective = result.rows[0]
  objective.notes = await notesQueries.getNotesByObjectiveID(objective.id)
  objective.actionArea = await actionAreasQueries.getActionAreaByObjectiveID(objective.id)
  return objective
}

async function updateObjectives (objectiveID, status, year, leads, members) {
  const queryText = `
    UPDATE objectives
    SET status = $1, target_academic_year = $2, leads = $3, project_members = $4
    WHERE id = $5
  `
  return db.query(queryText, [status, year, leads, members, objectiveID])
    .then(r => r.rows)
}

async function updateMeasures (objectiveID, whatdata, howoften, benchmark) {
  const queryText = `
    UPDATE objectives
    SET what_data_will_be_collected = $1, how_often_assessed = $2, acceptable_benchmark = $3
    WHERE id = $4
  `
  return db.query(queryText, [whatdata, howoften, benchmark, objectiveID])
    .then(r => r.rows)
}

module.exports = {
  getObjectivesByAA,
  getObjectivesByAAWithSearchOption,
  getUniques,
  getObjectiveByObjectiveID,
  updateObjectives,
  updateMeasures
}
