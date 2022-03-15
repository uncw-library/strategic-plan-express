const db = require('../db.js')

async function getActionAreas () {
  const queryText = `
      SELECT id, rank, title, description
      FROM action_areas
      ORDER BY rank DESC;
    `
  const result = await db.query(queryText)
  const items = result.rows
  return items
}

async function getCompletedItemsByActionArea () {
  const queryText = `
    SELECT action_area, COUNT(status)
    FROM objectives
    WHERE LOWER(status) = 'complete'
    GROUP BY action_area;
  `
  const result = await db.query(queryText)
  const items = result.rows
  return items
}

async function getTotalsByActionArea () {
  const queryText = `
    SELECT action_area, COUNT(status)
    FROM objectives
    GROUP BY action_area;
  `
  const result = await db.query(queryText)
  const items = result.rows
  return items  
}

async function getActionAreaByObjectiveID(objectiveID) {
  const queryText = `
      SELECT action_areas.id, action_areas.rank, action_areas.title, action_areas.description
      FROM objectives
      LEFT JOIN action_areas
        ON action_areas.id = objectives.action_area
      WHERE objectives.id = $1
      ORDER BY id;
  `
  const result = await db.query(queryText, [objectiveID])
  const items = result.rows
  return items
}


module.exports = {
  getActionAreas,
  getCompletedItemsByActionArea,
  getTotalsByActionArea,
  getActionAreaByObjectiveID
}