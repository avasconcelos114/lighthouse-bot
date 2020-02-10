# Lighthouse Auditing Bot
![](documentation/img/lighthouse-logo.png)

## Summary
## Hackfest Proposal
This project has been created as a submission to the Mattermost Bot Hackfest.

You can [read the full Hackfest Proposal here](/documentation/README.md)

## Running on Docker (development environment)
0. Build Lighthouse bot image
```
docker build -t lighthouse-bot .
```

1. Run mongodb (as a separate container)
```
docker run -d -p 27017:27017 -e MONGO_INITDB_ROOT_USERNAME="root" -e MONGO_INITDB_ROOT_PASSWORD="test_passwd" --name lighthouse-mongo mongo:latest
```

2. [Create a Bot Account](https://docs.mattermost.com/developer/bot-accounts.html#user-interface-ui), or [issue a Personal Access Token](https://docs.mattermost.com/developer/personal-access-tokens.html#creating-a-personal-access-token) in a Mattermost server of your choice

3. Run Lighthouse bot container  
Ensure you have the following environment variables set when running the container:

| Variable name | Example value | Explanations / Notes |
| :--: | :--: | :-- |
| PORT | 3001 | The port being used by this chatbot |
| MATTERMOST_SERVER | http://192.168.1.10:8065 | The Mattermost instance you are using |
| TOKEN | sd67j1cxepnc7meo3pof3krzgr | A Personal Access Token or Bot Account Token |
| MONGO_USERNAME | root | Auth username for a mongodb server |
| MONGO_PASSWORD | test_passwd | Auth password for a mongodb server |
| MONGO_SERVER | 192.168.1.10:27017 | The endpoint for a mongodb server |
| CHATBOT_SERVER | http://192.168.1.10:3001 | IP to be used by this chatbot (needed to set URL endpoints in Message Attachments) |
| TZ | Asia/Seoul | A timezone that will be used for timestamps when logging |

Example `run` command:
```
docker run -d -p 3001:3001 -v $PWD/src:/home/app/src -e TZ="Asia/Seoul" -e PORT=3001 -e MATTERMOST_SERVER="http://192.168.1.129:8065" -e TOKEN="sd67j1cxepnc7meo3prf3krzgr" -e MONGO_USERNAME="root" -e MONGO_PASSWORD="test_passwd" -e MONGO_SERVER="192.168.1.129:27017" -e CHATBOT_SERVER="http://192.168.1.129:3001" --name lighthouse-bot lighthouse-bot
```

4. [Register a slash command](https://docs.mattermost.com/developer/slash-commands.html#custom-slash-command) in Mattermost that sends a `GET` request to the `/lighthouse` endpoint

## Dealing with authentication screens
Sometimes the page you need to test is behind an authentication screen. 

In times like that you will need to inject JS into the authentication script section as an IIFE.

Example script (works on Mattermost instances):
```
(() => {
  document.querySelector('#loginId').value = 'username';
  document.querySelector('#loginPassword').value = 'password';
  document.querySelector('#loginButton').click();
})();
```
