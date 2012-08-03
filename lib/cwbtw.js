(function(){
  var request, xml2js, cheerio, fetch, fetch_forecast_by_town, parse_rain, get_frames, parse_area, parse_forecast_72hr, fetch_rain, slice$ = [].slice;
  request = require('request');
  xml2js = require('xml2js');
  cheerio = require('cheerio');
  fetch = curry$(function(args, cb){
    return request(args, function(error, response, body){
      if (error) {
        throw error;
      }
      if (response.statusCode !== 200) {
        throw 'got response ' + that;
      }
      return cb(body);
    });
  });
  fetch_forecast_by_town = curry$(function(id, cb){
    return fetch({
      url: "http://www.cwb.gov.tw/township/XML/" + id + "_72hr_EN.xml?_=" + new Date().getTime(),
      headers: {
        'Referer:': 'Referer:',
        'http://www.cwb.gov.tw/township/enhtml/index.htm': 'http://www.cwb.gov.tw/township/enhtml/index.htm'
      }
    }, cb);
  });
  parse_rain = curry$(function(data, cb){
    var res, $, ref$, time;
    res = [];
    $ = cheerio.load(data);
    ref$ = $('table.description td').last().html().split(/ : /), time = ref$[ref$.length - 1];
    $('table#tableData tbody tr').each(function(){
      var ref$, station, rain, station_name, station_id, town, area, _area;
      try {
        ref$ = $(this).find('td').get().map(function(it){
          return $(it).text();
        }), _area = ref$[0], station = ref$[1], rain = ref$[2];
      } catch (e$) {}
      ref$ = station.match(/(\S+)\s*\((\S+)\)/), station_name = ref$[1], station_id = ref$[2];
      ref$ = _area.match(/(...)(.*)/), town = ref$[1], area = ref$[2];
      return res.push([station_id, rain, town, area, station_name]);
    });
    return cb(time, res);
  });
  get_frames = curry$(function(Value, layout, timeslice){
    var i, frame, fl;
    i = 0;
    return (function(){
      var i$, ref$, len$, results$ = [];
      for (i$ = 0, len$ = (ref$ = Value).length; i$ < len$; ++i$) {
        frame = ref$[i$], fl = frame['@'].layout;
        if (fl === layout) {
          results$.push(import$({
            ts: timeslice[layout][i++]
          }, frame));
        }
      }
      return results$;
    }()).map(function(it){
      delete it['@'];
      if (it.WindDir != null) {
        it.WindDir = it.WindDir['@'].abbre;
      }
      return it;
    });
  });
  parse_area = curry$(function(Value, timeslice){
    var ref$, curr, frames12, i$, len$, frame, results$ = [];
    ref$ = get_frames(Value, '12', timeslice), curr = ref$[0], frames12 = slice$.call(ref$, 1);
    for (i$ = 0, len$ = (ref$ = get_frames(Value, '3', timeslice)).length; i$ < len$; ++i$) {
      frame = ref$[i$];
      if (frame.ts.getTime() === frames12[0].ts.getTime()) {
        curr = frames12.shift();
      }
      if (!frames12.length) {
        break;
      }
      results$.push(import$(import$({}, curr), frame));
    }
    return results$;
  });
  parse_forecast_72hr = curry$(function(data, cb){
    var parser, tmpslice;
    parser = new xml2js.Parser();
    tmpslice = {};
    return parser.parseString(data, function(err, arg$){
      var result, ref$, ref1$, slice12, slice3, timeslice, areaid, Value;
      result = arg$.ForecastData;
      ref$ = result.Metadata.Time, ref1$ = ref$[0], slice12 = ref1$['@'], tmpslice['12'] = ref1$.FcstTime, ref1$ = ref$[1], slice3 = ref1$['@'], tmpslice['3'] = ref1$.FcstTime;
      timeslice = (function(expand_time){
        var key, ref$, ts, results$ = {};
        expand_time = function(it){
          return new Date(typeof it === 'object' ? it['#'] : it);
        };
        for (key in ref$ = tmpslice) {
          ts = ref$[key];
          results$[key] = ts.map(expand_time);
        }
        return results$;
      }.call(this, void 8));
      return cb(new Date(result.IssueTime), (function(){
        var i$, ref$, len$, ref1$, results$ = {};
        for (i$ = 0, len$ = (ref$ = result.County.Area).length; i$ < len$; ++i$) {
          ref1$ = ref$[i$], areaid = ref1$['@'].AreaID, Value = ref1$.Value;
          results$[areaid] = parse_area(Value, timeslice);
        }
        return results$;
      }()));
    });
  });
  fetch_rain = fetch({
    url: 'http://www.cwb.gov.tw/V7/observe/rainfall/A136.htm'
  });
  module.exports = {
    fetch_forecast_by_town: fetch_forecast_by_town,
    fetch_rain: fetch_rain,
    parse_rain: parse_rain,
    parse_forecast_72hr: parse_forecast_72hr
  };
  function curry$(f, args){
    return f.length > 1 ? function(){
      var params = args ? args.concat() : [];
      return params.push.apply(params, arguments) < f.length && arguments.length ?
        curry$.call(this, f, params) : f.apply(this, params);
    } : f;
  }
  function import$(obj, src){
    var own = {}.hasOwnProperty;
    for (var key in src) if (own.call(src, key)) obj[key] = src[key];
    return obj;
  }
}).call(this);
