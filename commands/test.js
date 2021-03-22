const fetch = require('node-fetch');
const { version } = require('../package.json')
module.exports = {
    async run() {
        const data = await fetch(`https://raw.githubusercontent.com/L061571C5/Music-Downloader/main/package.json`)
        const json = await data.json()
        if (json.version !== version) return console.log(`This version is out of date, please update.`)
        console.log(`This version ${version}, is the latest.`)
    }
}