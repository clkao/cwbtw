cwbtw = require \./cwbtw
argv = require \optimist .argv

doit = ->
    time, res <- cwbtw.parse_rain it
    console.log time
    console.log res

if file = argv?file
    data = fs.readFileSync file, \utf8
    data -= /^\uFEFF/ #BOM
    doit data
else
    data <- cwbtw.fetch_rain!
    doit data
