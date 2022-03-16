const actionAreasQueries = require('../queries/actionAreas.js')

// Example:  plotData = [
//    {
//      id: 6,
//      rank: 5,
//      title: 'objective title asdf',
//      percentComplete: 87.65465
//    }, etc
// ]

async function getPlotData () {
  const actionAreas = await actionAreasQueries.getActionAreas()
  const completeds = await actionAreasQueries.getCompletedItemsByActionArea()
  const totals = await actionAreasQueries.getTotalsByActionArea()
  const percents = computePercents(completeds, totals)
  const plotData = actionAreas.map(i => {
    return {
      id: i.id,
      rank: i.rank,
      title: i.title,
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
        percents[t.action_area] = c.count / t.count * 100
      }
    }
  }
  return percents
}

module.exports = {
  getPlotData
}
