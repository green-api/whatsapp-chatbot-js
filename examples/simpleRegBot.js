const Telegraf = require('../src/telegraf')
const session = require('../src/session')
const Stage = require('../src/stage')
const Scene = require( '../src/scenes/base')
const data = require('./credentials')

const stage = new Stage()
const bot = new Telegraf({
  idInstance: data.idInstance,
  apiTokenInstance: data.apiTokenInstance
})

const getName = new Scene('getName')
stage.register(getName)
const getYear = new Scene('getYear')
stage.register(getYear)
const getEduc = new Scene('getEduc')
stage.register(getEduc)
const getNumber = new Scene('getNumber')
stage.register(getNumber)
const check = new Scene('check')
stage.register(check)

bot.use(session())
bot.use(stage.middleware())

bot.hears([1, '️На главную'], (ctx) => {
  ctx.reply('Введите фамилию, имя и отчество')
  ctx.scene.enter('getName')
})

bot.start((ctx) => {
  ctx.reply('Введите фамилию, имя и отчество')
  ctx.scene.enter('getName')
})

bot.hears(/w*/, (ctx) => {
  ctx.reply('Введите фамилию, имя и отчество')
  ctx.scene.enter('getName')
})

getName.command('start', async (ctx) => {
  ctx.reply(
    'Начнем заново. Введите имя, фамилию и отчество',
    { reply_markup: { remove_keyboard: true } }
  )
  await ctx.scene.leave('getEduc')
  ctx.scene.enter('getName')
})

getName.on('text', async (ctx) => {
  if (ctx.message.text === '1') { //'1 Назад'
    return ctx.reply('Вы уже вернулись в самое начало. Введите, пожалуйста, свое имя')
  }

  ctx.session.name = ctx.message.text
  ctx.reply(
    'Введите год рождения' +
    `\n\nУже введенные данные:\nФ.И.О: ${ctx.session.name}`,
    { reply_markup: { keyboard: [['◀️1. Назад']]} }
    )
  await ctx.scene.leave('getName')
  ctx.scene.enter('getYear')
})

getYear.hears(/^[0-9]{4}$/, async (ctx) => {
  ctx.session.year = ctx.message.text
  ctx.reply(
    'А теперь расскажите о своем образовании. В каком вузе Вы учились и на каком факультете?' +
    `\n\nУже введенные данные:\nФ.И.О: ${ctx.session.name};\nГод рождения: ${ctx.session.year}`,
    { reply_markup: { keyboard: [['◀️1. Назад', '❌2. Стереть все']]} }
  )
  await ctx.scene.leave('getYear')
  ctx.scene.enter('getEduc')
})


getYear.hears(['1', '1. Назад'], async (ctx) => {
    ctx.reply('Введите фамилию, имя и отчество')
    await ctx.scene.leave('getYear')
    ctx.scene.enter('getName')
  }
)

getYear.hears(['2', '2. Стереть все'], async (ctx) => {
  ctx.reply('Начнем заново. Введите имя, фамилию и отчество')
  await ctx.scene.leave('getYear')
  ctx.scene.enter('getName')
}
)

getYear.on('text', async (ctx) => {
  ctx.reply(
    'Введите только год рождения в формате 1990' +
    `\n\nУже введенные данные:\nФ.И.О: ${ctx.session.name}`,
    { reply_markup: { keyboard: [['◀️1. Назад', '❌2. Стереть все']] } }
  )
})

getEduc.hears(['1', '1. Назад'], async (ctx) => {
    ctx.reply(
      'Введите год рождения' +
      `\n\nУже введенные данные:\nФ.И.О: ${ctx.session.name}`,
      { reply_markup: { keyboard: [['◀️1. Назад', '❌2. Стереть все']] }}
    )
    await ctx.scene.leave('getEduc')
    ctx.scene.enter('getYear')
})

getEduc.hears(['2', '2. Стереть все', '/start'], async (ctx) => {
    ctx.reply('Начнем заново. Введите имя, фамилию и отчество')
    await ctx.scene.leave('getEduc')
    ctx.scene.enter('getName')
})

getEduc.on('text', async (ctx) => {
  ctx.session.educ = ctx.message.text
  ctx.reply(
    'Нажмите кнопку "Отправить контакт" ниже, чтобы поделиться номером.' +
    `\n\nУже введенные данные:\nФ.И.О: ${ctx.session.name};\nГод рождения: ${ctx.session.year};\nОбразование: ${ctx.session.educ};`,
    { reply_markup: { keyboard: [['📱1. Отправить контакт', '◀️2. Назад', '❌3. Стереть все']] } }
  )
  await ctx.scene.leave('getEduc')
  ctx.scene.enter('getNumber')
})


getNumber.hears(['2', '2. Назад'], async (ctx) => {
  ctx.reply(
    'А теперь расскажите о своем образовании. В каком вузе Вы учились и на каком факультете?' +
    `\n\nУже введенные данные:\nФ.И.О: ${ctx.session.name};\nГод рождения: ${ctx.session.year}`,
    { reply_markup: { keyboard: [['◀️1. Назад', '❌2. Стереть все']]} }
  )
  await ctx.scene.leave('getNumber')
  ctx.scene.enter('getEduc')
})

getNumber.hears(['3', '3. Стереть все', '/start'], async (ctx) => {
  ctx.reply('Начнем заново. Введите имя, фамилию и отчество',     { reply_markup: { remove_keyboard: true } }   )
  await ctx.scene.leave('getNumber')
  ctx.scene.enter('getName')
  ctx.session = null
})

getNumber.hears(['1', '1. Отправить контакт'], async (ctx) => {
  ctx.session.phone = ctx.message.chat.id.split('@')[0]
  ctx.reply(
    '❗️ Проверьте все данные и нажмите "Все верно", если они корректны: ' + 
    `\n\nФ.И.О: ${ctx.session.name};\nГод рождения: ${ctx.session.year};\nОбразование: ${ctx.session.educ};` + 
    `\nНомер: ${ctx.session.phone}`,
    { reply_markup: { keyboard: [['️✅1. Все верно'], ['◀️2. Назад', '❌3. Стереть все']]}}
  )
  await ctx.scene.leave('getNumber')
  ctx.scene.enter('check')
})


check.hears(['1', '✅1. Все верно'], (ctx) => {
  ctx.reply('✅ Спасибо! Ваша заявка принята. Мы Вам перезвоним.', { reply_markup: { keyboard: [['️⬅️1. На главную']] } }
  )
  ctx.scene.leave('main')

  console.log(`Новая заявка! \n\nФ.И.О: [${ctx.session.name}](tg://user?id=${ctx.from.id});\nГод рождения: ${ctx.session.year};\nОбразование: ${ctx.session.educ};` + 
    `\nНомер: ${ctx.session.phone}`)
  
  ctx.session = null
})

check.hears(['2', '◀️ Назад'], async (ctx) => {
  ctx.reply(
    'Нажмите кнопку "Отправить контакт" ниже, чтобы поделиться номером.' +
    `\n\nУже введенные данные:\nФ.И.О: ${ctx.session.name};\nГод рождения: ${ctx.session.year};\nОбразование: ${ctx.session.educ};` +
    `\nТема диплома: ${ctx.session.theme};\nЯзыки: ${ctx.session.langs};\nВладение компьютером: ${ctx.session.compSkills}`,
    { reply_markup: { keyboard: [[{text: '📱1. Отправить контакт'}], ['◀️2. Назад', '❌3. Стереть все']]} }
  )
  await ctx.scene.leave('check')
  ctx.scene.enter('getNumber')
})

check.hears(['3', '❌3. Стереть все', '/start'], async (ctx) => {
  ctx.reply('Начнем заново. Введите имя, фамилию и отчество')
  await ctx.scene.leave('getNumber')
  ctx.scene.enter('getCompSkills')
  ctx.session = null
})


bot.startPolling()