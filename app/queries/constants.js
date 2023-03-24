const db = require('../db.js')

async function getUsers () {
  const queryText = `
    SELECT "name"
    FROM users
    WHERE isactive = true 
    ORDER BY "name";
    `
  const result = await db.query(queryText)
  const items = result.rows
  return items
}

async function getYears () {
  const queryText = `
    SELECT year
    FROM objective_year
    WHERE isactive = true 
    ORDER BY rank;
    `
  const result = await db.query(queryText)
  const items = result.rows
  return items
}

async function getStatuses () {
  const queryText = `
    SELECT status
    FROM objective_status
    ORDER BY rank;
    `
  const result = await db.query(queryText)
  const items = result.rows
  return items
}

module.exports = {
  getUsers,
  getYears,
  getStatuses
}
