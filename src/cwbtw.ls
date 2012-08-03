fetch(args, cb) =
    error, {statusCode}, body <- (require \request) args
    throw error if error
    throw 'got response '+statusCode unless statusCode === 200
    cb body

### rain meters

fetch_rain = fetch url: \http://www.cwb.gov.tw/V7/observe/rainfall/A136.htm

parse_rain(data, cb) =
    res = []
    $ = require \cheerio .load(data)
    [...,time] = $('table.description td').last!html!split(/ : /)

    $('table#tableData tbody tr').each ->
        try [_area, station, rain] = $ @ .find \td .get!map -> $ it .text!
        [,station_name,station_id] = station.match /(\S+)\s*\((\S+)\)/
        [,town,area] = _area.match /(...)(.*)/
        res.push [station_id, rain, town, area, station_name]

    cb time, res

### 72hr forecast

fetch_forecast_by_town(id, cb) =
    fetch {
        url: "http://www.cwb.gov.tw/township/XML/#{id}_72hr_EN.xml?_=#{ new Date!getTime! }"
        headers: {\Referer: \http://www.cwb.gov.tw/township/enhtml/index.htm}
    }, cb

get_frames(Value, layout, timeslice) =
    i = 0
    [{ts: timeslice[layout][i++]} <<< frame \
        for { '@':{layout:fl} }:frame in Value when fl is layout]
    .map ->
        delete it[\@]
        it.WindDir?.=[\@].abbre
        it

parse_area(Value, timeslice) =
    [curr, ...frames12] = get_frames Value, \12, timeslice
    for frame in get_frames Value, \3, timeslice
        if frame.ts.getTime() == frames12[0].ts.getTime()
            curr := frames12.shift! 
        break unless frames12.length
        {} <<< curr <<< frame

parse_forecast_72hr(data, cb) =
    parser = new (require \xml2js).Parser
    tmpslice = {}

    (err, {ForecastData:result}) <- parser.parseString data
    [ { '@':slice12, FcstTime:tmpslice[\12] }, { '@':slice3, FcstTime:tmpslice[\3] } ] = result.Metadata.Time

    timeslice = {[key, ts.map expand_time] for key, ts of tmpslice}
        where expand_time = -> new Date(if typeof it is \object => it[\#] else it)

    cb new Date(result.IssueTime),
    {[areaid, parse_area Value, timeslice] for {'@':{AreaID:areaid}, Value} in result.County.Area}

module.exports = {
    fetch_rain,
    parse_rain,
    fetch_forecast_by_town,
    parse_forecast_72hr,
}
