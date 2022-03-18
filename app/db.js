const { Pool } = require('pg')

const pool = new Pool({
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  port: process.env.POSTGRES_PORT,
  host: process.env.POSTGRES_HOST,
  max: 1,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 36000,
  application_name: 'strategic-plan-express'
})

module.exports = {
  query: (text, params, next) => {
    return pool.query(text, params, next)
  }
}
