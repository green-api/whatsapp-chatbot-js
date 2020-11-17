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

bot.hears([1, '️Back to start'], (ctx) => {
  ctx.reply('Write your first and last name')
  ctx.scene.enter('getName')
})

bot.start((ctx) => {
  ctx.reply('Write your first and last name')
  ctx.scene.enter('getName')
})

bot.hears(/w*/, (ctx) => {
  ctx.reply('Write your first and last name')
  ctx.scene.enter('getName')
})

getName.command('start', async (ctx) => {
  ctx.reply(
    'Lets start from beginning. Write your first and last name',
    { reply_markup: { remove_keyboard: true } }
  )
  await ctx.scene.leave('getEduc')
  ctx.scene.enter('getName')
})

getName.on('text', async (ctx) => {
  if (ctx.message.text === '1') { //'1 Back'
    return ctx.reply('You are already at the beginning. Write your name')
  }

  ctx.session.name = ctx.message.text
  ctx.reply(
    'Write your birth year' +
    `\n\nYour info:\nName: ${ctx.session.name}`,
    { reply_markup: { keyboard: [['1 - ◀️Back']]} }
    )
  await ctx.scene.leave('getName')
  ctx.scene.enter('getYear')
})

getYear.hears(/^[0-9]{4}$/, async (ctx) => {
  ctx.session.year = ctx.message.text
  ctx.reply(
    'Tell something about your education. Where did you graduated from?' +
    `\n\nYour info:\nName: ${ctx.session.name};\nBirthday year: ${ctx.session.year}`,
    { reply_markup: { keyboard: [['1 - ◀️Back', '2 - ❌Delete all']]} }
  )
  await ctx.scene.leave('getYear')
  ctx.scene.enter('getEduc')
})


getYear.hears(['1', '1. Back'], async (ctx) => {
    ctx.reply('Write your first and last name')
    await ctx.scene.leave('getYear')
    ctx.scene.enter('getName')
  }
)

getYear.hears(['2', '2. Delete all'], async (ctx) => {
  ctx.reply('Lets start from beginning. Write your first and last name')
  await ctx.scene.leave('getYear')
  ctx.scene.enter('getName')
}
)

getYear.on('text', async (ctx) => {
  ctx.reply(
    'Write a year only, for example  1990' +
    `\n\nYour info:\nName: ${ctx.session.name}`,
    { reply_markup: { keyboard: [['1 - ◀️Back', '2 - ❌Delete all']] } }
  )
})

getEduc.hears(['1', '1. Back'], async (ctx) => {
    ctx.reply(
      'Write birth year' +
      `\n\nYour info:\nName: ${ctx.session.name}`,
      { reply_markup: { keyboard: [['1 - ◀️Back', '2 - ❌Delete all']] }}
    )
    await ctx.scene.leave('getEduc')
    ctx.scene.enter('getYear')
})

getEduc.hears(['2', '2. Delete all', '/start'], async (ctx) => {
    ctx.reply('Lets start from beginning. Write your first and last name')
    await ctx.scene.leave('getEduc')
    ctx.scene.enter('getName')
})

getEduc.on('text', async (ctx) => {
  ctx.session.educ = ctx.message.text
  ctx.reply(
    'Print "Send contact" keyboard number to share your phone number.' +
    `\n\nYout info:\nName: ${ctx.session.name};\nBirth year: ${ctx.session.year};\nEducation: ${ctx.session.educ};`,
    { reply_markup: { keyboard: [['1 - 📱Send Contact', '2 - ◀️Back', '3 - ❌Delete all']] } }
  )
  await ctx.scene.leave('getEduc')
  ctx.scene.enter('getNumber')
})


getNumber.hears(['2', '2. Back'], async (ctx) => {
  ctx.reply(
    'Tell something about your education. Where did you graduated from?' +
    `\n\nYour info:\nName: ${ctx.session.name};\nBirth year: ${ctx.session.year}`,
    { reply_markup: { keyboard: [['1 - ◀️Back', '2 - ❌Delete all']]} }
  )
  await ctx.scene.leave('getNumber')
  ctx.scene.enter('getEduc')
})

getNumber.hears(['3', '3. Delete all', '/start'], async (ctx) => {
  ctx.reply('Lets start from beginning. Write your first and last name',     { reply_markup: { remove_keyboard: true } }   )
  await ctx.scene.leave('getNumber')
  ctx.scene.enter('getName')
  ctx.session = null
})

getNumber.hears(['1', '1. Send contact'], async (ctx) => {
  ctx.session.phone = ctx.message.chat.id.split('@')[0]
  ctx.reply(
    '❗️Revise your info and print keyboard for "Correct" key: ' + 
    `\n\nName: ${ctx.session.name};\nBirth year: ${ctx.session.year};\nEducation: ${ctx.session.educ};` + 
    `\nНомер: ${ctx.session.phone}`,
    { reply_markup: { keyboard: [['️1 - ✅Correct'], ['2 - ◀️Back', '3 - ❌Delete all']]}}
  )
  await ctx.scene.leave('getNumber')
  ctx.scene.enter('check')
})


check.hears(['1', '1 Correct'], (ctx) => {
  ctx.reply('✅ Thanks! Your data has been accepted. We will call you.', { reply_markup: { keyboard: [['️1 - ⬅️Back o start']] } }
  )
  ctx.scene.leave('main')

  console.log(`New order! \n\nName: [${ctx.session.name}](${ctx.from.id});\nBirth year: ${ctx.session.year};\nEducation: ${ctx.session.educ};` + 
    `\nPhone: ${ctx.session.phone}`)
  
  ctx.session = null
})

check.hears(['2', '2. Back'], async (ctx) => {
  ctx.reply(
    'Print "Send contact" keyboard number to share your phone number.' +
    `\n\nYour info:\nName: ${ctx.session.name};\nBirth year: ${ctx.session.year};\nEducation: ${ctx.session.educ};` +
    { reply_markup: { keyboard: [[{text: '1 - 📱Отправить контакт'}], ['2 - ◀️Back', '3 - ❌Delete all']]} }
  )
  await ctx.scene.leave('check')
  ctx.scene.enter('getNumber')
})

check.hears(['3', '3. Delete all', '/start'], async (ctx) => {
  ctx.reply('Lets start from beginning. Write your first and last name')
  await ctx.scene.leave('getNumber')
  ctx.scene.enter('getCompSkills')
  ctx.session = null
})


bot.startPolling()