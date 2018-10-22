FROM node:9.11.2

ENV PORT 3039

RUN apt-get update \
	&& apt-get install -y nodejs npm git git-core \
    && ln -s /usr/bin/nodejs /usr/bin/node

ARG ENV_CONF=production 
ENV ENV_CONF=${ENV_CONF}

# Adding sources
WORKDIR /home/roshambo
COPY . /home/roshambo

RUN cd /home/roshambo && npm install -g @angular/cli@1.7.1
RUN cd /home/roshambo && npm install
RUN cd /home/roshambo && ng build --configuration=${ENV_CONF}
RUN cd /home/roshambo && mkdir server/logs

CMD [ "node", "/home/roshambo/server/server.js" ]

EXPOSE 3039
EXPOSE 3001