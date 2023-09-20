const actionAreasQueries = require('../queries/actionAreas.js')
const objectivesQueries = require('../queries/objectives.js')
const notesQueries = require('../queries/notes.js')
const goalsQueries = require('../queries/goals.js')
const searchController = require('./search.js')

// Example:  actionAreas = {
//     '1': {
//         id: 1,
//         rank: 10,
//         title: 'asdf',
//         description: 'asdf',
//         goals: [
//             {id: 1, description: 'asdf'},
//             {id: 13, description: 'qwer'}, etc
//         ],
//         objectives: {
//             4: {
//                 id: 4
//                 action_area: 7,
//                 rank: 14,
//                 description: 'asdf',
//                 priority: 1,
//                 status: 'Not Started',
//                 objective_id: 108,
//                 target_academic_year: '2021 - 2022',
//                 leads: 'asdf,zxcv',
//                 project_members: 'asdf,qwer',
//                 what_data_will_be_collected: 'asdf',
//                 how_often_assessed: 'asdf',
//                 acceptable_benchmark: 'asdf',
//                 summary_of_findings: null,
//                 analysis: null,
//                 comparision_to_benchmark: null,
//                 substantiating_evidence: null,
//                 actions_for_improvement: null,
//                 notes: [
//                 {
//                     id: 5,
//                     text: 'asdf',
//                     user: 'asdf',
//                     updated_at: datetime,
//                     formattedDate: 'Wed Oct 06 2021, 1:25:54 PM'
//                 }, etc.
//                ],
//             }, etc
//         }
//     }, etc
// }

// All our data in the database can be represented as the actionAreas example above, so
// this function makes that actionAreas object.
async function getActionAreas () {
  const actionAreas = {}
  // add action_areas items
  const aaResults = await actionAreasQueries.getActionAreas()
  for (const item of aaResults) {
    actionAreas[item.id] = item
  }
  // for each action area, add goals data
  for (const actionAreaID of Object.keys(actionAreas)) {
    const goals = await goalsQueries.getGoalsByAA(actionAreaID)
    actionAreas[actionAreaID].goals = goals
  }
  // for each action area, add objectives: {objectiveID: objective}
  for (const actionAreaID of Object.keys(actionAreas)) {
    const objectives = await objectivesQueries.getObjectivesByAA(actionAreaID)
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
      const notes = await notesQueries.getNotesByObjectiveID(objectiveID)
      orderAndFormatDates(notes)
      actionAreas[actionAreaID].objectives[objectivePK].notes = notes
    }
  }
  return actionAreas
}

async function getSelectedActionAreas (body) {
  const allSearchValues = await searchController.getSearchOptions()

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
  const aaResults = await actionAreasQueries.getActionAreas()
  for (const item of aaResults) {
    actionAreas[item.id] = item
  }
  // for each action area, add goals data
  for (const actionAreaID of Object.keys(actionAreas)) {
    const goals = await goalsQueries.getGoalsByAA(actionAreaID)
    actionAreas[actionAreaID].goals = goals
  }
  // for each action area, add objectives: {objectiveID: objective}
  for (const actionAreaID of Object.keys(actionAreas)) {
    const objectives = await objectivesQueries.getObjectivesByAAWithSearchOption(actionAreaID, selectedSearchOptions)
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
      const notes = await notesQueries.getNotesByObjectiveID(objectiveID)
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
