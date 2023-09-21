const db = require('../db.js')

/*  DB table 'action_areas' is:
  - id          int     UID
  - rank        int     sort order for display
  - title       text
  - description text
  - abbr_title  text
*/

async function getActionAreas (next) {
  const queryText = `
    SELECT id, rank, title, description, abbr_title
    FROM action_areas
    ORDER BY rank DESC;
    `
  const result = await db.query(queryText)
    .catch(next)
  const items = result.rows
  return items
}

async function getActionAreaByObjectiveID (objectiveID, next) {
  const queryText = `
      SELECT action_areas.id, action_areas.rank, action_areas.title, action_areas.description, action_areas.abbr_title
      FROM action_areas
      LEFT JOIN goals
        ON action_areas.id = goals.action_area
      LEFT JOIN objectives
        ON goals.id = objectives.goal
      WHERE objectives.id = $1
      ORDER BY id;
  `
  const result = await db.query(queryText, [objectiveID])
    .catch(next)
  const items = result.rows
  return items
}

module.exports = {
  getActionAreas,
  getActionAreaByObjectiveID
}
