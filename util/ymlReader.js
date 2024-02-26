const yaml = require('js-yaml');
const fs = require('fs');

let strings

function loadStringsYmlData() {
    try {
        const yamlFile = fs.readFileSync("strings.yml", 'utf8');
        strings = yaml.load(yamlFile);
    } catch (e) {
        console.log(e);
    }
}

function getStringsData() {
    if (!strings) {
        loadStringsYmlData();
    }
    return strings;
}


module.exports = { getStringsData };