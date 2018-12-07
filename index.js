'use strict';

//Application Dependencies
const express = require('express');
const superagent = require('superagent');
const cors = require('cors');
// const pg = require('pg');
// const twilio = require('twilio');

// Load Environment Variables from .env File
require('dotenv').config();

// Application Set-up
const app = express();
const PORT = process.env.PORT;
app.use(cors());

// Set View Engine
app.set('view engine', 'ejs');

// API Routes
app.get('/location', (request, response) => {
  searchToLatLong(request.query.data)
    .then(location => response.send(location))
    .catch(error => handleError(error, response));
})
app.get('/weather', getWeather);
app.get('/hospitals', getHospitals);
app.get('/gas', getGas);
app.get('/lodging', getLodging);
app.get('/trails', getTrails);

//make sure the server is listening for requests
app.listen(PORT, () => console.log(`Listening on ${PORT}`));

function handleError(err, res) {
  console.error(err);
  if (res) res.status(500).send('Sorry, something went wrong');
}

//*********************MODELS********************************
function Location(query, res) {
  this.latitude = res.body.results[0].geometry.location.lat;
  this.longitude = res.body.results[0].geometry.location.lng;
}

function Weather(day) {
  this.forecast = day.summary;
  this.temperature = day.temperature;
  this.windSpeed = day.windSpeed;
  this.precipProbability = day.precipProbability;
}

function Hospitals(business) {
  this.name = business.name;
  //this.rating = business.rating;
  this.address = business.location.display_address;
  this.phone = business.phone;
}

function GasStations(business) {
  this.name = business.name;
  //this.rating = business.rating;
  this.address = business.location.display_address;
  this.phone = business.phone;
}

function Lodging(business) {
  this.name = business.name;
  //this.rating = business.rating;
  this.address = business.location.display_address;
  this.phone = business.phone;
}

function Trails(trail) {
  // this.tableName = 'trails';
  //this.trail_url = trail.url;
  this.name = trail.name;
  this.location = trail.location;
  this.length = trail.length;
  //this.condition_date = trail.conditionDate.split(' ')[0];
  //this.condition_time = trail.conditionDate.split(' ')[1];
  this.conditions = trail.conditionStatus;
  //this.stars = trail.stars;
  //this.stars_votes = trail.starVotes;
  //this.summary = trail.summary;
  //this.created_at = Date.now();
}

//***********************HELPER FUNCTIONS****************************** */

function searchToLatLong(query) {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=seattle&key=${APIKEY}`;
  return superagent.get(url)
    .then(res => {
      return new Location(query, res);
    })
    .catch(error => handleError(error));
}

function getWeather(request, response) {
  const url = `https://api.darksky.net/forecast/${APIKEY}/47,-122`;
  superagent.get(url)
    .then(result => {
      let weatherSumm = new Weather(result.body.currently);
      let weatherSummValues = Object.values(weatherSumm);
      response.send(weatherSummValues);
    })
    .catch(error => handleError(error, response));
}

function getHospitals(request, response) {
  const url = `https://api.yelp.com/v3/businesses/search?categories=hospitals&limit=1&latitude=47&longitude=-122`;
  superagent.get(url)
    .set('Authorization', `Bearer CTyh5NRXQW09RbowjyKn6PEEXfrJHAWOrS08uGIJ2u11ss_Q6QiV4aRnh5kRgePjCqO9aHWOSg-teM6BYCVkNZ44QvV01IEKqFPKEHExqvyn5WXQNRdAWSDhLpr1W3Yx`)
    .then(result => {
      let hospitalSumm = result.body.businesses.map(function (hospitals) {
        return new Hospitals(hospitals);
      });
      response.send(hospitalSumm);
    })
    .catch(error => handleError(error, response));
}

function getGas(request, response) {
  const url = `https://api.yelp.com/v3/businesses/search?categories=servicestations&limit=3&latitude=47&longitude=-122`;
  superagent.get(url)
    .set('Authorization', `Bearer CTyh5NRXQW09RbowjyKn6PEEXfrJHAWOrS08uGIJ2u11ss_Q6QiV4aRnh5kRgePjCqO9aHWOSg-teM6BYCVkNZ44QvV01IEKqFPKEHExqvyn5WXQNRdAWSDhLpr1W3Yx`)
    .then(result => {
      let gasSumm = result.body.businesses.map(function (gas) {
        return new GasStations(gas);
      });
      response.send(gasSumm);
    })
    .catch(error => handleError(error, response));
}

function getLodging(request, response) {
  const url = `https://api.yelp.com/v3/businesses/search?categories=hotels&limit=3&latitude=47&longitude=-122`;
  superagent.get(url)
    .set('Authorization', `Bearer CTyh5NRXQW09RbowjyKn6PEEXfrJHAWOrS08uGIJ2u11ss_Q6QiV4aRnh5kRgePjCqO9aHWOSg-teM6BYCVkNZ44QvV01IEKqFPKEHExqvyn5WXQNRdAWSDhLpr1W3Yx`)
    .then(result => {
      let hotelSumm = result.body.businesses.map(function (hotel) {
        return new Lodging(hotel);
      });
      response.send(hotelSumm);
    })
    .catch(error => handleError(error, response));
}

function getTrails(request, response) {
  const url = `https://www.hikingproject.com/data/get-trails?lat=47&lon=-122&key=https://www.hikingproject.com/data/get-trails?lat=47&lon=-122&key=200392055-11baa93a1e6ac1245d052da581b24a02&maxDistance=10`;
  superagent.get(url)
    .then(result => {
      const trailListings = result.body.trails.map(function (trail) {
        return new Trails(trail);
      })
      response.send(trailListings);
    })
    .catch(error => handleError(error, response));
}
