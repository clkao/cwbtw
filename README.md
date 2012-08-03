# cwbtw
#### retrieve weather data from cwb.gov.tw 

Currently supports:

* detailed per area 3-hour forecasts for the next 72 hours
* rain meters from individual weather station

### Development

Install LiveScript:

    $ npm install -g LiveScript

Install dependencies:

    $ npm install

    $ sh build

Usage:

    $ node lib/parse-forecast-72hr

API:

    var cwbtw = require('cwbtw');
    cwbtw.fetch_rain(function(data) {
        cwbtw.parse_rain(data, function(time, res) {
            // res is array of [station_id, rain, town, area, station_name]
            // "rain" is cumulated rain in mm for the last 10min up to "time"
        }
    })
