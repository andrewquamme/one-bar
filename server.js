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

app.get('/request', function(req, response) {
  response.render('pages/request');
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
  this.address = business.location.display_address;
  this.phone = business.phone;
}

// Gas Model
function GasStations(business) {
  this.name = business.name;
  this.address = business.location.display_address;
  this.phone = business.phone;
}

// Lodging Model
function Lodging(business) {
  this.name = business.name;
  this.rating = business.rating;
  this.address = business.location.display_address;
  this.phone = business.phone;
}

// Weather Model
function Weather(day) {
  this.forecast = day.summary;
  this.temperature = day.temperatureHigh;
  this.windSpeed = day.windSpeed;
  this.precipProbability = day.precipProbability*100;
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

// Headlines Model
function Headlines(headlines) {
  this.title = headlines.title;
  this.description = headlines.description;
  this.content = headlines.content;
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

      // If number is not in DB it will prompt user to respond with name [uers name], then add number and name to DB
      // Location is currently left blank but prompts user to enter one
      const infoRequest = request.query.Body.toLowerCase();
      if (infoRequest.includes('name')) {
        let name = infoRequest.slice(5);
        name = name.charAt(0).toUpperCase() + name.slice(1);
        const SQL = `INSERT INTO user_info (number, name) Values ($1, $2);`;
        const values = [request.query.From, name];
        dbClient.query(SQL, values);
        let message = `Thanks ${name}, please respond with\nLOCATION [City, State]`;
        sendMessage(request, response, message);
      } else {
        let message = `Welcome to One-Bar, please respond with\nNAME [YOUR NAME]`
        sendMessage(request, response, message);
      }
    }
  });
}

// Process text, request APIs, send results via SMS
function processText(request, response, query) {
  const infoRequest = request.query.Body.toLowerCase();

  if (infoRequest.includes('location')) {
    // Location city, state
    let location = infoRequest.slice(9);
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${location}&key=${process.env.GOOGLE_API_KEY}`;
    superagent
      .get(url)
      .then(result => {
        const location = new Location(query, result);
        location.save();
        let message = `Hi ${query.name}, your location is currently ${location.latitude} latitude, ${location.longitude} longitude`;
        sendMessage(request, response, message);
      })
      .catch(error => handleError(error));
  } else if (infoRequest.includes('hospital')) {
    // Hospitals API - currently giving two hospitals (limit=2)
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
  } else if (infoRequest.includes('gas')) {
    // Gas
    let message = '';
    const url = `https://api.yelp.com/v3/businesses/search?categories=servicestations&limit=3&latitude=${query.latitude}&longitude=${query.longitude}`;
    superagent.get(url)
      .set('Authorization', `Bearer ${process.env.YELP_API_KEY}`)
      .then(result => {
        let gasSumm = result.body.businesses.map(function (gas) {
          return new GasStations(gas);
        });
        for (let i = 0; i < 2; i++) {
          message += `${gasSumm[i].name} is at ${gasSumm[i].address[0]}, ${gasSumm[i].address[1].slice(0, gasSumm[i].address[1].indexOf(',') + 4)}\n`
        }
        sendMessage(request, response, message);
      })
      .catch(error => handleError(error, response));
  } else if (infoRequest.includes('lodging')) {
    // Lodging
    let message = '';
    const url = `https://api.yelp.com/v3/businesses/search?categories=hotels&limit=3&latitude=${query.latitude}&longitude=${query.longitude}`;
    superagent.get(url)
      .set('Authorization', `Bearer ${process.env.YELP_API_KEY}`)
      .then(result => {
        let hotelSumm = result.body.businesses.map(function (hotel) {
          return new Lodging(hotel);
        });
        for (let i = 0; i < 2; i++) {
          message += `${hotelSumm[i].name}, ${hotelSumm[i].rating} stars\n${hotelSumm[i].address[0]}, ${hotelSumm[i].address[1].slice(0, hotelSumm[i].address[1].indexOf(',') + 10)}\nPhone: (${hotelSumm[i].phone.slice(2, 5)}) ${hotelSumm[i].phone.slice(5, 8)}-${hotelSumm[i].phone.slice(8)}\n`
        }
        sendMessage(request, response, message);
      })
      .catch(error => handleError(error, response));
  } else if (infoRequest.includes('weather')) {
    // Weather todays forecast
    const url = `https://api.darksky.net/forecast/${process.env.WEATHER_API_KEY}/${query.latitude},${query.longitude}`;
    superagent.get(url).then(result => {
      const weatherSumm = new Weather(result.body.daily.data[0]);
      let message = `Hi ${query.name}\nToday's forecast: ${weatherSumm.forecast}\nHigh of ${weatherSumm.temperature}\xB0F\nWind speed ${weatherSumm.windSpeed} mph\nChance of precipitation ${weatherSumm.precipProbability}%`;
      sendMessage(request, response, message);
    })
      .catch(error => handleError(error, response));
  } else if (infoRequest.includes('trail')) {
    // Trails, 4 with option of 10 with keyword 'MORE', each sent in seperate text
    let message = '';
    const url = `https://www.hikingproject.com/data/get-trails?lat=${query.latitude}&lon=${query.longitude}&maxDistance=10&maxResults=8&key=${process.env.TRAILS_API_KEY}`;
    superagent.get(url)
      .then(result => {
        const trailListings = result.body.trails.map(function (trail) {
          return new Trails(trail);
        });
        for (let i = 0; i < 3; i++) {
          message += `${trailListings[i].name}\nIt's ${trailListings[i].length} miles long\nCondition is ${trailListings[i].conditions}\n`
        }
        sendMessage(request, response, message);
      })
      .catch(error => handleError(error, response));
  } else if (infoRequest.includes('headline')) {
    //Headlines, set to 4 headlines, one text per message, content truncated to 260 chars as is returned to us from api
    let message = '';
    const url = `https://newsapi.org/v2/top-headlines?country=us&pageSize=3&apiKey=${process.env.NEWS_API_KEY}`;
    superagent.get(url)
      .then(result => {
        const newsHeadlines = result.body.articles.map(function (newsObj) {
          return new Headlines(newsObj);
        })
        for (let i = 0; i < 3; i++) {
          message += `${newsHeadlines[i].title}\n`;
        }
        sendMessage(request, response, message);
      })
      .catch(error => handleError(error, response));
  } else {
    // User has not sent a valid command, send options
    let message = `Hi ${query.name},\nAvailable Commands:\nLOCATION [City, State]\nWEATHER\nTRAILS\nLODGING\nGAS\nHOSPITALS\nHEADLINES`;
    sendMessage(request, response, message);
  }
}

// Create and send message via Twilio

function sendMessage(request, response, message) {
  console.log(`Sent message =\n${message}`);
  smsClient.messages
    .create({
      body: `${message}\none-bar.info`,
      from: process.env.TWILIO_NUMBER,
      to: request.query.From
    })
    .then(message => {
      console.log(message.sid);
      response.send();
    })
    .done();
}

app.get('*', (request, response) => {
  response.send('Hitting the API');
});
