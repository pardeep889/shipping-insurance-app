var fs = require('fs');
var readline = require('readline');
var stream = require('stream');

var instream = fs.createReadStream('./inject.txt');
var outstream = new stream;
var rl = readline.createInterface(instream, outstream);

var textData='';
rl.on('line', function(line) {            
  textData+= line;
});
rl.on('close', function() {
  console.log(textData);
  const query = {
    key: 'sections/qualtry.liquid',
    theme_id: id,
    value: textData
  };
});