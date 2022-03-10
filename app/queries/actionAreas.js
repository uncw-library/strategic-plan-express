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
    FROM objective_details
    LEFT JOIN objectives
      ON objective_details.id = objectives.id 
    WHERE LOWER(status) = 'complete'
    GROUP BY action_area
  `
  const result = await db.query(queryText)
  const items = result.rows
  return items
}

async function getTotalsByActionArea () {
  const queryText = `
    SELECT action_area, COUNT(status)
    FROM objective_details
    LEFT JOIN objectives
      ON objective_details.id = objectives.id 
    GROUP BY action_area
  `
  const result = await db.query(queryText)
  const items = result.rows
  return items  
}


module.exports = {
  getActionAreas,
  getCompletedItemsByActionArea,
  getTotalsByActionArea
}