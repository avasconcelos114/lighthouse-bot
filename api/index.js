const axios = require('axios');
const constants = require('../constants');
const utils = require('../utils');

const MATTERMOST_URL = utils.common.checkEnvVar(constants.MATTERMOST_SERVER);
const TOKEN = utils.common.checkEnvVar(constants.TOKEN);

// Post message to mattermost
async function sendPostToChannel(payload) {
    const data = await doPost(`${MATTERMOST_URL}/api/v4/posts`, payload);
    return data;
}

async function openDialog(payload) {
    const data = await doPost(`${MATTERMOST_URL}/api/v4/actions/dialogs/open`, payload);
    return data;
}

// Get a user from user_id 
async function getUser(userId) {
    const data = await doGet(`${MATTERMOST_URL}/api/v4/users/${userId}`);
    return data;
}

async function doGet(url) {
    const options = {
        url,
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${TOKEN}`,
        },
    };

    return await axios(options)
        .then((response) => {
            return response.data;
        })
        .catch((error) => {
            utils.common.logger.error(error);
            return error;
        });
}

async function doPost(url, data) {
    const options = {
        url,
        data,
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${TOKEN}`,
        },
        json: true,
    };

    return await axios(options)
        .then((response) => {
            return response.data;
        })
        .catch((error) => {
            utils.common.logger.error(error);
            return error;
        });
}

module.exports = {
    openDialog,
    sendPostToChannel,
    getUser,
};
