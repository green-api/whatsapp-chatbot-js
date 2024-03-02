const WhatsAppBot = require('../../../src/whatsappbot')

const bot = new WhatsAppBot({
    idInstance: process.env.ID_INSTANCE,
    apiTokenInstance: process.env.API_TOKEN_INSTANCE
})

bot.on('message', (ctx, next) => {
    ctx.reply('Send - test or cat or dog')
    next()
})
bot.hears('hi', (ctx, next) => {
    ctx.reply('You write "test"')
    next()
})
bot.hears('photo', (ctx, next) => {
    ctx.reply('You write "cat"')
    next()
})
bot.hears('contact', (ctx, next) => {
    ctx.reply('You write "dog"')
    next()
})
bot.launch()