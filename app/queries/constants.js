const db = require('../db.js')

/*  DB table 'objective_status' is:
  - status  text    ["Completed" or "In Process" or "Not Started" or "Other"]
  - rank    int     sort order for display

DB table 'objective_year' is:
  - year      text    ..like "2020 - 2021"
  - rank      int     sort order for display
  - isactive  bool

DB table 'users' is weird.
  It limits who can be a lead or project_member.
  We may have to add each staff to the table.
  It is:
  - name      text    ..like 'smithj'
  - isactive  bool
*/

async function getUsers (next) {
  const queryText = `
    SELECT "name"
    FROM users
    WHERE isactive = true 
    ORDER BY "name";
    `
  const result = await db.query(queryText)
    .catch(next)
  const items = result.rows
  return items
}

async function getYears (next) {
  const queryText = `
    SELECT year
    FROM objective_year
    WHERE isactive = true 
    ORDER BY rank;
    `
  const result = await db.query(queryText)
    .catch(next)
  const items = result.rows
  return items
}

async function getStatuses (next) {
  const queryText = `
    SELECT status
    FROM objective_status
    ORDER BY rank;
    `
  const result = await db.query(queryText)
    .catch(next)
  const items = result.rows
  return items
}

module.exports = {
  getUsers,
  getYears,
  getStatuses
}
