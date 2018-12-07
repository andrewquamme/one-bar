\c one_bar;
DROP TABLE IF EXISTS user_info;
CREATE TABLE user_info (
  number VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255),
  latitude NUMERIC(8, 6),
  longitude NUMERIC(9, 6),
  weather BOOLEAN,
  mountainPass BOOLEAN,
  highwayAlert BOOLEAN,
  yelp BOOLEAN,
  trails BOOLEAN
);

INSERT INTO user_info (number, name, latitude, longitude, weather, mountainPass, highwayAlert, yelp, trails)
VALUES('+12068497029', 'el Jaredito', 47.608013, -122.335167, true, true, false, true, false);
INSERT INTO user_info (number, name, latitude, longitude, weather, mountainPass, highwayAlert, yelp, trails)
VALUES('+12533101489', 'Andrew', 47.608013, -122.335167, true, true, true, true, true);
