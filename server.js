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

app.get('/sms', smsHandler);

function smsHandler(request, response) {
  const SQL = 'SELECT name FROM user_info WHERE number=$1;';
  const values = [request.query.From];

  dbClient.query(SQL, values).then(result => {
    console.log('result.rows[0]: ', result.rows[0]);
    console.log('result.rows[0].name:', result.rows[0].name);
    if (result.rowCount > 0) {
      console.log('number found');
      smsClient.messages
        .create({
          body: `Hi ${result.rows[0].name}, your message was: ${request.query.Body}`,
          from: process.env.TWILIO_NUMBER,
          to: request.query.From
        })
        .then(message => {
          console.log(message.sid);
          response.send('This message goes to website');
        })
        .done();
    } else {
      console.log('number not found'); //code for number not found
    }
  });
}

app.get('*', (request, response) => {
  response.send('Hitting the API');
});

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
