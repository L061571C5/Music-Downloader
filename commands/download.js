const chalk = require('chalk');
const fs = require('fs');
const ytdl = require('ytdl-core');
const ytpl = require("ytpl");
const config = require(`../config.json`)
var path = require("path");
module.exports = {
    async run(args) {
        let type;
        if (this.validYTPlaylistURL(args[0])) type = 1
        else if (this.validYTURL(args[0])) type = 2
        if (this.validYTURL(args[0]) == false && args.length <= 2) {
            console.log(chalk.greenBright(`Downloader Usage:`))
            return console.log(chalk.whiteBright(`node index.js dl (url or query) [options]`))
        }
        const link = args[0]
        if (!fs.existsSync(config['download-path'])) {
            try {
                fs.mkdirSync(config['download-path'])
            } catch (err) {
                return console.log(chalk.redBright(`The download path is nonexistent.`));
            }
        }
        switch (type) {
            case 1:
                try {
                    var playlistInfo = await ytpl(args[0], { limit: Infinity });
                } catch (err) {
                    if (err.message === "This playlist is private.") console.log(chalk.redBright("The playlist is private."));
                    else {
                        console.log(err);
                        console.log(chalk.redBright("There was an error trying to fetch your playlist."));
                    }
                    return
                }
                const tracks = playlistInfo.items;
                for (const track of tracks) {
                    ytdl(track.shortUrl, { "filter": 'audioonly' }).pipe(fs.createWriteStream(`${config['download-path']}/${(track.title).replace(/[<>:"/\\|?*\u0000-\u001F]/g, ``)}.mp3`));
                    console.log(chalk.whiteBright(`Downloaded ${track.title}.`))
                }
                break;
            case 2:
                const track = (await ytdl.getBasicInfo(link)).videoDetails
                ytdl(link, { "filter": 'audioonly' }).pipe(fs.createWriteStream(`${config['download-path']}/${track.title}.mp3`));
                console.log(chalk.whiteBright(`Downloaded ${track.title}.`))
                break;
            default:
                console.log(`Query goes here at somepoint...`)
                break;
        }
        console.log(chalk.greenBright(`Your downloads have finished in`, path.resolve(config['download-path'])))
    },
    validYTURL: (str) => !!str.match(/^(https?:\/\/)?((w){3}.)?youtu(be|.be)?(.com)?\/.+/),
    validYTPlaylistURL: (str) => !!str.match(/^(http(s)?:\/\/)?((w){3}.)?youtu(be|.be)?(.com)?\/playlist\?list=\w+/),
}