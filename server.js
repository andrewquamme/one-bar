`use strict`;

const express = require('express');
const app = express();
const pg = require('pg');
const superagent = require('superagent');

// Load environment variables from .env file
require('dotenv').config();

// Database setup
const dbClient = new pg.Client(process.env.DATABASE_URL);
dbClient.connect();
dbClient.on('error', err => console.error(err));

const PORT = process.env.PORT;
const accountSid = process.env.TWILIO_SID;
const authToken = process.env.TWILIO_TOKEN;
const smsClient = require('twilio')(accountSid, authToken);

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));

app.get('/sms', smsHandler);

function handleError(err, res) {
  console.error(err);
  if (res) res.status(500).send('Sorry, something went wrong');
}

app.get('/sms', smsHandler);

function smsHandler(request, response) {
  const SQL = 'SELECT * FROM user_info WHERE number=$1;';
  const values = [request.query.From];

  dbClient.query(SQL, values).then(result => {
    if (result.rowCount > 0) {
      console.log('number found')
      // console.log('result.rows[0]: ', result.rows[0])
      getPreferences(request, response, result.rows[0]);
    } else {
      console.log('number not found'); //code for number not found
    }
  });
}

function getPreferences(request, response, query) {
  // console.log('query: ', query);
  if (query.weather) {
    const url = `https://api.darksky.net/forecast/${process.env.WEATHER_API_KEY}/${query.latitude},${query.longitude}`;
    superagent.get(url)
      .then(result => {
        const weatherSumm = new Weather(result.body.currently);
        // const weatherSummValues = Object.values(weatherSumm);
        // console.log('weatherSummValues: ', weatherSummValues)
        console.log('weatherSumm ', weatherSumm)
        let message = `Hi ${query.name}\nThe forcaste for today is ${weatherSumm.forecast}\nHigh of ${weatherSumm.temperature}\nWind Speed of ${weatherSumm.windSpeed}\nAnd ${weatherSumm.precipProbability}% chance of precipitation`;
        sendMessage(request, response, message);
      })
  }
}

function sendMessage(request, response, message) {
  console.log('inside sendMessage, message = ', message)
  smsClient.messages
    .create({
      body: message,
      from: process.env.TWILIO_NUMBER,
      to: request.query.From
    })
    .then(message => {
      console.log(message.sid);
      response.send('This message goes to website');
    })
    .done();
}

app.get('*', (request, response) => {
  response.send('Hitting the API');
});

// Weather Model
function Weather(day) {
  this.forecast = day.summary;
  this.temperature = day.temperature;
  this.windSpeed = day.windSpeed;
  this.precipProbability = day.precipProbability;
}
