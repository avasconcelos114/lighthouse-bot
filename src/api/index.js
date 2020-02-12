const axios = require('axios');
const constants = require('../constants');
const utils = require('../utils');

const MATTERMOST_URL = utils.common.checkEnvVar(constants.MATTERMOST_SERVER);
const TOKEN = utils.common.checkEnvVar(constants.TOKEN);

async function sendPostToChannel(payload) {
    const data = await doPost(`${MATTERMOST_URL}/api/v4/posts`, payload);
    return data;
}

async function sendEphemeralPostToUser(user_id, channel_id, message) {
    const payload = {
        user_id,
        post: {
            channel_id,
            message,
        }
    };

    const data = await doPost(`${MATTERMOST_URL}/api/v4/posts/ephemeral`, payload);
    return data;
}

async function getTeam(team_id) {
    const data = await doGet(`${MATTERMOST_URL}/api/v4/teams/${team_id}`);
    return data;
}

async function getChannel(channel_id) {
    const data = await doGet(`${MATTERMOST_URL}/api/v4/channels/${channel_id}`);
    return data;
}

async function openDialog(payload) {
    const data = await doPost(`${MATTERMOST_URL}/api/v4/actions/dialogs/open`, payload);
    return data;
}

async function getUser(user_id) {
    const data = await doGet(`${MATTERMOST_URL}/api/v4/users/${user_id}`);
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
    sendPostToChannel,
    sendEphemeralPostToUser,
    getTeam,
    getChannel,
    openDialog,
    getUser,
};
