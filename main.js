const {WhatsAppBot} = require('./src/whatsappbot');
const {getConfigData} = require("./util/config");
const {getStringsData} = require("./util/ymlReader");
const fs = require('fs');
const FormData = require('form-data');

const session = WhatsAppBot.session
const Stage = WhatsAppBot.Stage
const Scene = WhatsAppBot.BaseScene

main()

async function main() {
    const configData = await getConfigData()
    const strings = getStringsData()
    const bot = new WhatsAppBot({
        idInstance: configData.user_id.toString(),
        apiTokenInstance: configData.api_token_id,
    })

    let settings = await bot.telegram.restAPI.settings.setSettings({
        incomingWebhook: "yes",
        outgoingMessageWebhook: "yes",
        outgoingAPIMessageWebhook: "yes",
        pollMessageWebhook: "yes",
        markIncomingMessagesReaded: "yes"
    });
    console.log(settings);

    await clearWebhookQueue(bot)
    console.log("cleared")


    const startScene = new Scene('startScene')
    startScene.enter((ctx) => {
        ctx.reply(strings.select_language)
        ctx.scene.enter('mainMenuScene')
    })


    const mainMenuScene = new Scene('mainMenuScene')
    mainMenuScene.hears(['1'], (ctx) => {
        sendMainMenu(ctx, "en", strings);
    })
    mainMenuScene.hears(['2'], (ctx) => {
        sendMainMenu(ctx, "kz", strings);
    })
    mainMenuScene.hears(['3'], (ctx) => {
        sendMainMenu(ctx, "ru", strings);
    })
    mainMenuScene.hears(['4'], (ctx) => {
        sendMainMenu(ctx, "es", strings);
    })
    mainMenuScene.hears(['5'], (ctx) => {
        sendMainMenu(ctx, "he", strings);
    })
    mainMenuScene.hears(['6'], (ctx) => {
        sendMainMenu(ctx, "ar", strings);
    })
    mainMenuScene.on("message", (ctx) => {
        ctx.reply(strings.specify_language)
    })


    const endpointsScene = new Scene('endpointsScene')
    endpointsScene.hears(['1'], (ctx) => {
        ctx.reply(strings.send_text_message[ctx.session.lang] + strings.links[ctx.session.lang].send_text_documentation)
    })
    endpointsScene.hears(['2'], (ctx) => {
        ctx.telegram.restAPI.file.sendFileByUrl(
            ctx.update.message.chat.id.toString(),
            undefined,
            configData.link_1.toString(),
            "image.pdf",
            strings.send_file_message[ctx.session.lang] + strings.links[ctx.session.lang].send_file_documentation)
    })
    endpointsScene.hears(['3'], (ctx) => {
        ctx.telegram.restAPI.file.sendFileByUrl(
            ctx.update.message.chat.id.toString(),
            undefined,
            configData.link_2.toString(),
            "image.jpg",
            strings.send_image_message[ctx.session.lang] + strings.links[ctx.session.lang].send_file_documentation)
    })
    endpointsScene.hears(['4'], async (ctx) => {
        await ctx.reply(strings.send_audio_message[ctx.session.lang] + strings.links[ctx.session.lang].send_file_documentation)

        let fileLink = configData.link_5.toString()
        if (ctx.session.lang === "ru") {
            fileLink = configData.link_3.toString()
        }
        ctx.telegram.restAPI.file.sendFileByUrl(
            ctx.update.message.chat.id.toString(),
            undefined,
            fileLink,
            "audio.mp3",
            strings.send_image_message[ctx.session.lang] + strings.links[ctx.session.lang].send_file_documentation)
    })
    endpointsScene.hears(['5'], (ctx) => {
        let fileLink = configData.link_6.toString()
        if (ctx.session.lang === "ru") {
            fileLink = configData.link_5.toString()
        }
        ctx.telegram.restAPI.file.sendFileByUrl(
            ctx.update.message.chat.id.toString(),
            undefined,
            fileLink,
            "video.mp4",
            strings.send_video_message[ctx.session.lang] + strings.links[ctx.session.lang].send_file_documentation)
    })
    endpointsScene.hears(['6'], async (ctx) => {
        await ctx.reply(strings.send_contact_message[ctx.session.lang] + strings.links[ctx.session.lang].send_contact_documentation)

        const contact = {
            firstName: ctx.update.message.from.first_name.toString(),
            lastName: ctx.update.message.from.last_name.toString(),
            phoneContact: parseInt(ctx.update.message.chat.id)
        };
        ctx.telegram.restAPI.message.sendContact(
            ctx.update.message.chat.id.toString(),
            undefined,
            contact
        )
    })
    endpointsScene.hears(['7'], async (ctx) => {
        await ctx.reply(strings.send_location_message[ctx.session.lang] + strings.links[ctx.session.lang].send_location_documentation)
        ctx.telegram.restAPI.message.sendLocation(
            ctx.update.message.chat.id.toString(),
            undefined,
            "Malta island",
            "address",
            35.888171,
            14.440230)
    })
    endpointsScene.hears(['8'], async (ctx) => {
        await ctx.reply(strings.send_poll_message[ctx.session.lang] + strings.links[ctx.session.lang].send_poll_documentation)

        const options = [];
        options.push({optionName: strings.poll_option_1[ctx.session.lang]})
        options.push({optionName: strings.poll_option_2[ctx.session.lang]})
        options.push({optionName: strings.poll_option_3[ctx.session.lang]})

        ctx.telegram.restAPI.message.sendPoll(
            ctx.update.message.chat.id.toString(),
            undefined,
            strings.poll_question[ctx.session.lang].toString(),
            options)
    })
    endpointsScene.hears(['9'], async (ctx) => {
        await ctx.reply(strings.get_avatar_message[ctx.session.lang] + strings.links[ctx.session.lang].get_avatar_documentation)

        const avatar = await ctx.telegram.restAPI.instance.getAvatar(
            ctx.update.message.from.id.toString(),
            undefined);

        if (avatar.urlAvatar != null) {
            ctx.telegram.restAPI.file.sendFileByUrl(
                ctx.update.message.chat.id.toString(),
                undefined,
                avatar.urlAvatar.toString(),
                "avatar",
                strings.avatar_found[ctx.session.lang])
        } else {
            ctx.reply(strings.avatar_not_found[ctx.session.lang])
        }
    })
    endpointsScene.hears(['10'], async (ctx) => {
        await ctx.reply(strings.send_link_message_preview[ctx.session.lang].toString() +
            strings.links[ctx.session.lang].send_link_documentation)
        ctx.telegram.restAPI.message.sendMessageExtended(
            ctx.update.message.chat.id.toString(),
            undefined,
            strings.send_link_message_no_preview[ctx.session.lang].toString() +
            strings.links[ctx.session.lang].send_link_documentation,
            undefined,
            false)
    })
    endpointsScene.hears(['11'], async (ctx) => {
        await ctx.reply(strings.add_to_contact[ctx.session.lang].toString())

        const contact = {
            firstName: strings.bot_name[ctx.session.lang].toString(),
            phoneContact: parseInt(parseInt(ctx.botInfo.id, 10))
        };
        ctx.telegram.restAPI.message.sendContact(
            ctx.update.message.chat.id,
            undefined,
            contact
        )
        ctx.scene.enter("createGroup")
    })
    endpointsScene.hears(['12'], (ctx) => {
        ctx.telegram.restAPI.message.sendMessageExtended(
            ctx.update.message.chat.id.toString(),
            undefined,
            strings.send_quoted_message[ctx.session.lang].toString() +
            strings.links[ctx.session.lang].send_quoted_message_documentation,
            ctx.update.message.message_id,
            false)
    })
    endpointsScene.hears(['13'], (ctx) => {
        const fileStream = fs.createReadStream("assets/about_js.jpg");
        var formData = new FormData()
        formData.append('file', fileStream);
        formData.append("chatId", ctx.update.message.chat.id.toString())
        formData.append("fileName", "welcome.png")
        formData.append("caption",
            strings.about_go_chatbot[ctx.session.lang] +
            strings.link_to_docs[ctx.session.lang] +
            strings.links[ctx.session.lang].chatbot_documentation +
            strings.link_to_source_code[ctx.session.lang] +
            strings.links[ctx.session.lang].chatbot_source_code +
            strings.link_to_green_api[ctx.session.lang] +
            strings.links[ctx.session.lang].greenapi_website +
            strings.link_to_console[ctx.session.lang] +
            strings.links[ctx.session.lang].greenapi_console +
            strings.link_to_youtube[ctx.session.lang] +
            strings.links[ctx.session.lang].youtube_channel)

        ctx.telegram.restAPI.file.sendFileByUpload(formData)
    })
    endpointsScene.hears(['stop', 'Stop', 'стоп', 'Стоп', '0'], (ctx) => {
        ctx.reply(strings.stop_message[ctx.session.lang] + "*" + ctx.update.message.from.first_name + "*!")
        ctx.scene.leave()
    })
    endpointsScene.hears(['menu', 'Menu', 'меню', 'Меню'], (ctx) => {
        let filePath;
        if (ctx.session.lang === "ru") {
            filePath = "assets/welcome_ru.png"
        } else {
            filePath = "assets/welcome_en.png"
        }

        const fileStream = fs.createReadStream(filePath);
        const formData = new FormData();
        formData.append('file', fileStream);
        formData.append("chatId", ctx.update.message.chat.id.toString())
        formData.append("fileName", "welcome.png")
        formData.append("caption", strings.menu[ctx.session.lang])

        ctx.telegram.restAPI.file.sendFileByUpload(formData)
    })
    endpointsScene.on("poll_update", (ctx) => {
        var votes = ctx.update.message.poll_update.votes
        var isYes = votes[0].optionVoters.includes(ctx.update.message.from.id)
        var isNo = votes[1].optionVoters.includes(ctx.update.message.from.id)
        var isNothing = votes[2].optionVoters.includes(ctx.update.message.from.id)

        var messageText = "";
        if (isYes) {
            messageText = strings.poll_answer_1[ctx.session.lang]
        }
        if (isNo) {
            messageText = strings.poll_answer_2[ctx.session.lang]
        }
        if (isNothing) {
            messageText = strings.poll_answer_3[ctx.session.lang]
        }
        ctx.reply(messageText)
    })
    endpointsScene.hears("message", (ctx) => {
        ctx.reply(strings.not_recognized_message[ctx.session.lang])
    })


    const createGroup = new Scene('createGroup')
    createGroup.hears('1', async (ctx) => {
        let group = await ctx.telegram.restAPI.group.createGroup(strings.group_name[ctx.session.lang], [ctx.message.from.id]);
        let setGroupPicture = await ctx.telegram.restAPI.group.setGroupPicture(group.chatId.toString(), "assets/group_avatar.jpg");
        let isSet = setGroupPicture.setGroupPicture
        if (isSet) {
            await ctx.telegram.restAPI.message.getMessage(group.chatId,
                strings.send_group_message[ctx.session.lang] +
                strings.links[ctx.session.lang].create_group_documentation)
        } else {
            await ctx.telegram.restAPI.message.getMessage(group.chatId,
                strings.send_group_message_set_picture_false[ctx.session.lang] +
                strings.links[ctx.session.lang].create_group_documentation)
        }
        ctx.reply(strings.group_created_message[ctx.session.lang] + group.groupInviteLink.toString())
        ctx.scene.enter("endpointsScene")
    })
    createGroup.hears(['0', 'menu', 'Menu', 'меню', 'Меню'], (ctx) => {
        let filePath;
        if (ctx.session.lang === "ru") {
            filePath = "assets/welcome_ru.png"
        } else {
            filePath = "assets/welcome_en.png"
        }

        const fileStream = fs.createReadStream(filePath);
        const formData = new FormData();
        formData.append('file', fileStream);
        formData.append("chatId", ctx.update.message.chat.id.toString())
        formData.append("fileName", "welcome.png")
        formData.append("caption", strings.menu[ctx.session.lang])

        ctx.telegram.restAPI.file.sendFileByUpload(formData)
        ctx.scene.enter("endpointsScene")
    })
    createGroup.hears("message", (ctx) => {
        ctx.reply(strings.not_recognized_message[ctx.session.lang])
    })

    const stage = new Stage([mainMenuScene, endpointsScene, startScene, createGroup])
    bot.use(session())
    bot.use(stage.middleware())

    bot.on('message', (ctx) => ctx.scene.enter('startScene'))
    launchBotWithErrorHandler(bot)
}

function launchBotWithErrorHandler(bot) {
    try {
        bot.launch()
    } catch (error) {
        console.error("Error in main:", error);
        launchBotWithErrorHandler(bot)
    }
}

async function clearWebhookQueue(bot) {
    let notification = await bot.telegram.restAPI.webhookService.receiveNotification();
    if (notification === null) {
        console.log("queue is empty")
    } else {
        await bot.telegram.restAPI.webhookService.deleteNotification(parseInt(notification.receiptId))
        console.log("delete notification id: " + notification.receiptId)
        await clearWebhookQueue(bot);
    }
}

function sendMainMenu(ctx, lang, strings) {
    ctx.session.lang = lang

    let filePath;
    if (lang === "ru") {
        filePath = "assets/welcome_ru.png"
    } else {
        filePath = "assets/welcome_en.png"
    }

    const fileStream = fs.createReadStream(filePath);
    const formData = new FormData();
    formData.append('file', fileStream);
    formData.append("chatId", ctx.update.message.chat.id.toString())
    formData.append("fileName", "welcome.png")
    formData.append("caption",
        strings.welcome_message[ctx.session.lang] +
        "*" + ctx.update.message.from.first_name + "*!\n" +
        strings.menu[ctx.session.lang])

    ctx.telegram.restAPI.file.sendFileByUpload(formData)
    ctx.scene.enter('endpointsScene')
}