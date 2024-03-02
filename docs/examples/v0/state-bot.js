const WhatsAppBot = require('../../../src/whatsappbot')

const session = WhatsAppBot.session
const Stage = WhatsAppBot.Stage
const Scene = WhatsAppBot.BaseScene

const bot = new WhatsAppBot({
    idInstance: "1101848922",
    apiTokenInstance: "651450d7045842a58ca7bb62a1eb6e4b09426645ae574fdfaf"
})

const loginScene = new Scene("loginScene")
loginScene.enter((ctx) => ctx.reply("Привет! Этот бот - пример использования состояния.\nПожалуйста введите логин:"))
loginScene.on("text", (ctx) => {
  const login = ctx.message.text
    if (login && login.length >= 6 && login.length <= 12) {
        ctx.session.login = login
        ctx.reply("Логин \"" + login + "\" - успешно сохранен.\nПридумайте пароль:")
        ctx.scene.enter("passwordScene")
    } else {
        ctx.reply("Логин должен быть от 6 до 12 символов")
    }
})
loginScene.on("message", (ctx) => {
    ctx.reply("Сообщение должно содержать текст!")
})

const passwordScene = new Scene("passwordScene")
passwordScene.on("text", (ctx) => {
    const password = ctx.message.text
    if (password && password.length >= 6 && password.length <= 12) {
        ctx.session.password = password
        ctx.reply("Успех! Ваш логин: " + ctx.session.login + "\nВаш пароль: " + ctx.session.password)
        ctx.scene.leave()
    } else {
        ctx.reply("Пароль должен быть от 6 до 12 символов")
    }
})

const stage = new Stage([loginScene, passwordScene])
bot.use(session())
bot.use(stage.middleware())
bot.on('message', (ctx) => ctx.scene.enter('loginScene'))
bot.launch()