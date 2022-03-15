const actionAreasQueries = require('../queries/actionAreas.js')
const objectivesQueries = require('../queries/objectives.js')
const notesQueries = require('../queries/notes.js')
const goalsQueries = require('../queries/goals.js')

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
//                 leads: 'asdf',
//                 project_members: 'asdf,qwer',
//                 what_data_will_be_collected: 'asdf',
//                 how_often_assessed: 'asdf',
//                 acceptable_benchmark: 'asdf',
//                 assessment_documents: null,
//                 summary_of_findings: null,
//                 analysis: null,
//                 comparision_to_benchmark: null,
//                 substantiating_evidence: null,
//                 actions_for_improvement: null,
//                 status_report: null
//                 notes: [
//                     id: 5,
//                     text: 'asdf',
//                     user: 'asdf'  
//                 ], etc.
//             }, etc
//         }
//     }, etc
// }


// All our data in the database can be represented as the actionAreas example above, so
// this function makes that actionAreas object. 
async function getActionAreas () {
    const actionAreas = new Object()
    // add action_areas items
    const aaResults = await actionAreasQueries.getActionAreas()
    for (item of aaResults) {
        actionAreas[item.id] = item
    }
    // for each action area, add goals data
    for (actionAreaID of Object.keys(actionAreas)) {
        const goals = await goalsQueries.getGoalsByAA(actionAreaID)
        actionAreas[actionAreaID]['goals'] = goals
    }
    // for each action area, add objectives: {objectiveID: objective}
    for (actionAreaID of Object.keys(actionAreas)) {
        const objectives = await objectivesQueries.getObjectivesByAA(actionAreaID)
        // sort objectives array by objective.rank
        objectives.sort((a,b) =>  a.rank - b.rank)
        actionAreas[actionAreaID]['objectives'] = new Object()
        for (objective of objectives) {
            actionAreas[actionAreaID]['objectives'][objective.id] = objective
        }
    }
    // add notes to each objective
    for (actionAreaID of Object.keys(actionAreas)) {
        for (const [objectivePK, objective] of Object.entries(actionAreas[actionAreaID]['objectives'])) {
            const objectiveID = objective.id
            const notes = await notesQueries.getNotesByObjectiveID(objectiveID)
            actionAreas[actionAreaID]['objectives'][objectivePK]['notes'] = notes
        }
    }
    return actionAreas
}

module.exports = {
  getActionAreas
}