# Setup 

## Talk to bot father on telegram to create / get bot token

https://web.telegram.org/k/#@BotFather


## ( Local ) Setup tunnel ( expose local to "internet" ) - webhook

```` bash 
# Tunnel to expose local
npx ngrok http 3000 # => Use this URL to populate .env SERVER_URL

# Edit .env 

# BOT_TOKEN = <your_token_generated>

```` 

**In production obviously use your https URL**


## Start

```` bash

npm run start

````