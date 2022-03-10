const actionAreasQueries = require('../queries/actionAreas.js')
const objectivesQueries = require('../queries/objectives.js')

async function getActionAreas () {
    const actionAreas = new Object()
    const aaResults = await actionAreasQueries.getActionAreas()
    for (item of aaResults) {
        actionAreas[item.id] = item
    }
    // console.log(actionAreas)
    for (actionArea of Object.keys(actionAreas)) {
        const objectives = await objectivesQueries.getObjectiveByAA(actionArea)
        // if (!actionAreas[actionArea]['objectives']) {
        //     actionAreas[actionArea]['objectives'] = new Object()
        // }
        // sort objectives array by objective.rank
        objectives.sort((a,b) =>  a.rank - b.rank)
        console.log(objectives)
        actionAreas[actionArea]['objectives'] = objectives
    }
}

module.exports = {
  getActionAreas
}