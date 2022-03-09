const db = require('../db.js')

async function getSearchOptions() {
  // const fields = {
  //   'status': new Set(),
  //   'target_academic_year': new Set(),
  //   'leads': new Set(),
  //   'project_members': new Set()
  // }
  // for (field of Object.values(fields)) {
  //   const results = await getUniques(field)
  //   for (result of results.values()) {
  //     fields[field].add(result)
  //   }
  // }
  // return fields
  return false
}

async function getUniques(field) {
  const queryText = `
      SELECT DISTINCT ${field}
      FROM objective_details
    `
  const result = await db.query(queryText)
  const items = result.rows
  console.log(items)
  return items
}


module.exports = {
  getSearchOptions
}

