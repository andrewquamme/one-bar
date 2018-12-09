`use strict`;

const express = require('express');
const app = express();
const pg = require('pg');
const superagent = require('superagent');

// Application Middleware
app.use(express.urlencoded({extended:true}));
app.use(express.static('./public'));

// Set the view engine for server-side templating
app.set('view engine', 'ejs');

// Load environment variables from .env file
require('dotenv').config();

// Routes
app.get('/', function(req, response) {
  response.render('pages/index');
});

app.get('/about', function(req, response) {
  response.render('pages/about');
});

app.get('/geolocate', function(req, response) {
  response.render('pages/geolocate');
});

app.get('/sms', smsHandler);

// Database setup
const dbClient = new pg.Client(process.env.DATABASE_URL);
dbClient.connect();
dbClient.on('error', err => console.error(err));

const PORT = process.env.PORT;
const accountSid = process.env.TWILIO_SID;
const authToken = process.env.TWILIO_TOKEN;
const smsClient = require('twilio')(accountSid, authToken);

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));

function handleError(err, res) {
  console.error(err);
  if (res) res.status(500).send('Sorry, something went wrong');
}
// Location Model
function Location(query, res) {
  this.latitude = res.body.results[0].geometry.location.lat;
  this.longitude = res.body.results[0].geometry.location.lng;
  this.number = query.number;
}

Location.prototype = {
  save: function() {
    const SQL = `UPDATE user_info SET latitude=$1, longitude=$2 WHERE number=$3;`;
    const values = [this.latitude, this.longitude, this.number];
    dbClient.query(SQL, values);
    return;
  }
};

// Hospital Model
function Hospitals(business) {
  this.name = business.name;
  //this.rating = business.rating;
  this.address = business.location.display_address;
  this.phone = business.phone;
}

// Weather Model
function Weather(day) {
  this.forecast = day.summary;
  this.temperature = day.temperature;
  this.windSpeed = day.windSpeed;
  this.precipProbability = day.precipProbability;
}

// Trails Model
function Trails(trail) {
  this.name = trail.name;
  this.location = trail.location;
  this.length = trail.length;
  this.conditions = trail.conditionStatus;
  this.stars = trail.stars;
  this.summary = trail.summary;
}

function smsHandler(request, response) {
  const SQL = 'SELECT * FROM user_info WHERE number=$1;';
  const values = [request.query.From];

  dbClient.query(SQL, values).then(result => {
    if (result.rowCount > 0) {
      console.log('number found');
      processText(request, response, result.rows[0]);
    } else {
      console.log('number not found'); 
      
      // **********Below has not been tested*************
      
      // const infoRequest = request.query.Body.toLowerCase();
      // if (infoRequest.includes('name')) {
      //   let name = infoRequest.slice(5)
      //   const SQL = `INSERT user_info SET number=$1, name=$2;`;
      //   const values = [request.query.From, name];
      //   dbClient.query(SQL, values)
      // } else {
      //   const message = `Welcome to one-bar, please respond with NAME [YOUR NAME]`
      //   sendMessage(request, response, message);
      // }
    }
  });
}

// Process text, request APIs, send results via SMS
function processText(request, response, query) {
  const infoRequest = request.query.Body.toLowerCase();

  // Location city, state
  if (infoRequest.includes('location')) {
    let location = infoRequest.slice(9);
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${location}&key=${process.env.GOOGLE_API_KEY}`;
    superagent
      .get(url)
      .then(result => {
        const location = new Location(query, result);
        location.save();
        let message = `Hi ${query.name}\nYour location is currently ${location.latitude} latitude, ${location.longitude} longitude`;
        sendMessage(request, response, message);
      })
      .catch(error => handleError(error));
  }
  // Hospitals API - currently giving two hospitals (limit=2)
  if (infoRequest.includes('hospital')) {
    console.log('inside hospital')
    const url = `https://api.yelp.com/v3/businesses/search?categories=hospitals&limit=2&latitude=${query.latitude}&longitude=${query.longitude}`;
    superagent
      .get(url)
      .set('Authorization', `Bearer ${process.env.YELP_API_KEY}`)
      .then(result => {
        let hospitalSumm = result.body.businesses.map(function (hospitals) {
          return new Hospitals(hospitals);
        });
        let message = `Hi ${query.name}\nThe nearest hospital is ${hospitalSumm[0].name}\nLocated at: ${hospitalSumm[0].address}\nPhone ${hospitalSumm[0].phone}\nNext hospital is ${hospitalSumm[1].name}\nLocated at: ${hospitalSumm[1].address}\nPhone ${hospitalSumm[1].phone}`;
        sendMessage(request, response, message);
      })
      .catch(error => handleError(error, response));
  }

  // Weather todays forecast
  if (infoRequest.includes('weather')) {
    const url = `https://api.darksky.net/forecast/${process.env.WEATHER_API_KEY}/${query.latitude},${query.longitude}`;
    superagent.get(url).then(result => {
      const weatherSumm = new Weather(result.body.currently);
      let message = `Hi ${query.name}\nThe forecast for today is ${weatherSumm.forecast}\nHigh of ${weatherSumm.temperature}\nWind Speed of ${weatherSumm.windSpeed}\nAnd ${weatherSumm.precipProbability}% chance of precipitation`;
      sendMessage(request, response, message);
    });
  }

  // Trails, 4 with option of 10 with keyword 'MORE', each sent in seperate text
  if (infoRequest.includes('trails')) {
    let numRequested = 4;
    if (infoRequest.includes('more')) {
      numRequested = 10;
    }
    const url = `https://www.hikingproject.com/data/get-trails?lat=${query.latitude}&lon=${query.longitude}&maxDistance=10&maxResults=8&key=${process.env.TRAILS_API_KEY}`;
    superagent.get(url)
      .then(result => {
        const trailListings = result.body.trails.map(function (trail) {
          return new Trails(trail);
        });
        for (let i = 0; i < numRequested; i++) {
          let message =  `${trailListings[i].name} is ${trailListings[i].summary} with ${trailListings[i].stars} stars\nIt's ${trailListings[i].length} miles long\nCondition is ${trailListings[i].conditions}`
          sendMessage(request, response, message);
        }
      })
      .catch(error => handleError(error, response));
  }

  // Options
  if (infoRequest.includes('options')) {
    let message = `Hi ${query.name},\nAvailable Commands:\nLOCATION [City, State]\nWEATHER\nTRAILS\nMORE TRAILS\nLODGING\nGAS\nHOSPITALS`;
    sendMessage(request, response, message);
  }
}

// Create and send message via Twilio

// // function sendMessage(request, response, message) {
// //   console.log('inside sendMessage, message = ', message)
// //   smsClient.messages
// //     .create({
// //       body: message,
// //       from: process.env.TWILIO_NUMBER,
// //       to: request.query.From
// //     })
// //     .then(message => {
// //       console.log(message.sid);
// //       response.send('This message goes to website');
// //     })
// //     .done();
// // }

app.get('*', (request, response) => {
  response.send('Hitting the API');
});
