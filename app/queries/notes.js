const db = require('../db.js')

async function getNoteByObjectiveID(objectiveID) {
  const queryText = `
      SELECT id, text, notes.user as user
      FROM notes
      WHERE objective_id = $1
      ORDER BY id;
  `
  const result = await db.query(queryText, [objectiveID])
  const items = result.rows
  return items
}

module.exports = {
    getNoteByObjectiveID
}

// async function getAllItems () {
//   const queryText = `
//       SELECT id, slug, dest, username
//       FROM urls
//       ORDER BY id DESC;
//     `
//   const result = await db.query(queryText)
//   const items = result.rows
//   return items
// }

// async function getItemsByID (id) {
//   const queryText = `
//     SELECT id, slug, dest, username
//     FROM urls
//     WHERE id = $1;
//   `
//   const values = [id]
//   const result = await db.query(queryText, values)
//   const items = result.rows
//   return items
// }

// async function deleteItemByID (id) {
//   const queryText = `
//     DELETE FROM urls
//     WHERE id = $1
//   `
//   const values = [id]
//   const result = await db.query(queryText, values)
//   return result
// }

// async function createItem (item) {
//   const queryText = `
//     INSERT INTO urls (slug, dest, username)
//     VALUES ($1, $2, $3)
//   `
//   const values = [item.slug, item.dest, item.username]
//   const result = await db.query(queryText, values)
//   return result
// }

// async function updateItem (item) {
//   const queryText = `
//     UPDATE urls
//     SET slug = $1, dest = $2, username = $3
//     WHERE id = $4
//   `
//   const values = [item.slug, item.dest, item.username, item.id]
//   const result = await db.query(queryText, values)
//   return result
// }

// module.exports = {
//   getAllItems,
//   getItemsByID,
//   createItem,
//   deleteItemByID,
//   updateItem
// }
