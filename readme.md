## Heavy Load Simulator

This sample node application simulates a heavy process executed by application. The propose is to increase server CPU utilization triggering auto scaling in a AWS environment. We achieve this goal by creating a 150Mb file and compressing it. 

### Endpoints
1. `/`:  Retrieve home page with: instance name, public ip and list of the compressed files created on instance, as well as a button to trigger file creation.
2. `/api/list`: This endpoint retrieves the list of files in content folder. 
2. `/api/process`: This endpoint triggers the creation of a 150Mb file and its compression, retrieves an acknowledgement.


### API Utility
We include a file `api.js` that simulates the AWS content metadata endpoint that is used to get the instance name and ip. In a local environment you must run this API locally for the simulator to work. 


#### Local
```bash
# Running api
node api.js
# Running server
node server.js
```

#### Production
```javascript
// Using NPM
NODE_ENV=production npm start
// Using PM2
NODE_ENV=production pm2 start server.js
```
