const fsSync = require('fs')
const csvWriter = require('csv-writer').createArrayCsvWriter

const actionAreasController = require('./actionAreas.js')

async function writeCSV (next) {
  const [header, rows] = await makeAllDataFlat()
  const outputFilename = "strategic_plan_data.csv"
  if (!fsSync.existsSync('./app/public/downloads')) {
    fsSync.mkdirSync('./app/public/downloads')
  }
  const outputPath = `./app/public/downloads/${outputFilename}`
  const writer = csvWriter({
      path: outputPath,
      header: header
    })
  return await writer.writeRecords(rows)
    .then(() => outputPath) // return the outputPath to the previous function
    .catch(next)
}

async function makeAllDataFlat() {
  const allData = await actionAreasController.getActionAreas()
  const headers = [
    'actionarea',
    'objective',
    'acceptable_benchmark',
    'how_often_assessed',
    'what_data_will_be_collected', 
    'leads',
    'project_members',
    'status',
    'target_academic_year',
    'notes'
  ]
  const rows = []
  for ([aaID, actionArea] of Object.entries(allData)) {
    for ([oID, objective] of Object.entries(actionArea.objectives)) {
      let notes = ""
      for ([nID, note] of Object.entries(objective.notes)) {
        const extraPortion = `"${note.text} -- by ${note.user}"`
        notes = `${extraPortion}, ${notes}`
      }

      const actionarea = `${actionArea.id}. ${actionArea.title}`
      const obj = objective.description || ''
      const acceptableBenchmark = objective['acceptable_benchmark'] || ''
      const howOftenAssessed = objective['how_often_assessed'] || ''
      const whatDataWillBeCollected = objective['what_data_will_be_collected'] || ''
      const leads = objective['leads'] || ''
      const projectMembers = objective['project_members'] || ''
      const status = objective['status'] || ''
      const targetAcademicYear = objective['target_academic_year'] || ''

      const newRow = [
        actionarea,
        obj,
        acceptableBenchmark,
        howOftenAssessed,
        whatDataWillBeCollected,
        leads,
        projectMembers,
        status,
        targetAcademicYear,
        notes
      ]
      rows.push(newRow)
    }
  }
  return [headers, rows]
}

module.exports = {
  writeCSV
}