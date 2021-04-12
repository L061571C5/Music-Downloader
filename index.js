const chalk = require('chalk');
var figlet = require('figlet');
let args = process.argv.slice(2);
require('dotenv').config()
require(`./commands/test`).run()
switch (args[0]) {
    case 'help':
        helpMenu()
        break;
    case 'test':
        require(`./commands/test`).run()
        break;
    case 'dl':
        args = process.argv.slice(3)
        require(`./commands/download`).run(args)
        break;
    case 'config':
        args = process.argv.slice(3)
        require(`./commands/config`).run(args)
        break;
    default:
        console.log(chalk.redBright(`That is not a valid command`))
        console.log(chalk.whiteBright(`Use 'node index.js help' to show list of available commands`))
        break;
}
function helpMenu() {
    console.log(chalk.greenBright(figlet.textSync(`redaolnwoD  cisuM`, 'Ivrit')))
    console.log(chalk.blueBright(`Commands:`))
    console.log(chalk.whiteBright(`help: Shows this menu`))
    console.log(chalk.whiteBright(`test: Tests for stuff...`))
    console.log(chalk.whiteBright(`dl: Downloads music from supported sites...`))
    console.log(chalk.whiteBright(`config: Configure the downloader's settings`))
    console.log(chalk.greenBright(`Downloader Usage:`))
    console.log(chalk.whiteBright(`node index.js dl (url or query)`))
}