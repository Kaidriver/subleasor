const { Client } = require('pg')

const client = new Client({
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: 5432,
  database: process.env.DB_NAME,
  ssl: true
})

client.connect()
module.exports.handler = async (event) => {
  
  let query_parameters = [event.userName, event.request.userAttributes.given_name, event.request.userAttributes.family_name, event.request.userAttributes.email]
  try {
    let query_results = await client.query(`INSERT INTO ${process.env.USER_TABLE} (username, given_name, family_name, email) VALUES ($1, $2, $3, $4)`, query_parameters)
  }
  catch(err) {
    console.log(err)
  }
  
  return event
};