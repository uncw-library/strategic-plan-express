const actionAreasQueries = require('../queries/actionAreas.js')
const objectivesQueries = require('../queries/objectives.js')

/* Example
  plotData = [
    {
      id: 6,
      rank: 5,
      title: 'objective title asdf',
      abbr_title: 'asdf',
      percentComplete: 87.65465
    }, etc
  ]
*/

async function getPlotData (next) {
  const actionAreas = await actionAreasQueries.getActionAreas(next).catch(next)
  const completeds = await objectivesQueries.getCompletedObjectivesByActionArea(next).catch(next)
  const totals = await objectivesQueries.getTotalObjectivesByActionArea(next).catch(next)
  const percents = computePercents(completeds, totals)
  const plotData = actionAreas.map(i => {
    return {
      id: i.id,
      rank: i.rank,
      title: i.title,
      abbr_title: i.abbr_title,
      percentComplete: percents[i.id]
    }
  })
  return plotData
}

function computePercents (completeds, totals) {
  const percents = {}
  for (const t of totals) {
    for (const c of completeds) {
      if (t.action_area === c.action_area) {
        if (t.count === 0) {
          continue
        }
        percents[t.action_area] = Math.round(c.count / t.count * 100)
      }
    }
  }
  return percents
}

module.exports = {
  getPlotData
}
