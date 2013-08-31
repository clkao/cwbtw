var cwbtw, argv, doit, file, data, replace$ = ''.replace;
cwbtw = require('./cwbtw');
argv = require('optimist').argv;
doit = function(it){
  return cwbtw.parse_rain(it, function(time, res){
    console.log(time);
    return console.log(res);
  });
};
if (file = argv != null ? argv.file : void 8) {
  data = fs.readFileSync(file, 'utf8');
  data = replace$.call(data, /^\uFEFF/, '');
  doit(data);
} else {
  cwbtw.fetch_rain(function(data){
    return doit(data);
  });
}