// server.js
// load the things we need
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const async = require('async');
const axios = require('axios');
const fs = require('fs');
const JSZip = require("jszip");

const CONTENT_FOLDER = './public/content';
// const METADATA_HOST = 'http://169.254.169.254';
const METADATA_HOST = 'http://localhost:8080/api';

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static('public'));
// set the view engine to ejs
app.set('view engine', 'ejs');

var router = express.Router(); 

router.get('/latest/meta-data/:metadata', function(req, res) {
  res.send(req.params.metadata);
});

app.use('/api', router);

app.listen(9090);
console.log('9090 is the magic port');