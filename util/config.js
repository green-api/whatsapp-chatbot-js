const axios = require('axios');
const yaml = require('js-yaml');

let configData
let i = 0

async function loadConfigData() {
    try {
        const response = await axios.get('http://sw-prod-gateway.ru-central1.internal:8081/sw-chatbot-js-7103.yml');
        i++
        configData = await yaml.load(response.data)
        console.log("config data has load successful")
        console.log(configData)
    } catch (e) {
        console.error("error while getting config data: " + e);
    }
}

async function getConfigData() {
    if (!configData) {
        await loadConfigData()
    }
    console.log("get config " + i)
    return configData;
}

module.exports = {getConfigData, configData}