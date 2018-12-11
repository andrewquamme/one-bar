<!-- Name of the project  -->
# one-bar:  Code 301 final project

<!-- Names of the team members -->
Andrew Quamme, Adam Wittnam, Michael George, and Jared Pattison

##  Description:
One-Bar is a simple SMS based application that allows an outdoors-person to have access to vital information when internet in not available.


## Required libraries, frameworks, packages:
    "cors": "^2.8.5",
    "dotenv": "^6.2.0",
    "ejs": "^2.6.1",
    "express": "^4.16.4",
    "pg": "^7.7.1",
    "superagent": "^4.0.0",
    "twilio": "^3.25.0"

##API's:
###Weather data retrieved from:  https://darksky.net/forecast/
darksky api example data:
{
    "latitude": 47,
    "longitude": -122,
    "timezone": "America/Los_Angeles",
    "currently": {
        "time": 1544485274,
        "summary": "Mostly Cloudy",
        "icon": "partly-cloudy-day",
        "nearestStormDistance": 0,
        "precipIntensity": 0.002,
        "precipIntensityError": 0,
        "precipProbability": 0.05,
        "precipType": "rain",
        "temperature": 41.51,
        "apparentTemperature": 39.18,
        "dewPoint": 34.66,
        "humidity": 0.76,
        "pressure": 1024.93,
        "windSpeed": 3.88,
        "windGust": 10.17,
        "windBearing": 202,
        "cloudCover": 0.6,
        "uvIndex": 0,
        "visibility": 7.79,
        "ozone": 339.15
    },

###Geolocation data retrieved from: https://maps.googleapis.com/maps/api/geocode/
geocode api data example:
{
    "plus_code": {
        "compound_code": "P27Q+MC New York, NY, USA",
        "global_code": "87G8P27Q+MC"
    },
    "results": [
        {
            "address_components": [
                {
                    "long_name": "279",
                    "short_name": "279",
                    "types": [
                        "street_number"
                    ]
                },
                {
                    "long_name": "Bedford Avenue",
                    "short_name": "Bedford Ave",
                    "types": [
                        "route"
                    ]
                },
                {
                    "long_name": "Williamsburg",
                    "short_name": "Williamsburg",
                    "types": [
                        "neighborhood",
                        "political"
                    ]
                },
                {
                    "long_name": "Brooklyn",
                    "short_name": "Brooklyn",
                    "types": [
                        "political",
                        "sublocality",
                        "sublocality_level_1"
                    ]
                },
                {
                    "long_name": "Kings County",
                    "short_name": "Kings County",
                    "types": [
                        "administrative_area_level_2",
                        "political"
                    ]
                },
                {
                    "long_name": "New York",
                    "short_name": "NY",
                    "types": [
                        "administrative_area_level_1",
                        "political"
                    ]
                },
                {
                    "long_name": "United States",
                    "short_name": "US",
                    "types": [
                        "country",
                        "political"
                    ]
                },
                {
                    "long_name": "11211",
                    "short_name": "11211",
                    "types": [
                        "postal_code"
                    ]
                }
            ],
            "formatted_address": "279 Bedford Ave, Brooklyn, NY 11211, USA",
            "geometry": {
                "location": {
                    "lat": 40.7142484,
                    "lng": -73.9614103
                },
                "location_type": "ROOFTOP",
                "viewport": {
                    "northeast": {
                        "lat": 40.71559738029149,
                        "lng": -73.9600613197085
                    },
                    "southwest": {
                        "lat": 40.71289941970849,
                        "lng": -73.96275928029151
                    }
                }
            },
            "place_id": "ChIJT2x8Q2BZwokRpBu2jUzX3dE",
            "plus_code": {
                "compound_code": "P27Q+MC New York, United States",
                "global_code": "87G8P27Q+MC"
            },
            "types": [
                "bakery",
                "cafe",
                "establishment",
                "food",
                "point_of_interest",
                "store"
            ]
        },

###Trails data retrieved from:  https://www.hikingproject.com/data/get-trails
trails api data example:
"trails": [
        {
            "id": 7000130,
            "name": "Bear Peak",
            "type": "Featured Hike",
            "summary": "A must-do hike for Boulder locals and visitors alike!",
            "difficulty": "blueBlack",
            "stars": 4.5,
            "starVotes": 74,
            "location": "Boulder, Colorado",
            "url": "https://www.hikingproject.com/trail/7000130/bear-peak",
            "imgSqSmall": "https://cdn-files.apstatic.com/hike/7005382_sqsmall_1435421346.jpg",
            "imgSmall": "https://cdn-files.apstatic.com/hike/7005382_small_1435421346.jpg",
            "imgSmallMed": "https://cdn-files.apstatic.com/hike/7005382_smallMed_1435421346.jpg",
            "imgMedium": "https://cdn-files.apstatic.com/hike/7005382_medium_1435421346.jpg",
            "length": 5.7,
            "ascent": 2524,
            "descent": -2527,
            "high": 8370,
            "low": 6113,
            "longitude": -105.2755,
            "latitude": 39.9787,
            "conditionStatus": "Bad / Closed",
            "conditionDetails": "The Bear Canyon trail is closed through November 2018 but Fern Canyon is open.",
            "conditionDate": "2018-09-12 00:00:00"
        },
###Hospital data retrieved from:  https://api.yelp.com/v3/businesses/search?categories=hospitals
hospital api data example:
{
```"businesses": [
        {
            "id": "A8ILbeOhHlINo9HPtKcQ1Q",
            "alias": "cancer-institute-at-swedish-medical-center-seattle-2",
            "name": "Cancer Institute At Swedish Medical Center",
            "image_url": "https://s3-media1.fl.yelpcdn.com/bphoto/f2dEfOtYbyYTCpgKz5h0gg/o.jpg",
            "is_closed": false,
            "url": "https://www.yelp.com/biz/cancer-institute-at-swedish-medical-center-seattle-2?adjust_creative=QGCFuEATM34rC5eryaGjwg&utm_campaign=yelp_api_v3&utm_medium=api_v3_business_search&utm_source=QGCFuEATM34rC5eryaGjwg",
            "review_count": 9,
            "categories": [
                {
                    "alias": "physicians",
                    "title": "Doctors"
                },
                {
                    "alias": "hospitals",
                    "title": "Hospitals"
                }
            ],
            "rating": 4.5,
            "coordinates": {
                "latitude": 47.6098251,
                "longitude": -122.3236084
            },
            "transactions": [],
            "location": {
                "address1": "1221 Madison St",
                "address2": "",
                "address3": "",
                "city": "Seattle",
                "zip_code": "98104",
                "country": "US",
                "state": "WA",
                "display_address": [
                    "1221 Madison St",
                    "Seattle, WA 98104"
                ]
            },
            "phone": "+12063862323",
            "display_phone": "(206) 386-2323",
            "distance": 805.6010863118303
        }```

###Fuel/Service Station data retrieved from:  https://api.yelp.com/v3/businesses/search?categories=servicestations
service station api data example:
"businesses": [
        {
            "id": "wC3nHsCF1Pox306k1tBcRQ",
            "alias": "juanita-firs-76-kirkland",
            "name": "Juanita Firs 76",
            "image_url": "https://s3-media3.fl.yelpcdn.com/bphoto/6JDNKhfludFHjXFFpP9k0A/o.jpg",
            "is_closed": false,
            "url": "https://www.yelp.com/biz/juanita-firs-76-kirkland?adjust_creative=QGCFuEATM34rC5eryaGjwg&utm_campaign=yelp_api_v3&utm_medium=api_v3_business_search&utm_source=QGCFuEATM34rC5eryaGjwg",
            "review_count": 91,
            "categories": [
                {
                    "alias": "servicestations",
                    "title": "Gas Stations"
                },
                {
                    "alias": "autorepair",
                    "title": "Auto Repair"
                }
            ],
            "rating": 4.5,
            "coordinates": {
                "latitude": 47.7233320385188,
                "longitude": -122.208158969879
            },
            "transactions": [],
            "location": {
                "address1": "13701 100th Ave NE",
                "address2": "",
                "address3": "",
                "city": "Kirkland",
                "zip_code": "98034",
                "country": "US",
                "state": "WA",
                "display_address": [
                    "13701 100th Ave NE",
                    "Kirkland, WA 98034"
                ]
            },
            "phone": "+14258212345",
            "display_phone": "(425) 821-2345",
            "distance": 15991.061629596416
        }

###Lodging information data retrieved from:  https://api.yelp.com/v3/businesses/search?categories=hotels
lodging api data example:
"businesses": [
        {
            "id": "UMC8IVZB7o7Vsv8ownttmg",
            "alias": "loews-hotel-1000-seattle",
            "name": "Loews Hotel 1000",
            "image_url": "https://s3-media1.fl.yelpcdn.com/bphoto/IZ44P_5u9E5zPPEeP0f-BA/o.jpg",
            "is_closed": false,
            "url": "https://www.yelp.com/biz/loews-hotel-1000-seattle?adjust_creative=QGCFuEATM34rC5eryaGjwg&utm_campaign=yelp_api_v3&utm_medium=api_v3_business_search&utm_source=QGCFuEATM34rC5eryaGjwg",
            "review_count": 493,
            "categories": [
                {
                    "alias": "hotels",
                    "title": "Hotels"
                }
            ],
            "rating": 4.5,
            "coordinates": {
                "latitude": 47.605051,
                "longitude": -122.336105
            },
            "transactions": [],
            "price": "$$$",
            "location": {
                "address1": "1000 1st Ave",
                "address2": null,
                "address3": "",
                "city": "Seattle",
                "zip_code": "98104",
                "country": "US",
                "state": "WA",
                "display_address": [
                    "1000 1st Ave",
                    "Seattle, WA 98104"
                ]
            },
            "phone": "+12069571000",
            "display_phone": "(206) 957-1000",
            "distance": 328.73822076177123
        }
News information data retrieved from:  https://newsapi.org/v2/top-headlines?country 
news api example: 
{
            "source": {
                "id": null,
                "name": "Washingtonexaminer.com"
            },
            "author": "https://www.washingtonexaminer.com/author/philip-klein",
            "title": "Eating raw cookie dough is probably worth the risk - Washington Examiner",
            "description": "The Centers for Disease Control and Prevention is out with a warning that nobody who likes to eat delicious things wants to read: \"Say No to Raw Dough!\" But the truth is that eating raw cookie dough is probably worth the risk for most people.",
            "url": "https://www.washingtonexaminer.com/opinion/eating-raw-cookie-dough-is-probably-worth-the-risk",
            "urlToImage": "https://mediadc.brightspotcdn.com/dims4/default/c2b0a3e/2147483647/strip/true/crop/1060x557+0+22/resize/1200x630!/quality/90/?url=https%3A%2F%2Fmediadc.brightspotcdn.com%2F8b%2F20%2F8557612a483d9060c3f6f7c04251%2Fistock-864680082.jpg",
            "publishedAt": "2018-12-10T22:14:00Z",
            "content": "T he Centers for Disease Control and Prevention is out with a warning that nobody who likes to eat delicious things wants to read: \" Say No to Raw Dough !\" But the truth is that eating raw cookie dough is probably worth the risk for most people. In a special … [+2252 chars]"
        },


Database schema:
number VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255),
  latitude NUMERIC(8, 6),
  longitude NUMERIC(9, 6)
Weather date retrieved from: Darksky.net

