// server.js
// load the things we need
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const async = require('async');
const axios = require('axios');
const fs = require('fs');
const moment = require('moment');
const JSZip = require("jszip");

const CONTENT_FOLDER = './public/content';
const METADATA_HOST = process.env.NODE_ENV && process.env.NODE_ENV == 'production' ? 'http://169.254.169.254' : 'http://localhost:9090/api';
const FILE_SIZE = parseInt(process.env.FILE_SIZE || 100 * 1000000);

console.log('>> NODE_ENV: ' + process.env.NODE_ENV);
console.log('>> METADATA_HOST: ' + METADATA_HOST);
console.log('>> FILE_SIZE: ' + process.env.FILE_SIZE + ' ' + typeof process.env.FILE_SIZE);

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
        date.getSeconds();
}

// index page 
app.get('/', function(req, res) {
    async.map(['public-ipv4', 'instance-id'], function(metaData, callback) {
      axios.get(METADATA_HOST + '/latest/meta-data/' + metaData)
      .then(function(response) {
          callback(null, response.data)
      });
    }, function(err, results) {
      console.log(results)
      res.render('pages/index', {
        ip: results[0],
        instance: results[1]
      });
    });
});

var router = express.Router(); 

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
  let buffer = Buffer.allocUnsafe(FILE_SIZE);
  
  console.log(`>> File : ${formatted_date}.zip with ${number} of files`);
  console.log('>> File: ' + formatted_date + '.zip started at ' + startDate.format("h:mm:ss:SSS a"));
  
  var zip = new JSZip();
  // Add a top-level, arbitrary text file with contents
  while(number--)
    zip.file(`random${number}.txt`, buffer);
   
  // JSZip can generate Buffers so you can do the following
  zip.generateNodeStream({type:'nodebuffer',streamFiles:true})
     .pipe(fs.createWriteStream(`${CONTENT_FOLDER}/${formatted_date}.zip`))
     .on('finish', function () {
         // JSZip generates a readable stream with a "end" event,
         // but is piped here in a writable stream which emits a "finish" event.
         let endDate = moment();
         console.log(`>> Stats: ${startDate.format("h:mm:ss:SSS a")} - ${endDate.format("h:mm:ss:SSS a")} = ${endDate.diff(startDate, 'seconds')} ms`);
         
         fs.unlink(`${CONTENT_FOLDER}/${formatted_date}.zip`, (err) => {
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

app.listen(90);
console.log('80 is the magic port');