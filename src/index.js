const express = require('express');
const path = require('path');
const utils = require('./utils');
const constants = require('./constants');
const routes = require('./routes');

const PORT = utils.common.checkEnvVar(constants.PORT);

const publicDirPath = path.join(__dirname, "./static");

const app = express();
app.use(express.json());
app.use(express.static(publicDirPath));
app.use('/', routes);

app.listen(PORT, () => utils.common.logger.debug(`bot listening on port ${PORT}!`));
