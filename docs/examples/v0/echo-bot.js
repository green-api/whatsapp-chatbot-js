const WhatsAppBot = require('@green-api/whatsapp-bot')

const bot = new WhatsAppBot({
    idInstance: process.env.ID_INSTANCE,
    apiTokenInstance: process.env.API_TOKEN_INSTANCE
})

bot.on('message', (ctx) => {
    ctx.reply(ctx.message.text)
})
bot.launch()