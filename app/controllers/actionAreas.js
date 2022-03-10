const actionAreasQueries = require('../queries/actionAreas.js')
const objectivesQueries = require('../queries/objectives.js')
const notesQueries = require('../queries/notes.js')
const goalsQueries = require('../queries/goals.js')

// Example:  actionAreas = {
//     '1': {
//         id: 1,
//         rank: 1,
//         title: 'asdf',
//         description: 'asdf',
//         goals: [
//             {id: 1, description: 'asdf'},
//             {id: 13, description: 'qwer'}, etc
//         ],
//         objectives: [
//             action_area: 7,
//             rank: 14,
//             description: 'asdf',
//             priority: 1,
//             status: 'Not Started',
//             objective_id: 108,
//             target_academic_year: '2021 - 2022',
//             leads: 'asdf',
//             project_members: 'asdf,qwer',
//             what_data_will_be_collected: 'asdf',
//             how_often_assessed: 'asdf',
//             acceptable_benchmark: 'asdf',
//             assessment_documents: null,
//             summary_of_findings: null,
//             analysis: null,
//             comparision_to_benchmark: null,
//             substantiating_evidence: null,
//             actions_for_improvement: null,
//             status_report: null
//             notes: [
//                 id: 1,
//                 text: 'asdf',
//                 user: 'asdf'  
//             ], etc.
//         ]
//     }
// }

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
    // for each action area, add objectives data
    for (actionAreaID of Object.keys(actionAreas)) {
        const objectives = await objectivesQueries.getObjectiveByAA(actionAreaID)
        // sort objectives array by objective.rank
        objectives.sort((a,b) =>  a.rank - b.rank)
        actionAreas[actionAreaID]['objectives'] = objectives
    }
    // add notes to each objective
    for (actionAreaID of Object.keys(actionAreas)) {
        for (objective of actionAreas[actionAreaID].objectives) {
            const notes = await notesQueries.getNoteByObjectiveID(objective.objective_id)
            actionAreas[actionAreaID]['objectives']['notes'] = notes
        }
    }
    console.log(actionAreas['1']['objectives'])
    return actionAreas
}

module.exports = {
  getActionAreas
}