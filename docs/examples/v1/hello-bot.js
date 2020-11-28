const WhatsAppBot = require('@green-api/whatsapp-bot')

const bot = new WhatsAppBot(process.env.TOKEN_V1, {apiType: WhatsAppBot.GreenApiV1})

bot.on('message', (ctx) => {
    ctx.reply('Hello world!')
})
bot.launch()