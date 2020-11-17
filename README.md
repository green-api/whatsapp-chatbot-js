# LIBRARY UNDER ACTIVE DEVELOPMENT. USE FOR OWN RISK!!!

# WhatsApp chat bot library for javascript
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/green-api/whatsapp-bot/blob/master/LICENSE)
[![GitHub release](https://img.shields.io/github/v/release/green-api/whatsapp-bot.svg)](https://github.com/green-api/whatsapp-bot/releases)
[![npm version](https://badge.fury.io/js/%40green-api%2Fwhatsapp-bot.svg)](https://www.npmjs.com/package/@green-api/whatsapp-bot)

## Introduction

This library is designed for writing own chat bots. Users can interact with bots by sending them command messages in private or group chats. 

### Installation

```
$ npm i @green-api/whatsapp-bot
```
or using `yarn`:
```
$ yarn add whatsappbot
```

### Documentation

When it's done

### Examples
  
```js
const { WhatsAppBot } = require('whatsappbot')

const bot = new WhatsAppBot(process.env.BOT_TOKEN)
bot.start((ctx) => ctx.reply('Welcome!'))
bot.help((ctx) => ctx.reply('Send me a sticker'))
bot.on('sticker', (ctx) => ctx.reply('👍'))
bot.hears('hi', (ctx) => ctx.reply('Hey there'))
bot.launch()
```

```js
const { WhatsAppBot } = require('whatsappbot')

const bot = new WhatsAppBot(process.env.BOT_TOKEN)
bot.command('oldschool', (ctx) => ctx.reply('Hello'))
bot.command('modern', ({ reply }) => reply('Yo'))
bot.command('hipster', WhatsAppBot.reply('λ'))
bot.launch()
```

There's some cool [examples too](examples/).
