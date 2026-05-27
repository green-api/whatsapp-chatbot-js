const WhatsAppBot = require('../../../src/whatsappbot')

const bot = new WhatsAppBot({
    idInstance: process.env.ID_INSTANCE,
    apiTokenInstance: process.env.API_TOKEN_INSTANCE
})

bot.on('text', (ctx, next) => {
    ctx.reply('Send - test or cat or dog')
    next()
})
bot.hears('test', (ctx, next) => {
    ctx.reply('You write "test"')
    next()
})
bot.hears('cat', (ctx, next) => {
    ctx.reply('You write "cat"')
    next()
})
bot.hears('dog', (ctx, next) => {
    ctx.reply('You write "dog"')
    next()
})
bot.launch()