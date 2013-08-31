var cwbspec, cwbtw, town;
cwbspec = require('./cwb-spec.json');
cwbtw = require('./cwbtw');
town = '10015';
cwbtw.fetch_forecast_by_town(town, function(data){
  return cwbtw.parse_forecast_72hr(data, function(time, by_area){
    var key, zip, ref$, area, cwbid, cwbtownid, lresult$, i$, ref1$, len$, entry, forecast, forTime, f, results$ = [];
    console.log(time, (function(){
      var results$ = [];
      for (key in by_area) {
        results$.push(key);
      }
      return results$;
    }()).join(','));
    for (zip in ref$ = cwbspec) {
      area = ref$[zip], cwbid = area.cwbid, cwbtownid = area.cwbtownid;
      lresult$ = [];
      if (cwbtownid === town) {
        console.log(cwbid, cwbtownid, zip);
        for (i$ = 0, len$ = (ref1$ = by_area[cwbid]).length; i$ < len$; ++i$) {
          entry = ref1$[i$];
          forecast = import$({}, entry);
          forTime = forecast['ts'], delete forecast['ts'];
          f = {
            forecast: forecast,
            forTime: forTime,
            issued: time,
            forArea: zip
          };
          lresult$.push(console.log(f));
        }
      }
      results$.push(lresult$);
    }
    return results$;
  });
});
function import$(obj, src){
  var own = {}.hasOwnProperty;
  for (var key in src) if (own.call(src, key)) obj[key] = src[key];
  return obj;
}