// server.js
// load the things we need
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const async = require('async');
const axios = require('axios');
const fs = require('fs');
const moment = require('moment');
const cmd = require('node-cmd');
const JSZip = require("jszip");

const CONTENT_FOLDER = './public/content';
const METADATA_HOST = process.env.NODE_ENV && process.env.NODE_ENV == 'production' ? 'http://169.254.169.254' : 'http://localhost:9090/api';
const FILE_SIZE = parseInt(process.env.FILE_SIZE || 100 * 1000000);

console.log('>> NODE_ENV: ' + process.env.NODE_ENV);
console.log('>> METADATA_HOST: ' + METADATA_HOST);
console.log('>> FILE_SIZE: ' + FILE_SIZE);

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static('public'));
// set the view engine to ejs
app.set('view engine', 'ejs');

// use res.render to load up an ejs view file
function stats(fileName, callback) {
  fs.stat(fileName, function(err, stats) {
      callback(null, {
        file: fileName.replace(CONTENT_FOLDER + '/', ''),
        stats: stats
      });
  });
}

function formatDate(date, separator) {
  return date.getFullYear() + separator + 
        (date.getMonth() + 1) + separator + 
        date.getDate() + separator + 
        date.getHours() + separator + 
        date.getMinutes() + separator + 
        date.getSeconds() + separator + 
        date.getMilliseconds();
}

var ip, instance;

/* Find instance details */
async.map(['public-ipv4', 'instance-id'], function(metaData, callback) {
  axios.get(METADATA_HOST + '/latest/meta-data/' + metaData)
  .then(function(response) {
      callback(null, response.data)
  });
}, function(err, results) {
  console.log(results);
  ip = results[0];
  instance = results[1];
});


// index page 
app.get('/', function(req, res) {
  res.render('pages/index', {
    ip: ip,
    instance: instance
  });
});

var router = express.Router(); 
var processes = {};

/* Command line implementation */
router.get('/status', function(req, res) {
  cmd.get('vmstat 1 2 | awk \'{ for (i=1; i<=NF; i++) if ($i=="id") { getline; getline; print $i }}\'', function(err, data, stderr){
    console.log(`>> vmstat: ${parseInt(data)}`);
    res.json({ 
      cpu: 100 - parseInt(data),
      ip: ip,
      instance: instance,
      processes: processes
    });
  });
});

router.get('/hit', function(req, res) {
  let startDate = moment();
  console.log(`<< DD: ${startDate.format("h:mm:ss:SSS a")}`);
  processes[startDate.format("h:mm:ss:SSS a")] = true;
  cmd.get('dd if=/dev/zero bs=100M count=100 | gzip | gzip -d  > /dev/null &', function(err, data, stderr){
    let endDate = moment();
    console.log(`>> DD: ${endDate.diff(startDate, 'seconds')} s  [${startDate.format("h:mm:ss:SSS a")} - ${endDate.format("h:mm:ss:SSS a")}]`);
    delete processes[startDate.format("h:mm:ss:SSS a")];
  });
  res.json({ 
    ip: ip,
    instance: instance,
    processes: processes
   });
});

/* First Implementation */
router.get('/list', function(req, res) {
  // Read content folder 
  fs.readdir(CONTENT_FOLDER, function(err, items) {
    if(err) res.json({ items: []});
    // Read stats of each file
    async.map(items, function(filePath, callback) {
      stats(CONTENT_FOLDER + '/' + filePath, callback)
    }, function(err, result) {
      res.json(result);
    });
  
  });
});

router.get('/process', function(req, res) {
  let number = req.query.number || 1;
  let startDate = moment();
  let formatted_date = formatDate(new Date(), "_");
  let fileName = `${CONTENT_FOLDER}/${formatted_date}.zip`;
  let buffer = Buffer.allocUnsafe(FILE_SIZE);
  
  console.log(`>> File : ${formatted_date}.zip with ${number} of files`);
  console.log('>> File: ' + formatted_date + '.zip started at ' + startDate.format("h:mm:ss:SSS a"));
  
  var zip = new JSZip();
  // Add a top-level, arbitrary text file with contents
  while(number--)
    zip.file(`random${number}.txt`, buffer);
   
  // JSZip can generate Buffers so you can do the following
  zip.generateNodeStream({type:'nodebuffer',streamFiles:true})
     .pipe(fs.createWriteStream(fileName))
     .on('finish', function () {
         // JSZip generates a readable stream with a "end" event,
         // but is piped here in a writable stream which emits a "finish" event.
         let endDate = moment();
         console.log(`>> Stats: ${startDate.format("h:mm:ss:SSS a")} - ${endDate.format("h:mm:ss:SSS a")} = ${endDate.diff(startDate, 'seconds')} ms`);
         
         fs.unlink(fileName, (err) => {
          if (err) {
            console.error(err);
          } else {
            fs.writeFile(`${CONTENT_FOLDER}/${formatted_date}.txt`, "Hey there!", function(err) {
              res.json({ 
                name: formatted_date + '.zip', 
                time: endDate.diff(startDate, 'milliseconds'),
                msg: 'Success' 
              });      
            }); 
          }
         });
        
      });
});

router.get('/exist/:fileName', function() {
  let path = CONTENT_FOLDER + '/' + req.params.fileName;
  res.json({
    file: req.params.fileName,
    exist: fs.existsSync(path)
  });
});

app.use('/api', router);

app.listen(80);
console.log('80 is the magic port');