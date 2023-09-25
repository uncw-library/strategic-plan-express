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
        objective.notes = notes
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
      const objectives = await objectivesQueries.getObjectivesByGoalWithSearchOption(goal.id, selectedSearchOptions, next).catch(next)
      objectives.sort((a, b) => a.rank - b.rank)
      goal.objectives = {}
      for (const objective of objectives) {
        goal.objectives[objective.id] = objective
      }
    }
  }
  // add notes to each objective
  for (const actionArea of Object.values(actionAreas)) {
    for (const goal of Object.values(actionArea.goals)) {
      for (const objective of Object.values(goal.objectives)) {
        const notes = await notesQueries.getNotesByObjectiveID(objective.id, next).catch(next)
        orderAndFormatDates(notes)
        objective.notes = notes
      }
    }
  }

  removeGoalsWithNoObjectives(actionAreas)
  removeActionAreasWithNoGoals(actionAreas)
  return actionAreas
}

// Helpers

function orderAndFormatDates (notes) {
  notes = notes.sort((a, b) => b.updated_at - a.updated_at)
  for (const note of notes) {
    note.formattedDate = `${note.updated_at.toDateString()}, ${note.updated_at.toLocaleTimeString()}`
  }
}

function removeGoalsWithNoObjectives (actionAreas) {
  const forGoalDelete = []
  for (const [actionAreaID, actionArea] of Object.entries(actionAreas)) {
    for (const [goalID, goal] of Object.entries(actionArea.goals)) {
      if (Object.keys(goal.objectives).length === 0) {
        forGoalDelete.push([actionAreaID, goalID])
      }
    }
  }
  for (const [actionAreaID, goalID] of forGoalDelete) {
    delete actionAreas[actionAreaID].goals[goalID]
  }
}

function removeActionAreasWithNoGoals (actionAreas) {
  const forActionAreaDelete = []
  for (const [actionAreaID, actionArea] of Object.entries(actionAreas)) {
    if (Object.keys(actionArea.goals).length === 0) {
      forActionAreaDelete.push(actionAreaID)
    }
  }
  for (const actionAreaID of forActionAreaDelete) {
    delete actionAreas[actionAreaID]
  }
}

module.exports = {
  getActionAreas,
  getSelectedActionAreas
}
