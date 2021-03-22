const chalk = require('chalk');
var figlet = require('figlet');
let dir;
var args = process.argv.slice(2);
switch (args[0]) {
    case 'help':
        helpMenu()
        break;
    case 'test':
        require(`./commands/test`).run()
        break;
    default:
        console.log(`That is not a valid command`)
        console.log(`Use 'node index.js help' to show list of available commands`)
        break;
}
function helpMenu() {
    console.log(chalk.greenBright(figlet.textSync(`redaolnwoD  cisuM`, 'Ivrit')))
    console.log(`Commands:`)
    console.log(chalk.gray(`help: Shows this menu`))
    console.log(chalk.gray(`test: Tests for stuff...`))
    console.log(chalk.gray(`dl: Downloads music from supported sites...`))
    console.log(chalk.greenBright(`Usage:`))
    console.log(chalk.gray(`node index.js dl (url or query) [options]`))
}