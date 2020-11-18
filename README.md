# WhatsApp chat bot library for nodejs
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/green-api/whatsapp-bot/blob/master/LICENSE)
[![GitHub release](https://img.shields.io/github/v/release/green-api/whatsapp-bot.svg)](https://github.com/green-api/whatsapp-bot/releases)
[![npm version](https://badge.fury.io/js/%40green-api%2Fwhatsapp-bot.svg)](https://www.npmjs.com/package/@green-api/whatsapp-bot)

## Introduction

The WhatsApp chat bot designed for writing own chat bots. Users can interact with bots by sending them command messages in private or group chats.

## Installation

```
npm i @green-api/whatsapp-bot
```

## Getting started  

### 1. Get green api account

To use the WhatsApp Bot API, you first have to visit [green-api.com](https://green-api.com) and get free developer account. Green Api will give you id instance and api token, something like 
```
ID_INSTANCE: "0000",
API_TOKEN_INSTANCE: "000000000000000000AAAAAAAAAAAAAA"
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
```
const bot = new WhatsAppBot({
    idInstance: "0000",
    apiTokenInstance: "000000000000000000AAAAAAAAAAAAAA"
})
```

### 3. Start coding

A WhatsApp bot was inpired by telegram bot framework - [Telegraf](https://telegraf.js.org). But the WhatsApp bot library inherited limited part of Telegraf API. At this moment whatsapp bot can send and receive text, interact with user by telegraf scenes and use sessions. The bot supports only long-polling mode. To understand basics have look at examples below.

### Examples
Hello world example responds with a plain text phrase to any user's print:

```js
const WhatsAppBot = require('@green-api/whatsapp-bot')

const bot = new WhatsAppBot({
    idInstance: process.env.ID_INSTANCE,
    apiTokenInstance: process.env.API_TOKEN_INSTANCE
})
bot.on('message', (ctx) => ctx.reply('Hello world!'))
bot.launch()
```
Bot listen to user's command beginning with the / symbol
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

There's some cool [examples too](docs/examples/).

## Documentation

* [API reference](docs/README.MD)

## License

Licensed on MIT terms. For additional info have look at [LICENSE](LICENSE)

## Third-party libraries

* [@green-api/whatsapp-api-client](https://github.com/green-api/whatsapp-api-client) -  WhatsApp API client wrapper for [green-api.com](https://green-api.com)
* [Telegraf](https://github.com/telegraf/telegraf) - Modern Telegram Bot Framework for Node.js. You shall accept the [License](https://github.com/telegraf/telegraf/blob/develop/LICENSE)