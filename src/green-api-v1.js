const replicators = require('./core/replicators')
const ApiClient = require('./core/network/client')
const WhatsAppApi = require('@green-api/v1-whatsapp-api-client')
const ApiUtils = require('./api-utils')

class GreenApiV1 extends ApiClient {

  constructor(token, options, webhookResponse) {
    super(token, options, webhookResponse)

    this.api = new WhatsAppApi(token)
  }
  
  async getMe () {
    return new Promise((resolve) => { 
      resolve({
        is_bot: true,
        username: 'whatsapp_v1',
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

    this.noty = await this.api.notifications.receiveNotification()

    if (!this.noty) {
      return []
    }
    await this.api.notifications.deleteNotification(this.noty.receipt)

    const inboundMessage = this.noty.notifications[0]
    const text = (inboundMessage.messages[0].type == 'text' ? inboundMessage.messages[0].text.body !== null ? inboundMessage.messages[0].text.body : '' : '')
    
    const messageUpdate = {
      update_id: 1111,
      message: {
          chat: {
              id: inboundMessage.contacts[0].wa_id,
              type: 'channel',
          },
          from: {
              first_name: inboundMessage.contacts[0].profile.name,
              last_name: '',
              id: 0,
              is_bot: false,
          },
          message_id: inboundMessage.messages[0].id,
          date: inboundMessage.messages[0].timestamp,
          caption_entities: [
              {
                  type: 'bot_command',
                  offset: 0,
                  length: text.length,
              }
          ]
      }

    }
    
    const document = (inboundMessage.messages[0].type == 'document' ? inboundMessage.messages[0].document : '') 
    const image = (inboundMessage.messages[0].type == 'image' ? inboundMessage.messages[0].image : '') 
    const voice = (inboundMessage.messages[0].type == 'voice' ? inboundMessage.messages[0].voice : '') 
    const contacts = (inboundMessage.messages[0].type == 'contacts' ? inboundMessage.messages[0].contacts : '') 
    const location = (inboundMessage.messages[0].type == 'voice' ? inboundMessage.messages[0].location : '') 

    if (text)
      messageUpdate.message.text = text
      
    if (document) {
      messageUpdate.message.document = {
        file_id: document.id,
        file_name: document.filename,
        mime_type: document.mime_type,
      }
    }

    if (image) {
      messageUpdate.message.photo = [
        {
          file_id: image.id,
          //width: 
          //height: number;
          //file_size?: number;
        }
      ]
    }

    if (voice) {
      messageUpdate.message.voice = {
        file_id: voice.id,
        //duration: number;
        mime_type: voice.mime_type,
        //file_size?: number;
      }
    }

    if (contacts) {
      messageUpdate.message.contact = {
      //phone_number: contacts;
      //first_name: string;
      //last_name?: string;
        user_id: contacts.vcard,
      }
    }

    if (location) {
      messageUpdate.message.location = {
        longitude: location.link,
      //latitude: number;
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
    return this.api.messages.sendTextMessage(chatId, textWithKeys)
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
    return this.callApi('sendContact', { chat_id: chatId, phone_number: phoneNumber, first_name: firstName, ...extra })
  }

  sendPhoto (phoneNumber, photo, {caption}) {
    return this.api.messages.sendImageByLink(phoneNumber, photo, caption)
  }

  sendDice (chatId, extra) {
    return this.callApi('sendDice', { chat_id: chatId, ...extra })
  }

  sendDocument (phoneNumber, document, extra) {
    return this.api.messages.sendDocumentByLink(phoneNumber, document)
  }

  sendAudio (phoneNumber, audio, extra) {
    return this.api.messages.sendAudioByLink(phoneNumber, audio)
  }

  sendSticker (chatId, sticker, extra) {
    return this.callApi('sendSticker', { chat_id: chatId, sticker, ...extra })
  }

  sendVideo (phoneNumber, video, extra) {
    return this.api.messages.sendVideoByLink(phoneNumber, video)
  }

  sendAnimation (chatId, animation, extra) {
    return this.callApi('sendAnimation', { chat_id: chatId, animation, ...extra })
  }

  sendVideoNote (chatId, videoNote, extra) {
    return this.callApi('sendVideoNote', { chat_id: chatId, video_note: videoNote, ...extra })
  }

  sendVoice (chatId, voice, extra) {
    return this.callApi('sendVoice', { chat_id: chatId, voice, ...extra })
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

module.exports = GreenApiV1
