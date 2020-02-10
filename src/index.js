const express = require('express');

const utils = require('./utils');
const constants = require('./constants');
const routes = require('./routes');

const PORT = utils.common.checkEnvVar(constants.PORT);

const app = express();
app.use(express.json());
app.use('/', routes);

app.listen(PORT, () => utils.common.logger.debug(`bot listening on port ${PORT}!`));
