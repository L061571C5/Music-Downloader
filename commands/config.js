const config = require(`../config.json`);
const chalk = require('chalk');
const fs = require('fs');
module.exports = {
    async run(args) {
        if (args.length == 0) {
            console.log(chalk.redBright(`Settings:`))
            for (const setting in config) {
                console.log(chalk.greenBright(`${setting}: ${config[setting]}`))
            }
            console.log(chalk.redBright(`To change a setting run config (setting) (value)`))
        } else {
            if (args.length < 2 || args.length > 2) return console.log(chalk.redBright(`You didn't provide a setting or value.`))
            const setting = args[0]
            const value = args[1]
            let content = JSON.parse(fs.readFileSync(`./config.json`, 'utf8'));
            if (content[setting] == undefined) return console.log(chalk.redBright(`That is not a valid setting.`))
            content[setting] = value
            fs.writeFileSync(`./config.json`, JSON.stringify(content, null, 2));
            console.log(chalk.greenBright(`Successfully changed ${setting} to ${value}`))
        }
    }
}