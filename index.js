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
app.get('/mountainPass', getMountainPass);
app.get('/highwayAlert', getHighwayAlert);
app.get('/yelp', getYelp);
app.get('/trails', getTrails);
// app.get('/parks', getParks);

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

function MountainPass(mountain) {
  this.name = mountain.MountainPassName;
  this.roadCondition = mountain.RoadCondition;
  this.tempatureInFahrenheit = mountain.TemperatureInFahrenheit;
  this.weatherCondition = mountain.WeatherCondition;
}

function HighwayAlert(highway) {
  this.name = highway.EndRoadwayLocation.Description; // Road name
  this.status = highway.EventStatus; // open or closed
  this.description = highway.HeadlineDescription; // Alert description
}

function Yelp(business) {
  this.name = business.name;
  //this.rating = business.rating;
  this.price = business.price;
}

function Trails(trail) {
  this.tableName = 'trails';
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

function getMountainPass(request, response) {
  const url =  `http://wsdot.com/Traffic/api/MountainPassConditions/MountainPassConditionsREST.svc/GetMountainPassConditionsAsJson?AccessCode=${APIKEY}`;
  superagent.get(url)
    .then(result => {
      let mountainSumm = new MountainPass(result.body[0]);
      let mountainSummValues = Object.values(mountainSumm);
      response.send(mountainSummValues);
    })
    .catch(error => handleError(error, response));
}

function getHighwayAlert(request, response) {
  const url = `http://wsdot.wa.gov/Traffic/api/HighwayAlerts/HighwayAlertsREST.svc/GetAlertsAsJson?AccessCode=${APIKEY}`;
  superagent.get(url)
    .then(result => {
      let highwaySumm = new HighwayAlert(result.body[0]);
      let highwaySummValues = Object.values(highwaySumm);
      response.send(highwaySummValues);
    })
    .catch(error => handleError(error, response));
}

function getYelp(request, response) {
  const url = `https://api.yelp.com/v3/businesses/search?term=gas&latitude=47&longitude=-122`;
  superagent.get(url)
    .set('Authorization', `Bearer ${APIKEY}`)
    .then(result => {
      // console.log(result.body.businesses);
      let yelpSumm = new Yelp(result.body.businesses);
      response.send(yelpSumm);
    })
    .catch(error => handleError(error, response));
}

function getTrails(request, response) {
  const url = `https://www.hikingproject.com/data/get-trails?lat=47&lon=-122&key=https://www.hikingproject.com/data/get-trails?lat=47&lon=-122&key=200392055-11baa93a1e6ac1245d052da581b24a02`;
  superagent.get(url)
    .then(result => {
      let trailSumm = new Trails(result);
      response.send(trailSumm);
    })
    .catch(error => handleError(error, response));
}
