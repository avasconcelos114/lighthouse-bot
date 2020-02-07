const express = require('express');

const utils = require('./utils');
const constants = require('./constants');
const store = require('./store');

const app = express();
app.use(express.json())

const port = utils.checkEnvVar(constants.PORT);

app.get('/connection', function(req, res) {
    const connection = store.checkConnection()
    res.send({connection})
})

/************************
 * Entry API endpoint
 ***********************/
app.get('/lighthouse', async function(req, res) {
    console.log(req, res);
})

app.listen(port, () => utils.logger().debug(`bot listening on port ${port}!`))
