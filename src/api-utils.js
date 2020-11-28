class ApiUtils {
    static keyEmulation(extra, text) {
        let textWithKeys = text
        if (extra && extra.reply_markup && extra.reply_markup.keyboard) {
            const {reply_markup : { keyboard }} = extra
            keyboard[0].forEach(key => {
                textWithKeys = textWithKeys ? textWithKeys + '\n' + key : key
            })
        }
        return textWithKeys
    }
}

module.exports = ApiUtils
