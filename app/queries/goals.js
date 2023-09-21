const db = require('../db.js')

/*  DB table 'goals' is:
  - id              int     UID
  - action_area     int     action_areas table id this goal belongs to
  - description     text
  - rank            int     sort order for display
*/

async function getGoalsByAA (actionAreaID, next) {
  const queryText = `
      SELECT id, description, rank
      FROM goals
      WHERE action_area = $1
      ORDER BY id;
  `
  const result = await db.query(queryText, [actionAreaID])
    .catch(next)
  const items = result.rows
  return items
}

module.exports = {
  getGoalsByAA
}
