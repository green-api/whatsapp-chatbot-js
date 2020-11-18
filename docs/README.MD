## API reference

## WhatsAppBot

WhatsApp Bot API reference

```js
const WhatsAppBot = require('@green-api/whatsapp-bot')
```

##### Constructor

Initialize new WhatsAppBot bot.

`const whatsapp = new WhatsAppBot(token, [options])`

| Param | Type | Description |
| --- | --- | --- |
| token | `object` | Object containg idInstance and apiTokenInstance properties, You can get it on [Green api](https://green-api.com/) |
| [options] | `object` | WhatsApp options. |

WhatsApp options:

```js
{
  apiType: GreenApiV0    // Apply Green-API-V0 protocol to integrate with WhatsApp. This protocol is used by default
}
```

##### use

Registers a middleware.

`whatsapp.use(...middleware)`

| Param | Type | Description |
| --- | --- | --- |
| middleware | `function` | Middleware function |

##### on

Registers middleware for provided update type.

`whatsapp.on(updateTypes, ...middleware)`

| Param | Type | Description |
| --- | --- | --- |
| updateTypes | `string/string[]` | Update type. For example 'text' |
| middleware | `function` | Middleware |

##### hears

Registers middleware for handling `text` messages.

`whatsapp.hears(triggers, ...middleware)`

| Param | Type | Description |
| --- | --- | --- |
| triggers | `string/string[]/RegEx/RegEx[]/Function` | Triggers |
| middleware | `function` | Middleware |

##### command

Handles user command i.e. user text printing starting with '/'

`whatsapp.command(commands, ...middleware)`

| Param | Type | Description |
| --- | --- | --- |
| commands | `string/string[]` | Commands |
| middleware | `function` | Middleware |

##### start

Handler for /start command.

`whatsapp.start(...middleware)`

| Param | Type | Description |
| --- | --- | --- |
| middleware | `function` | Middleware |

##### help

Handler for /help command.

`whatsapp.help(...middleware)`

| Param | Type | Description |
| --- | --- | --- |
| middleware | `function` | Middleware |

##### launch

Launch bot in long-polling mode. 

`whatsapp.launch() => Promise`

##### startPolling

Start poll updates.

`whatsapp.startPolling()`

##### stop

Stop Webhook and polling

`whatsapp.stop([callback]) => Promise`

| Param | Type |
| ---  | --- |
| [callback] | function |


##### WhatsAppBot.hears

Generates middleware for handling `text` messages with regular expressions.

`WhatsAppBot.hears(triggers, ...middleware) => function`

| Param | Type | Description |
| --- | --- | --- |
| triggers | `string/string[]/RegEx/RegEx[]/Function/Function[]` | Triggers |
| handler | `function` | Handler |


## GreenApiV0

GreenApiV0 client API reference.

```js
const WhatsAppBot = require('@green-api/whatsapp-bot')
const GreenApiV0 = WhatsAppBot.GreenApiV0
```

##### Constructor

Initialize new GreenApiV0 client.

`const greenApiV0 = new GreenApiV0(token, [options])`

| Param | Type | Description |
| --- | --- | --- |
| token | `object` | Object containg idInstance and apiTokenInstance properties, You can get it on [Green api]


##### sendMessage

Sends text message.

`greenApiV0.sendMessage(chatId, text) => Promise`

| Param | Type | Description |
| --- | --- | --- |
| chatId | `string` | Chat id with format something like  "79001234567@c.us" |
| text | `string` | Message |

## Stage

Simple scene-based control flow middleware.

```js
const WhatsAppBot = require('@green-api/whatsapp-bot')

const session = WhatsAppBot.session
const Stage = WhatsAppBot.Stage
const Scene = WhatsAppBot.BaseScene

// Handler factoriess
const { enter, leave } = Stage

// Greeter scene
const greeterScene = new Scene('greeter')
greeterScene.enter((ctx) => ctx.reply('Hi'))
greeterScene.leave((ctx) => ctx.reply('Bye'))
greeterScene.hears('hi', enter('greeter'))
greeterScene.on('message', (ctx) => ctx.replyWithMarkdown('Send `hi`'))

// Echo scene
const echoScene = new Scene('echo')
echoScene.enter((ctx) => ctx.reply('echo scene'))
echoScene.leave((ctx) => ctx.reply('exiting echo scene'))
echoScene.command('back', leave())
echoScene.on('text', (ctx) => ctx.reply(ctx.message.text))
echoScene.on('message', (ctx) => ctx.reply('Only text messages please'))

const bot = new WhatsAppBot({
    idInstance: process.env.ID_INSTANCE,
    apiTokenInstance: process.env.API_TOKEN_INSTANCE
})
const stage = new Stage([greeterScene, echoScene])
bot.use(session())
bot.use(stage.middleware())
bot.command('greeter', (ctx) => ctx.scene.enter('greeter'))
bot.command('echo', (ctx) => ctx.scene.enter('echo'))
bot.on('message', (ctx) => ctx.reply('Try /echo or /greeter'))
bot.launch()

```

Scenes related context props and functions:

```js
bot.on('message', (ctx) => {
  ctx.scene.state                                    // Current scene state (persistent)
  ctx.scene.enter(sceneId, [defaultState, silent])   // Enter scene
  ctx.scene.reenter()                                // Reenter current scene
  ctx.scene.leave()                                  // Leave scene
})
```
