require! <[firebase optimist]>

{FIREBASE, FIREBASE_SECRET, AUTHZ_URL} = process.env

root = new firebase FIREBASE

{wait} = optimist.argv

cwbtw = require \./lib/cwbtw

current = root.child "rainfall/current"

parse-rain = ->
  data <- cwbtw.fetch_rain!
  time, res <- cwbtw.parse_rain data
  console.warn time

  [_, y, m, d, t] = time.match // (\d+)/(\d+)/(\d+) \s* (\S+) //

  ymd = [y,m,d].join \-

  data = {[name, rain{today,'10m'}] for [id, name, rain] in res}

  current.set { date: ymd, time: t, data}
  entry = root.child "rainfall/#ymd/#t"
  entry.set data

  setTimeout parse-rain, 10min * 60sec * 1000ms

setTimeout parse-rain, (wait ? 0s) * 1000ms
