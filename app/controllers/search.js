const objectivesQueries = require('../queries/objectives.js')

/* Example
  searchOptions = {
    status: ['asdf','qwer', etc],
    target_academic_year: ['1234 - 1234', '23452 - 1234', etc],
    leads: ['asdf', 'qwer', etc],
    project_members: ['asdf', 'qwer', etc],
    members_and_leads: ['asdf', 'qwer', etc]
  }
*/

async function getSearchOptions () {
  // gets each unique value in the db records for each 'fields' db column.
  // returns to the frontend template {'fieldX': [unique item1, unique item2], etc}
  // used by the frontend template to populate the search box.
  const searchOptions = {
    status: new Set(),
    target_academic_year: new Set(),
    leads: new Set(),
    project_members: new Set()
  }

  // look up the db values for each of the fields, then add them to the searchOptions[field] set
  for (const field of Object.keys(searchOptions)) {
    const results = await objectivesQueries.getUniques(field)
    for (const result of results.values()) {
      const items = result[field]
      if (!items) {
        continue
      }
      // some values are 'person1,person2, person3, etc', so split them.
      for (const item of items.split(',')) {
        if (!item || !item.trim()) {
          continue
        }
        searchOptions[field].add(item.trim())
      }
    }
  }

  // merge the 'leads' and 'project_members' into 'members_and_leads'
  searchOptions.members_and_leads = new Set([...searchOptions.leads, ...searchOptions.project_members])

  // convert the sets into alphabetical-sorted arrays
  for (const field of Object.keys(searchOptions)) {
    searchOptions[field] = Array.from(searchOptions[field]).sort()
  }

  return searchOptions
}

module.exports = {
  getSearchOptions
}
