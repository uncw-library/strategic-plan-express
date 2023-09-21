const db = require('../db.js')

const notesQueries = require('./notes.js')
const actionAreasQueries = require('./actionAreas.js')

/*  DB table 'objectives' is:
  - id                            int     UID
  - status                        text
  - target_academic_year          text
  - leads                         text    like 'smithj,jonesw'
  - project_members               text    same
  - what_data_will_be_collected   text
  - how_often_assessed            text
  - acceptable_benchmark          text
  - assessment_documents          text
  - description                   text
  - rank                          int     sort order for display
  - goal                          int     goals table id this objective belongs to
*/

async function getObjectivesByGoalID (goalID, next) {
  const queryText = `
      SELECT *
      FROM objectives
      WHERE goal = $1
      ORDER BY rank DESC;
    `
  const result = await db.query(queryText, [goalID])
    .catch(next)
  const items = result.rows
  return items
}

async function getObjectivesByAAWithSearchOption (actionArea, options, next) {
  /* Example:
    options = {
      status: ['asdf', 'qwer'] or 'asdf'
      target_academic_year: ['asdf', 'asdf'] or 'asdf'
      members_and_leads: ['asdf', 'asdf'] or 'asdf'
    }
  */

  // convert to array if a string
  for (const [k, v] of Object.entries(options)) {
    if (typeof v === 'string') {
      options[k] = [v]
    }
  }

  /* SQL strange query:
    STRING_TO_ARRAY(x, ',') && $4  means:
      Split x='a,b,c' into ['a','b','c']
      Take $4 == options.members_and_leads == ['d','e','f']
      check if there's any overlap in those two arrays
  */
  const queryText = `
      SELECT *
      FROM objectives
      WHERE action_area = $1
        AND objectives.status = ANY($2)
        AND objectives.target_academic_year = ANY($3)
        AND (
           STRING_TO_ARRAY(objectives.leads, ',') && $4
           OR STRING_TO_ARRAY(objectives.project_members, ',') && $4
        )
      ORDER BY rank DESC;
  `
  const result = await db.query(queryText, [
    actionArea,
    options.status,
    options.target_academic_year,
    options.members_and_leads
  ])
    .catch(next)
  const items = result.rows
  return items
}

async function getUniques (field, next) {
  const queryText = `
      SELECT DISTINCT ${field}
      FROM objectives;
    `
  const result = await db.query(queryText)
    .catch(next)
  const items = result.rows
  return items
}

async function getObjectiveByObjectiveID (objectiveID, next) {
  const queryText = `
      SELECT *
      FROM objectives
      WHERE id = $1
  `
  const result = await db.query(queryText, [objectiveID])
    .catch(next)
  const objective = result.rows[0]
  objective.notes = await notesQueries.getNotesByObjectiveID(objective.id)
    .catch(next)
  objective.actionArea = await actionAreasQueries.getActionAreaByObjectiveID(objective.id)
    .catch(next)
  return objective
}

async function updateObjectives (objectiveID, status, year, leads, members, next) {
  const queryText = `
    UPDATE objectives
    SET status = $1, target_academic_year = $2, leads = $3, project_members = $4
    WHERE id = $5
  `
  return db.query(queryText, [status, year, leads, members, objectiveID])
    .then(r => r.rows)
    .catch(next)
}

async function updateMeasures (objectiveID, whatdata, howoften, benchmark, next) {
  const queryText = `
    UPDATE objectives
    SET what_data_will_be_collected = $1, how_often_assessed = $2, acceptable_benchmark = $3
    WHERE id = $4
  `
  return db.query(queryText, [whatdata, howoften, benchmark, objectiveID])
    .then(r => r.rows)
    .catch(next)
}

async function getCompletedObjectivesByActionArea (next) {
  const queryText = `
    SELECT action_area, COUNT(status)
    FROM objectives
    INNER JOIN goals
      ON goals.id = objectives.goal
    WHERE LOWER(status) = 'complete'
    GROUP BY action_area;
  `
  const result = await db.query(queryText)
    .catch(next)
  const items = result.rows
  return items
}

async function getTotalObjectivesByActionArea (next) {
  const queryText = `
  SELECT action_area, COUNT(status)
  FROM objectives
  INNER JOIN goals
    ON goals.id = objectives.goal
  GROUP BY action_area;
  `
  const result = await db.query(queryText)
    .catch(next)
  const items = result.rows
  return items
}

module.exports = {
  getObjectivesByGoalID,
  getObjectivesByAAWithSearchOption,
  getUniques,
  getObjectiveByObjectiveID,
  updateObjectives,
  updateMeasures,
  getCompletedObjectivesByActionArea,
  getTotalObjectivesByActionArea
}
