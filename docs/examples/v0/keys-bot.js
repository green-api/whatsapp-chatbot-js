const WhatsAppBot = require('@green-api/whatsapp-bot')

const session = WhatsAppBot.session
const Stage = WhatsAppBot.Stage
const Scene = WhatsAppBot.BaseScene

// Handler factoriess
const { enter, leave } = Stage

// Greeter scene
const greeterScene = new Scene('greeter')
greeterScene.enter((ctx) => ctx.reply('Hi', { reply_markup: { keyboard: [['1 - ✅Next']]} }))
greeterScene.leave((ctx) => ctx.reply('Okay. Start next scene'))
greeterScene.hears('hi', enter('greeter'))
greeterScene.hears(['1', '1. Next'], async (ctx) => {
    await ctx.scene.leave('greeter')
    ctx.scene.enter('doings')
})

// Doings scene
const doingsScene = new Scene('doings')
doingsScene.enter((ctx) => ctx.reply('How are you doing?'))
doingsScene.leave((ctx) => ctx.reply('Nice to hear that! Bye'))
doingsScene.hears('fine', leave('doings'))
doingsScene.on('message', (ctx) => ctx.replyWithMarkdown('Say `fine`'))

const bot = new WhatsAppBot({
    idInstance: process.env.ID_INSTANCE,
    apiTokenInstance: process.env.API_TOKEN_INSTANCE
})
const stage = new Stage([greeterScene, doingsScene])
bot.use(session())
bot.use(stage.middleware())
bot.on('message', (ctx) => ctx.scene.enter('greeter'))
bot.launch()
