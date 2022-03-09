const db = require('../db.js')

async function getPlotData() {
  const actionAreas = await getActionAreas()
  const completeds = await getCompletedItemsByActionArea()
  const totals = await getTotalsByActionArea()
  const percents = computePercents(completeds, totals)
  const merged = actionAreas.map(i => {
    return {
      id: i.id,
      rank: i.rank,
      title: i.title,
      percentComplete: percents[i.id]
    }
  })
  return merged
}

function computePercents(completeds, totals) {
  const percents = {}
  for (const t of totals) {
    for (const c of completeds) {
      if (t.action_area === c.action_area) {
        if (t.count === 0) {
          continue
        }
        percents[t.action_area] = c.count / t.count * 100
      }
    }
  }
  return percents
}

async function getActionAreas () {
  const queryText = `
      SELECT id, rank, title
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
      ON objective_details.objective_id = objectives.id 
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
      ON objective_details.objective_id = objectives.id 
    GROUP BY action_area
  `
  const result = await db.query(queryText)
  const items = result.rows
  return items  
}

module.exports = {
  getPlotData
}