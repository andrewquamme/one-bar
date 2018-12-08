\c one_bar;
DROP TABLE IF EXISTS user_info;
CREATE TABLE user_info (
  number VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255),
  latitude NUMERIC(8, 6),
  longitude NUMERIC(9, 6)
);

INSERT INTO user_info (number, name, latitude, longitude)
VALUES('+12068497029', 'el Jaredito', 47.608013, -122.335167);
INSERT INTO user_info (number, name, latitude, longitude)
VALUES('+12533101489', 'Andrew', 47.608013, -122.335167);
INSERT INTO user_info (number, name, latitude, longitude)
VALUES('+12103631168', 'Adam', 47, -122);
INSERT INTO user_info (number, name, latitude, longitude)
VALUES('+12533803465', 'Michael', 47, -122);