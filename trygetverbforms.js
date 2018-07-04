var fs = require('fs');
var bsplit = require('buffer-split');


var words_txt = fs.readFileSync('germanwords_shortlong.csv').toString();
var wordsLines=words_txt.split("\n");
var words=[];

var parse = require('csv-parse');

var parser = parse({delimiter: ';'}, function(err, data){
  console.log(data);
});

fs.createReadStream(__dirname+'/germanwords_shortlong.csv').pipe(parser);