const actionAreasQueries = require('../queries/actionAreas.js')
const objectivesQueries = require('../queries/objectives.js')
const notesQueries = require('../queries/notes.js')
const goalsQueries = require('../queries/goals.js')
const searchController = require('./search.js')

/* Example
actionAreas = {
    '1': {
        id: 1,
        rank: 10,
        title: 'asdf',
        description: 'asdf',
        abbr_title: 'asd',
        goals: [
        {
            id: 1,
            description: 'asdf',
            rank: 1,
            objectives: {
                4: {
                    id: 4,
                    status: "In Process",
                    target_academic_year: '2021 - 2022',
                    leads: 'smithj,jonesl',
                    project_members: 'adamsm,barkerb',
                    what_data_will_be_collected: 'asdf',
                    how_often_assessed: 'asdf',
                    acceptable_benchmark: 'asdf',
                    assessment_documents: 'asdf',
                    description: 'asdf',
                    rank: 2,
                    goal: 1,
                    notes: [
                    {
                        id: 5,
                        text: 'asdf',
                        user: 'asdf',
                        updated_at: datetime,
                        formattedDate: 'Wed Oct 06 2021, 1:25:54 PM'
                    }, etc.
                    ],
                }, etc
            }
        }, etc
        ]
    },
}
*/

async function getActionAreas (next) {
  // Make one big actionAreas object with all the data in our db.
  const actionAreas = {}
  // add each action_area
  const aaResults = await actionAreasQueries.getActionAreas(next).catch(next)
  for (const item of aaResults) {
    actionAreas[item.id] = item
  }
  // add goals for each action area
  for (const actionArea of Object.values(actionAreas)) {
    const goals = await goalsQueries.getGoalsByAA(actionArea.id, next).catch(next)
    goals.sort((a, b) => a.rank - b.rank)
    actionArea.goals = {}
    for (const goal of goals) {
      actionArea.goals[goal.id] = goal
    }
  }
  // add objective to each goal
  for (const actionArea of Object.values(actionAreas)) {
    for (const goal of Object.values(actionArea.goals)) {
      const objectives = await objectivesQueries.getObjectivesByGoalID(goal.id, next).catch(next)
      objectives.sort((a, b) => a.rank - b.rank)
      goal.objectives = {}
      for (const objective of objectives) {
        goal.objectives[objective.id] = objective
      }
    }
  }
  // add notes to each goal
  for (const actionArea of Object.values(actionAreas)) {
    for (const goal of Object.values(actionArea.goals)) {
      for (const objective of Object.values(goal.objectives)) {
        const notes = await notesQueries.getNotesByObjectiveID(objective.id, next).catch(next)
        orderAndFormatDates(notes)
        actionAreas[actionArea.id].goals[goal.id].objectives[objective.id].notes = notes
      }
    }
  }
  return actionAreas
}

async function getSelectedActionAreas (body, next) {
  const allSearchValues = await searchController.getSearchOptions(next).catch(next)

  const selectedSearchOptions = {
    status: body.status,
    target_academic_year: body.year,
    members_and_leads: body.members
  }

  // if the user doesn't select any options from a search field,
  // then assume they want all the options from that field.
  // E.g., if selectedSearchOptions.${field} is empty,
  //   then use the full field list from allSearchOptions.${field}
  for (const [k, v] of Object.entries(selectedSearchOptions)) {
    if (!v || !v.length) {
      selectedSearchOptions[k] = allSearchValues[k]
    }
  }

  // build a data object that looks like ActionAreas example above.
  const actionAreas = {}
  // add action_areas items
  const aaResults = await actionAreasQueries.getActionAreas(next).catch(next)
  for (const item of aaResults) {
    actionAreas[item.id] = item
  }
  // for each action area, add goals data
  for (const actionAreaID of Object.keys(actionAreas)) {
    const goals = await goalsQueries.getGoalsByAA(actionAreaID, next).catch(next)
    actionAreas[actionAreaID].goals = goals
  }
  // for each action area, add objectives: {objectiveID: objective}
  for (const actionAreaID of Object.keys(actionAreas)) {
    const objectives = await objectivesQueries.getObjectivesByAAWithSearchOption(actionAreaID, selectedSearchOptions, next).catch(next)
    // sort objectives array by objective.rank
    objectives.sort((a, b) => a.rank - b.rank)
    actionAreas[actionAreaID].objectives = {}
    for (const objective of objectives) {
      actionAreas[actionAreaID].objectives[objective.id] = objective
    }
  }
  // add notes to each objective
  for (const actionAreaID of Object.keys(actionAreas)) {
    for (const [objectivePK, objective] of Object.entries(actionAreas[actionAreaID].objectives)) {
      const objectiveID = objective.id
      const notes = await notesQueries.getNotesByObjectiveID(objectiveID, next).catch(next)
      orderAndFormatDates(notes)
      actionAreas[actionAreaID].objectives[objectivePK].notes = notes
    }
  }

  // remove action areas with objectives == {}
  const actionAreaIDs = Object.keys(actionAreas)
  for (const id of actionAreaIDs) {
    if (!Object.keys(actionAreas[id].objectives).length) {
      delete actionAreas[id]
    }
  }
  return actionAreas
}

// Helpers

function orderAndFormatDates (notes) {
  notes = notes.sort((a, b) => b.updated_at - a.updated_at)
  for (const note of notes) {
    note.formattedDate = `${note.updated_at.toDateString()}, ${note.updated_at.toLocaleTimeString()}`
  }
}

module.exports = {
  getActionAreas,
  getSelectedActionAreas
}
