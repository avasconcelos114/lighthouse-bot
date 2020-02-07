FROM node:10.17.0-slim@sha256:17df3b18bc0f1d3ebccbd91e8ca8e2b06d67cb4dc6ca55e8c09c36c39fd4535d

RUN  apt-get update \
     # Install latest chrome dev package, which installs the necessary libs to
     # make the bundled version of Chromium that Puppeteer installs work.
     && apt-get install -y wget --no-install-recommends \
     && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
     && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
     && apt-get update \
     && apt-get install -y google-chrome-unstable --no-install-recommends \
     && rm -rf /var/lib/apt/lists/* \
     && wget --quiet https://raw.githubusercontent.com/vishnubob/wait-for-it/master/wait-for-it.sh -O /usr/sbin/wait-for-it.sh \
     && chmod +x /usr/sbin/wait-for-it.sh

COPY . /home/app
WORKDIR /home/app

# We will be manually installing chromium to prevent version mixups
RUN npm install puppeteer

RUN npm install -g pm2

# Prevent chromium from being re-installed
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true
RUN npm install
CMD [ "npm", "start" ]