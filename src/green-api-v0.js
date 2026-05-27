const replicators = require('./core/replicators')
const ApiClient = require('./core/network/client')
const whatsAppClient = require('@green-api/whatsapp-api-client')
const ApiUtils = require('./api-utils')

class GreenApiV0 extends ApiClient {

  constructor(token, options, webhookResponse) {
    super(token, options, webhookResponse)

    this.restAPI = whatsAppClient.restAPI({
      idInstance: token.idInstance,
      apiTokenInstance: token.apiTokenInstance,
    })
  }
  
  async getMe () {
    let settings = await this.restAPI.settings.getSettings();
    return new Promise((resolve) => {
      resolve({
        id: settings.wid,
        is_bot: true,
        username: 'whatsapp',
        /** true, if the bot can be invited to groups. Returned only in getMe. */
        can_join_groups: true,
        /** true, if privacy mode is disabled for the bot. Returned only in getMe. */
        can_read_all_group_messages: true,
        /** true, if the bot supports inline queries. Returned only in getMe. */
        supports_inline_queries: true,
      })
    })
  }

  getFile (fileId) {
    return this.callApi('getFile', { file_id: fileId })
  }

  getFileLink (fileId) {
    return Promise.resolve(fileId)
      .then((fileId) => {
        if (fileId && fileId.file_path) {
          return fileId
        }
        const id = fileId && fileId.file_id ? fileId.file_id : fileId
        return this.getFile(id)
      })
      .then((file) => `${this.options.apiRoot}/file/bot${this.token}/${file.file_path}`)
  }

  async getUpdates (timeout, limit, offset, allowedUpdates) {

    this.noty = await this.restAPI.webhookService.receiveNotification()
    if (!this.noty) {
      return []
    }
    await this.deleteWebhook()

    const incomingMsg = this.noty.body
    if (incomingMsg.typeWebhook !== 'incomingMessageReceived') {
      return []
    }
    
    const text = (incomingMsg.messageData.typeMessage == 'textMessage' ? incomingMsg.messageData.textMessageData.textMessage : '')
        || (incomingMsg.messageData.typeMessage == 'quotedMessage' ? incomingMsg.messageData.extendedTextMessageData.text : '')
        || (incomingMsg.messageData.typeMessage == 'extendedTextMessage' ? incomingMsg.messageData.extendedTextMessageData.text : '')

    const image = (incomingMsg.messageData.typeMessage == 'imageMessage' ? incomingMsg.messageData.fileMessageData: '') 
    const voice = (incomingMsg.messageData.typeMessage == 'audioMessage' ? incomingMsg.messageData.fileMessageData: '') 
    const document = (incomingMsg.messageData.typeMessage == 'documentMessage' ? incomingMsg.messageData.fileMessageData: '') 
    const video = (incomingMsg.messageData.typeMessage == 'videoMessage' ? incomingMsg.messageData.fileMessageData: '') 
    const location = (incomingMsg.messageData.typeMessage == 'locationMessage' ? incomingMsg.messageData.locationMessageData: '') 
    const contacts = (incomingMsg.messageData.typeMessage == 'contactMessage' ? incomingMsg.messageData.contactMessageData: '')
    const poll_update = (incomingMsg.messageData.typeMessage == 'pollUpdateMessage' ? incomingMsg.messageData.pollMessageData: '')

    const messageUpdate = {
      update_id: 1111,
      message: {
          text: text,
          chat: {
              id: incomingMsg.senderData.chatId,
              type: 'channel',
          },
          from: {
              first_name: incomingMsg.senderData.senderName,
              last_name: '',
              id: incomingMsg.senderData.sender,
              is_bot: false,
          },
          message_id: incomingMsg.idMessage,
          date: incomingMsg.timestamp,
          caption_entities: [
              {
                  type: 'bot_command',
                  offset: 0,
                  length: text.length,
              }
          ]
      }
    }

    if (document) {
      messageUpdate.message.document = {
        file_id: document.downloadUrl,
        file_name: document.caption,
        //mime_type: document.mime_type,
      }
    }

    if (image) {
      messageUpdate.message.photo = [
        {
          file_id: image.downloadUrl,
          //width: 
          //height: number;
          //file_size?: number;
        }
      ]
    }

    if (voice) {
      messageUpdate.message.voice = {
        file_id: voice.downloadUrl,
        //duration: number;
        //mime_type: voice.mime_type,
        //file_size?: number;
      }
    }

    if (contacts) {
      messageUpdate.message.contact = {
      //phone_number: contacts;
        first_name: displayName,
      //last_name?: string;
        user_id: contacts.vcard,
      }
    }

    if (location) {
      messageUpdate.message.location = {
        longitude: location.longitude,
        latitude: location.latitude,
      }
    }

    if (video) {
      messageUpdate.message.video = {
        file_id: video.downloadUrl,
        //width: number;
        //height: number;
        //duration: number;
        //thumb?: PhotoSize;
        //mime_type?: string;
        //file_size?: number;
      }
    }

    if (poll_update) {
      messageUpdate.message.poll_update = {
        stanzaId: poll_update.stanzaId,
        name: poll_update.name,
        votes: poll_update.votes,
        multipleAnswers: poll_update.multipleAnswers,
      }
    }

    return [
        messageUpdate
    ]
  }

  getWebhookInfo () {
    return this.callApi('getWebhookInfo')
  }

  getGameHighScores (userId, inlineMessageId, chatId, messageId) {
    return this.callApi('getGameHighScores', {
      user_id: userId,
      inline_message_id: inlineMessageId,
      chat_id: chatId,
      message_id: messageId
    })
  }

  setGameScore (userId, score, inlineMessageId, chatId, messageId, editMessage = true, force) {
    return this.callApi('setGameScore', {
      force,
      score,
      user_id: userId,
      inline_message_id: inlineMessageId,
      chat_id: chatId,
      message_id: messageId,
      disable_edit_message: !editMessage
    })
  }

  setWebhook (url, certificate, maxConnections, allowedUpdates) {
    return this.callApi('setWebhook', {
      url,
      certificate,
      max_connections: maxConnections,
      allowed_updates: allowedUpdates
    })
  }

  async deleteWebhook () {
    if (this.noty && this.noty.receiptId) {
      return this.restAPI.webhookService.deleteNotification(this.noty.receiptId);
    }
  }

  sendMessage (chatId, text, extra) {
    const textWithKeys = ApiUtils.keyEmulation(extra, text)
    return this.restAPI.message.sendMessage(chatId, null, textWithKeys)
  }

  forwardMessage (chatId, fromChatId, messageId, extra) {
    return this.callApi('forwardMessage', {
      chat_id: chatId,
      from_chat_id: fromChatId,
      message_id: messageId,
      ...extra
    })
  }

  sendChatAction (chatId, action) {
    return this.callApi('sendChatAction', { chat_id: chatId, action })
  }

  getUserProfilePhotos (userId, offset, limit) {
    return this.callApi('getUserProfilePhotos', { user_id: userId, offset, limit })
  }

  sendLocation (chatId, latitude, longitude, extra) {
    return this.api.messages.sendLocation(chatId, null, 'nameLocation', 'address', latitude, longitude)
  }

  sendVenue (chatId, latitude, longitude, title, address, extra) {
    return this.callApi('sendVenue', {
      latitude,
      longitude,
      title,
      address,
      chat_id: chatId,
      ...extra
    })
  }

  sendInvoice (chatId, invoice, extra) {
    return this.callApi('sendInvoice', { chat_id: chatId, ...invoice, ...extra })
  }

  sendContact (chatId, phoneNumber, firstName, extra) {
    return this.restAPI.file.sendContact(chatId, null, {
      phoneContact: phoneNumber,
      firstName: firstName,
    })
  }

  sendPhoto (chatId, photo, extra) {
    return this.restAPI.file.sendFileByUrl(chatId, null, photo, 'photo')
  }

  sendDice (chatId, extra) {
    return this.callApi('sendDice', { chat_id: chatId, ...extra })
  }

  sendDocument (chatId, document, extra) {
    return this.restAPI.file.sendFileByUrl(chatId, null, document, 'document')
  }

  sendAudio (chatId, audio, extra) {
    return this.restAPI.file.sendFileByUrl(chatId, null, audio, 'video')
  }

  sendSticker (chatId, sticker, extra) {
    return this.callApi('sendSticker', { chat_id: chatId, sticker, ...extra })
  }

  sendVideo (chatId, video, extra) {
    return this.restAPI.file.sendFileByUrl(chatId, null, video, 'video')
  }

  sendAnimation (chatId, animation, extra) {
    return this.callApi('sendAnimation', { chat_id: chatId, animation, ...extra })
  }

  sendVideoNote (chatId, videoNote, extra) {
    return this.callApi('sendVideoNote', { chat_id: chatId, video_note: videoNote, ...extra })
  }

  sendVoice (chatId, voice, extra) {
    return this.restAPI.file.sendFileByUrl(chatId, null, voice, 'voice')
  }

  sendGame (chatId, gameName, extra) {
    return this.callApi('sendGame', { chat_id: chatId, game_short_name: gameName, ...extra })
  }

  sendMediaGroup (chatId, media, extra) {
    return this.callApi('sendMediaGroup', { chat_id: chatId, media, ...extra })
  }

  sendPoll (chatId, question, options, extra) {
    return this.callApi('sendPoll', { chat_id: chatId, type: 'regular', question, options, ...extra })
  }

  sendQuiz (chatId, question, options, extra) {
    return this.callApi('sendPoll', { chat_id: chatId, type: 'quiz', question, options, ...extra })
  }

  stopPoll (chatId, messageId, extra) {
    return this.callApi('stopPoll', { chat_id: chatId, message_id: messageId, ...extra })
  }

  getChat (chatId) {
    return this.callApi('getChat', { chat_id: chatId })
  }

  getChatAdministrators (chatId) {
    return this.callApi('getChatAdministrators', { chat_id: chatId })
  }

  getChatMember (chatId, userId) {
    return this.callApi('getChatMember', { chat_id: chatId, user_id: userId })
  }

  getChatMembersCount (chatId) {
    return this.callApi('getChatMembersCount', { chat_id: chatId })
  }

  answerInlineQuery (inlineQueryId, results, extra) {
    return this.callApi('answerInlineQuery', { inline_query_id: inlineQueryId, results, ...extra })
  }

  setChatPermissions (chatId, permissions) {
    return this.callApi('setChatPermissions', { chat_id: chatId, permissions })
  }

  kickChatMember (chatId, userId, untilDate) {
    return this.callApi('kickChatMember', { chat_id: chatId, user_id: userId, until_date: untilDate })
  }

  promoteChatMember (chatId, userId, extra) {
    return this.callApi('promoteChatMember', { chat_id: chatId, user_id: userId, ...extra })
  }

  restrictChatMember (chatId, userId, extra) {
    return this.callApi('restrictChatMember', { chat_id: chatId, user_id: userId, ...extra })
  }

  setChatAdministratorCustomTitle (chatId, userId, title) {
    return this.callApi('setChatAdministratorCustomTitle', { chat_id: chatId, user_id: userId, custom_title: title })
  }

  exportChatInviteLink (chatId) {
    return this.callApi('exportChatInviteLink', { chat_id: chatId })
  }

  setChatPhoto (chatId, photo) {
    return this.callApi('setChatPhoto', { chat_id: chatId, photo })
  }

  deleteChatPhoto (chatId) {
    return this.callApi('deleteChatPhoto', { chat_id: chatId })
  }

  setChatTitle (chatId, title) {
    return this.callApi('setChatTitle', { chat_id: chatId, title })
  }

  setChatDescription (chatId, description) {
    return this.callApi('setChatDescription', { chat_id: chatId, description })
  }

  pinChatMessage (chatId, messageId, extra) {
    return this.callApi('pinChatMessage', { chat_id: chatId, message_id: messageId, ...extra })
  }

  unpinChatMessage (chatId) {
    return this.callApi('unpinChatMessage', { chat_id: chatId })
  }

  leaveChat (chatId) {
    return this.callApi('leaveChat', { chat_id: chatId })
  }

  unbanChatMember (chatId, userId) {
    return this.callApi('unbanChatMember', { chat_id: chatId, user_id: userId })
  }

  answerCbQuery (callbackQueryId, text, showAlert, extra) {
    return this.callApi('answerCallbackQuery', {
      text,
      show_alert: showAlert,
      callback_query_id: callbackQueryId,
      ...extra
    })
  }

  answerGameQuery (callbackQueryId, url) {
    return this.callApi('answerCallbackQuery', {
      url,
      callback_query_id: callbackQueryId
    })
  }

  answerShippingQuery (shippingQueryId, ok, shippingOptions, errorMessage) {
    return this.callApi('answerShippingQuery', {
      ok,
      shipping_query_id: shippingQueryId,
      shipping_options: shippingOptions,
      error_message: errorMessage
    })
  }

  answerPreCheckoutQuery (preCheckoutQueryId, ok, errorMessage) {
    return this.callApi('answerPreCheckoutQuery', {
      ok,
      pre_checkout_query_id: preCheckoutQueryId,
      error_message: errorMessage
    })
  }

  editMessageText (chatId, messageId, inlineMessageId, text, extra) {
    return this.callApi('editMessageText', {
      text,
      chat_id: chatId,
      message_id: messageId,
      inline_message_id: inlineMessageId,
      ...extra
    })
  }

  editMessageCaption (chatId, messageId, inlineMessageId, caption, extra = {}) {
    return this.callApi('editMessageCaption', {
      caption,
      chat_id: chatId,
      message_id: messageId,
      inline_message_id: inlineMessageId,
      parse_mode: extra.parse_mode,
      reply_markup: extra.parse_mode || extra.reply_markup ? extra.reply_markup : extra
    })
  }

  editMessageMedia (chatId, messageId, inlineMessageId, media, extra = {}) {
    return this.callApi('editMessageMedia', {
      chat_id: chatId,
      message_id: messageId,
      inline_message_id: inlineMessageId,
      media: { ...media, parse_mode: extra.parse_mode },
      reply_markup: extra.reply_markup ? extra.reply_markup : extra
    })
  }

  editMessageReplyMarkup (chatId, messageId, inlineMessageId, markup) {
    return this.callApi('editMessageReplyMarkup', {
      chat_id: chatId,
      message_id: messageId,
      inline_message_id: inlineMessageId,
      reply_markup: markup
    })
  }

  editMessageLiveLocation (latitude, longitude, chatId, messageId, inlineMessageId, markup) {
    return this.callApi('editMessageLiveLocation', {
      latitude,
      longitude,
      chat_id: chatId,
      message_id: messageId,
      inline_message_id: inlineMessageId,
      reply_markup: markup
    })
  }

  stopMessageLiveLocation (chatId, messageId, inlineMessageId, markup) {
    return this.callApi('stopMessageLiveLocation', {
      chat_id: chatId,
      message_id: messageId,
      inline_message_id: inlineMessageId,
      reply_markup: markup
    })
  }

  deleteMessage (chatId, messageId) {
    return this.callApi('deleteMessage', {
      chat_id: chatId,
      message_id: messageId
    })
  }

  setChatStickerSet (chatId, setName) {
    return this.callApi('setChatStickerSet', {
      chat_id: chatId,
      sticker_set_name: setName
    })
  }

  deleteChatStickerSet (chatId) {
    return this.callApi('deleteChatStickerSet', { chat_id: chatId })
  }

  getStickerSet (name) {
    return this.callApi('getStickerSet', { name })
  }

  uploadStickerFile (ownerId, stickerFile) {
    return this.callApi('uploadStickerFile', {
      user_id: ownerId,
      png_sticker: stickerFile
    })
  }

  createNewStickerSet (ownerId, name, title, stickerData) {
    return this.callApi('createNewStickerSet', {
      name,
      title,
      user_id: ownerId,
      ...stickerData
    })
  }

  addStickerToSet (ownerId, name, stickerData, isMasks) {
    return this.callApi('addStickerToSet', {
      name,
      user_id: ownerId,
      is_masks: isMasks,
      ...stickerData
    })
  }

  setStickerPositionInSet (sticker, position) {
    return this.callApi('setStickerPositionInSet', {
      sticker,
      position
    })
  }

  setStickerSetThumb (name, userId, thumb) {
    return this.callApi('setStickerSetThumb', { name, user_id: userId, thumb })
  }

  deleteStickerFromSet (sticker) {
    return this.callApi('deleteStickerFromSet', { sticker })
  }

  getMyCommands () {
    return this.callApi('getMyCommands')
  }

  setMyCommands (commands) {
    return this.callApi('setMyCommands', { commands })
  }

  setPassportDataErrors (userId, errors) {
    return this.callApi('setPassportDataErrors', {
      user_id: userId,
      errors: errors
    })
  }

  sendCopy (chatId, message, extra) {
    if (!message) {
      throw new Error('Message is required')
    }
    const type = Object.keys(replicators.copyMethods).find((type) => message[type])
    if (!type) {
      throw new Error('Unsupported message type')
    }
    const opts = {
      chat_id: chatId,
      ...replicators[type](message),
      ...extra
    }
    return this.callApi(replicators.copyMethods[type], opts)
  }
}

module.exports = GreenApiV0
