# Lighthouse Auditing Bot
![](documentation/img/lighthouse-logo.png)

## Summary
This project seeks to provide added value to the Mattermost ecosystem by adding performance auditing of websites with Google's [Lighthouse](https://developers.google.com/web/tools/lighthouse), offering a testing environment that is accessible directly from any Mattermost channel.

## Features

* __Ad-hoc Auditing__ - Quickly run an audit of a website with the `/lighthouse {url}` command, or simply type `/lighthouse` to launch a dialog with all available options
* __Job Scheduling__ - With the `/lighthouse jobs` command, you can schedule an auditing job to be run whenever necessary
* __Authentication Scripting__ - When auditing a website that requires an authenticated user, run your audit with an authentication script that will be injected into puppeteer at run-time (more information in [the auth section below](#dealing-with-authentication-screens))
* __Customizeable HTML Reports__ - Always be able to view the full detailed report from Lighthouse as an HTML file, which is provided by a template in this project, and customize parts of the template (in `src/static/reportTemplate.html`) to your heart's content!

## Development
### Pre-requisites
**0. [Create a Bot Account](https://docs.mattermost.com/developer/bot-accounts.html#user-interface-ui), or [issue a Personal Access Token](https://docs.mattermost.com/developer/personal-access-tokens.html#creating-a-personal-access-token) in a Mattermost server of your choice**

NOTE: Since this bot relies on sending ephemeral messages through Mattermost's API, the account you're using __MUST__ have `System Admin` permissions

**1. Used environment variables**  
Regardless of the method you are deploying, this application relies on a variety of environment variables to be able to function. Either use the `export` method, or inject your container with env variables depending on what method you are deploying this chatbot with.

| Variable name | Example value | Explanations / Notes |
| :--: | :--: | :-- |
| PORT | 3001 | The port being used by this chatbot |
| MATTERMOST_SERVER | http://192.168.1.10:8065 | The Mattermost instance you are using |
| TOKEN | sd67j1cxepnc7meo3pof3krzgr | A Personal Access Token or Bot Account Token |
| MONGO_USERNAME | root | Auth username for a mongodb server |
| MONGO_PASSWORD | test_passwd | Auth password for a mongodb server |
| MONGO_SERVER | 192.168.1.10:27017 | The endpoint for a mongodb server |
| CHATBOT_SERVER | http://192.168.1.10:3001 | IP to be used by this chatbot (needed to set URL endpoints in Message Attachments) |
| TZ (optional) | Asia/Seoul | The timezone value that will be used on server (important for job scheduling) |

### With Docker
**0. Build Lighthouse bot image**   
```
docker build -t lighthouse-bot .
```

**1. Run mongodb (as a separate container)**  
```
docker run -d -p 27017:27017 -e MONGO_INITDB_ROOT_USERNAME="root" -e MONGO_INITDB_ROOT_PASSWORD="test_passwd" --name lighthouse-mongo mongo:latest
```

**2. Run Lighthouse bot container**  
Note: Ensure you have the environment variables set when running the container  
  
Example `run` command:
```
docker run -d -p 3001:3001 -v $PWD/src:/home/app/src -e TZ="Asia/Seoul" -e PORT=3001 -e MATTERMOST_SERVER="http://192.168.1.129:8065" -e TOKEN="sd67j1cxepnc7meo3prf3krzgr" -e MONGO_USERNAME="root" -e MONGO_PASSWORD="test_passwd" -e MONGO_SERVER="192.168.1.129:27017" -e CHATBOT_SERVER="http://192.168.1.129:3001" --name lighthouse-bot lighthouse-bot
```

**3. [Register a slash command](https://docs.mattermost.com/developer/slash-commands.html#custom-slash-command) in Mattermost that sends a `GET` request to the `/lighthouse` endpoint**  

### Without Docker (using PM2)
**0. Follow the [installation guide for MongoDB](https://docs.mongodb.com/manual/installation/) to set up your MongoDB instance** 
  
**1. Set values for all required environment variables**  
```
export PORT=3001
export MATTERMOST_SERVER=http://192.168.1.10:8065
export TOKEN=sd67j1cxepnc7meo3pof3krzgr
export MONGO_USERNAME=root
export MONGO_PASSWORD=test_passwd
export MONGO_SERVER=192.168.1.10:27017
export CHATBOT_SERVER=http://192.168.1.10:3001
export TZ=Asia/Seoul
```

**2. Globally install [PM2](https://pm2.keymetrics.io)**  

```
npm install -g pm2
```

**3. Install dependencies**  
```
npm install
```

**4. Run chatbot with pm2**  
```
pm2 start ecosystem.config.js
```

## Deployment


## Tutorials  
While typing `/lighthouse help` provides you with a list of available commands for the Lighthouse chatbot, below are a few step-by-step tutorials that may help you with the most important aspects of using this chatbot.  

* [Performing ad-hoc tests](documentation/recipes/ad-hoc.md)
* [Scheduling audit jobs](documentation/recipes/scheduling.md)
* [Authentication Scripting](documentation/recipes/auth-scripting.md)

## Hackfest Proposal
This project has been created as a submission to the Mattermost Bot Hackfest.

You can [read the full Hackfest Proposal here](/documentation/README.md)

### Current Tasks
- [ ] Implementing trend charts for audit results to be accessed with `/lighthouse stats {url}`
- [x] Add usernames to schedule schemas so that they can be easily viewed through `/lighthouse schedule list`
- [x] Implementing `/lighthouse schedule info {id}` to get full details of a given job
- [ ] Add unit testing with Jest or AVA
- [x] Write documentation to make command usage clearer
- [x] Add more comprehensive logging
- [x] Investigate the possibility of using workers to run audits so that multiple audits can run simultaneously
- [ ] Investigate possibility of accounting for the timezone of user who registers a job (instead of always following server time)
