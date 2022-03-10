const objectiveDetailsQueries = require('../queries/objectiveDetails.js')

async function getSearchOptions() {
  // gets each unique value in the db records for each 'fields' db column.
  // returns to the frontend template {'fieldX': [unique item1, unique item2], etc} 
  // used by the frontend template to populate the search box.
  const fields = {
    'status': new Set(),
    'target_academic_year': new Set(),
    'leads': new Set(),
    'project_members': new Set()
  }

  // look up the db values for each of the fields, then add them to the fields[field] set
  for (field of Object.keys(fields)) {
    const results = await objectiveDetailsQueries.getUniques(field)
    for (result of results.values()) {
      const items = result[field]
      if (!items) {
        continue
      }
      // some values are 'person1,person2, person3, etc', so split them.
      for (item of items.split(',')) {
        if (!item || !item.trim()) {
          continue
        }
        fields[field].add(item.trim())
      }
    }
  }

  // merge the 'leads' and 'project_members' into 'members_and_leads' 
  fields['members_and_leads'] = new Set([...fields['leads'], ...fields['project_members']])

  // convert the sets into alphabetical-sorted arrays
  for (field of Object.keys(fields)) {
    fields[field] = Array.from(fields[field]).sort()
  }

  return fields
}

module.exports = {
  getSearchOptions
}

