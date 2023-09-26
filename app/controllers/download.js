const fsSync = require('fs')
const fs = require('fs/promises')
const csvWriter = require('csv-writer').createArrayCsvWriter
const jsYaml = require('js-yaml')

const actionAreasController = require('./actionAreas.js')

/*
  Apologies for mixing async & sync function, then pasting over them with sleep(5000) calls
  ~ garrett
*/


async function writeCSV (next) {
  const header = [
    'Action Area',
    'Goal',
    'Objective',
    'Status',
    'Target Academic Year',
    'Leads',
    'Project Members',
    'Acceptable Benchmark',
    'How often assessed',
    'What data will be collected',
    'Assessment Documents',
    'Note',
    'Note by',
    'Note on'
  ]
  // const rows = await buildCSVText(next)
  const outputFilename = `strategic_plan_data-${new Date().toISOString().slice(0, 10)}.csv`
  if (!fsSync.existsSync('./app/public/downloads')) {
    fsSync.mkdirSync('./app/public/downloads')
  }
  const outputPath = `./app/public/downloads/${outputFilename}`
  const writer = csvWriter({
    path: outputPath,
    header
  })
  const csvText = await buildCSVText()
  await sleep(5000)
  return writer.writeRecords(csvText)
    .then(() => outputPath) // writeCSV() returns the outputPath
    .catch(next)
}

async function buildCSVText (next) {
  return await actionAreasController.getActionAreas()
    .then(j => removeLineReturns(j))
    .then(i => formatCSVText(i))
    .catch(next)
}

function formatCSVText (actionAreas) {
  const rows = []
  for (const actionArea of Object.values(actionAreas)) {
    for (const goal of Object.values(actionArea.goals)) {
      for (const objective of Object.values(goal.objectives)) {
        for (const note of Object.values(objective.notes)) {
          const actionarea = `${actionArea.id}. ${actionArea.title}`
          const goalDescription = `${goal.id}. ${goal.description}` || ''
          const objectiveDescription = `${objective.id}. ${objective.description}` || ''
          const acceptableBenchmark = objective.acceptable_benchmark || ''
          const howOftenAssessed = objective.how_often_assessed || ''
          const whatDataWillBeCollected = objective.what_data_will_be_collected || ''
          const assessmentDocuments = objective.assessment_documents || ''
          const leads = objective.leads || ''
          const projectMembers = objective.project_members || ''
          const status = objective.status || ''
          const targetAcademicYear = objective.target_academic_year || ''
          const noteText = note.text || ''
          const noteUser = note.user || ''
          const noteDate = note.formattedDate || ''

          const newRow = [
            actionarea,
            goalDescription,
            objectiveDescription,
            status,
            targetAcademicYear,
            leads,
            projectMembers,
            acceptableBenchmark,
            howOftenAssessed,
            whatDataWillBeCollected,
            assessmentDocuments,
            noteText,
            noteUser,
            noteDate
          ]
          rows.push(newRow)
        }
      }
    }
  }
  return rows
}

async function writeReport (next) {
  const outputFilename = `strategic_plan_report-${new Date().toISOString().slice(0, 10)}.txt`
  if (!fsSync.existsSync('./app/public/downloads')) {
    fsSync.mkdirSync('./app/public/downloads')
  }
  const outputPath = `./app/public/downloads/${outputFilename}`
  const filetext = await buildReportText(next)
  await sleep(5000)
  return await fs.writeFile(outputPath, filetext)
    .then(() => outputPath)
    .catch(next)
}

async function buildReportText () {
  const actionAreas = await actionAreasController.getActionAreas()
  const removedLineReturns = await removeLineReturns(actionAreas)
  const yamlFormatted = jsYaml.dump(removedLineReturns, { styles: { sortKeys: true } })
  await sleep(5000)
  return yamlFormatted
}

async function removeLineReturns (actionAreas) {
  const newlineRegex = /(\r\n|\r|\n)/g
  for (const actionArea of Object.values(actionAreas)) {
    actionArea.description = doRegex(actionArea.description, newlineRegex)
    actionArea.title = doRegex(actionArea.title, newlineRegex)
    actionArea.abbr_title = doRegex(actionArea.abbr_title, newlineRegex)
    if (!actionArea.goals) { continue }
    for (const goal of Object.values(actionArea.goals)) {
      goal.description = doRegex(goal.description, newlineRegex)
      if (!goal.objectives) { continue }
      for (const objective of Object.values(goal.objectives)) {
        objective.description = doRegex(objective.description, newlineRegex)
        objective.what_data_will_be_collected = doRegex(objective.what_data_will_be_collected, newlineRegex)
        objective.how_often_assessed = doRegex(objective.how_often_assessed, newlineRegex)
        objective.acceptable_benchmark = doRegex(objective.acceptable_benchmark, newlineRegex)
        objective.assessment_documents = doRegex(objective.assessment_documents, newlineRegex)
        if (!objective.notes) { continue }
        for (const note of objective.notes) {
          note.text = doRegex(note.text, newlineRegex)
          note.user = doRegex(note.user, newlineRegex)
          note.formattedDate = doRegex(note.formattedDate, newlineRegex)
        }
      }
    }
  }
  return actionAreas
}

function doRegex (string, regex) {
  if (!string) {
    return ''
  }
  return string.replaceAll(regex, '  ')
}

function sleep (ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

module.exports = {
  writeCSV,
  writeReport
}
