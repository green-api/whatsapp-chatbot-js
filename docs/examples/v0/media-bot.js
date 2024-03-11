const WhatsAppBot = require('../../../src/whatsappbot')

const bot = new WhatsAppBot({
    idInstance: process.env.ID_INSTANCE,
    apiTokenInstance: process.env.API_TOKEN_INSTANCE
})

bot.on('message', (ctx, next) => {
    ctx.reply('Send any media - photo, document, location, voice, contacts...')
    next()
})
bot.on('document', (ctx, next) => {
    ctx.reply('Hello document!')
    next()
})
bot.on('photo', (ctx, next) => {
    ctx.reply('Hello photo!')
    next()
})
bot.on('contact', (ctx, next) => {
    ctx.reply('Hello contact!')
    next()
})
bot.on('location', (ctx, next) => {
    ctx.reply('Hello location!')
    next()
})
bot.on('voice', (ctx, next) => {
    ctx.reply('Hello voice!')
    next()
})
bot.on('pollUpdate', (ctx, next) => {
    ctx.reply('Hello poll update!')
    next()
})
bot.launch()