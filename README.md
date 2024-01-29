# WhatsApp chat bot library for nodejs
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/green-api/whatsapp-bot/blob/master/LICENSE)
[![GitHub release](https://img.shields.io/github/v/release/green-api/whatsapp-bot.svg)](https://github.com/green-api/whatsapp-bot/releases)
[![npm version](https://badge.fury.io/js/%40green-api%2Fwhatsapp-bot.svg)](https://www.npmjs.com/package/@green-api/whatsapp-bot)


## Introduction

The WhatsApp chat bot designed for writing own chat bots. Users can interact with bots by sending them command messages in private or group chats. The bot uses Green-API ([green-api.com](https://green-api.com)) provider WhatsApp API protocol under hood to support WhatsApp. Green API whatsApp protocol exists in two versions: 
* V0 - requires plugged and active phone. The protocol provides reach WhatsApp API including messages, media, phone state, location etc. Have look at  [whatsapp-api-client](https://github.com/green-api/whatsapp-api-client) wrapper REST protocol library for more information
- V1  - phone-free protocol that requires only phone number without physical device. The protocol implements only limited part of WhatsApp API. See details here [v1-whatsapp-api-client](https://github.com/green-api/v1-whatsapp-api-client) 

## Installation

```
npm i @green-api/whatsapp-bot
```

## Getting started  

### 1. Get green api account

To use the WhatsApp Bot API, you first have to visit [green-api.com](https://green-api.com) and get free developer account for API-V0. Green Api will give you id instance and api token, something like 
```
ID_INSTANCE: "0000",
API_TOKEN_INSTANCE: "000000000000000000AAAAAAAAAAAAAA"
```

In case you want API-V1 protocol you also have to visit [green-api.com](https://green-api.com) and choose Chat bot price option. Green API will give you a free trial period if you ask them. Access token looks like this:
```
token = 'gr.abcdefg...'
```

### 2. Add import

You can import library using modern ES6 syntax (you have to add ``"type":"module"`` to ``package.json``):
```
import WhatsAppBot from '@green-api/whatsapp-bot'
```
or using classic syntax:
```
const WhatsAppBot = require('@green-api/whatsapp-bot')
```
### 3. Initiliaze new WhatsApp Bot with aquired account data

For API-V0 protocol
```
const bot = new WhatsAppBot({
    idInstance: "0000",
    apiTokenInstance: "000000000000000000AAAAAAAAAAAAAA"
})
```
For API-V1 protocol
```
const bot = new WhatsAppBot(process.env.TOKEN_V1, {apiType: WhatsAppBot.GreenApiV1})
```

### 3. Start coding

A WhatsApp bot was inpired by telegram bot framework - [Telegraf](https://telegraf.js.org). But the WhatsApp bot library inherited limited part of Telegraf API. At this moment whatsapp bot can send and receive text, interact with user by telegraf scenes and use sessions. The bot supports only long-polling mode. To understand basics have look at examples below.

### Examples
Hello world example responds with a plain text phrase to any users print:

```js
const WhatsAppBot = require('@green-api/whatsapp-bot')

const bot = new WhatsAppBot({
    idInstance: process.env.ID_INSTANCE,
    apiTokenInstance: process.env.API_TOKEN_INSTANCE
})
bot.on('message', (ctx) => ctx.reply('Hello world!'))
bot.launch()
```
Bot listens for users command beginning with the / symbol
```js
const WhatsAppBot = require('@green-api/whatsapp-bot')

const bot = new WhatsAppBot({
    idInstance: process.env.ID_INSTANCE,
    apiTokenInstance: process.env.API_TOKEN_INSTANCE
})
bot.command('oldschool', (ctx) => ctx.reply('Hello'))
bot.command('modern', ({ reply }) => reply('Yo'))
bot.command('hipster', WhatsAppBot.reply('λ'))
bot.on('message', (ctx) => ctx.reply('Send /oldschool, /modern or /hipster to launch bot'))
bot.launch()
```

There's some cool V0-V1 api [examples too](docs/examples/). The bots are great for running in docker containers. Take a look at dockerized [simple-reg-bot example](https://github.com/green-api/simple-reg-bot)

## Documentation

### Receive webhooks via HTTP API

You can get incoming webhooks (messages, statuses) via HTTP API requests in the similar way as the rest of the Green API methods are implemented. Herewith, the chronological order of the webhooks following is guaranteed in the sequence in which they were received FIFO. All incoming webhooks are stored in the queue and are expected to be received within 24 hours.

To get incoming webhooks, you have to sequentially call two methods <a href="https://green-api.com/en/docs/api/receiving/technology-http-api/ReceiveNotification/">ReceiveNotification</a> and <a href="https://green-api.com/en/docs/api/receiving/technology-http-api/DeleteNotofication/">DeleteNotification</a>. ReceiveNotification method receives an incoming webhook. DeleteNotification method confirms successful webhook receipt and processing. To learn more about the methods, refer to respective ReceiveNotification and DeleteNotification sections.

* [API reference](docs/README.MD)

## License

Licensed on MIT terms. For additional info have look at [LICENSE](LICENSE)

## Third-party libraries

* [@green-api/whatsapp-api-client](https://github.com/green-api/whatsapp-api-client) -  WhatsApp API client wrapper for [green-api.com](https://green-api.com)
* [Telegraf](https://github.com/telegraf/telegraf) - Modern Telegram Bot Framework for Node.js. You shall accept the [License](https://github.com/telegraf/telegraf/blob/develop/LICENSE)
