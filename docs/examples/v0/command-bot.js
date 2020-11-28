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