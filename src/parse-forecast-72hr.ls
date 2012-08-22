cwbspec = require \./cwb-spec.json
cwbtw = require \./cwbtw

town = \10015
data <- cwbtw.fetch_forecast_by_town town
time, by_area <- cwbtw.parse_forecast_72hr data
console.log time, [key for key of by_area].join ','

for zip,{cwbid, cwbtownid}:area of cwbspec when cwbtownid is town
    console.log cwbid, cwbtownid, zip
    for entry in by_area[cwbid]
        forecast = {} <<< entry
        forTime = delete forecast[\ts]
        f = { forecast, forTime, issued: time, forArea: zip }
        console.log f
