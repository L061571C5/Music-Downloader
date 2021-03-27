const fetch = require('node-fetch');
const chalk = require('chalk');
const { version } = require('../package.json')
const config = require(`../config.json`)
module.exports = {
    async run() {
        if (config['update-warn'] != true) {
            const data = await fetch(`https://raw.githubusercontent.com/L061571C5/Music-Downloader/main/package.json`)
            const json = await data.json()
            if (json.version != version) {
                console.log(chalk.redBright(`This version is out of date, please update when possible.`))
                console.log(chalk.greenBright(`You can remove this warning by setting update-warn to false in config.json.`))
            } else {
                console.log(chalk.greenBright(`This version is up to date.`))
            }
        }
    }
}