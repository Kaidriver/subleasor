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
  
  let polygon = decodeURIComponent(event['pathParameters']['polygon'])
  console.log("POLYGON: " + polygon)
  let query_results = await client.query(`SELECT ST_AsGeoJSON(coordinates) as geojson, * FROM ${process.env.DB_TABLE} WHERE ST_Contains(ST_GEOMFROMTEXT($1, 4326), properties_dev.coordinates)`, [polygon])

  return {
    statusCode: 200,
    body: JSON.stringify(query_results.rows),
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    }
  };
};
