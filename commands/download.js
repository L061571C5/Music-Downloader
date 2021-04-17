const chalk = require('chalk');
const fs = require('fs');
const ytdl = require('ytdl-core');
const ytpl = require("ytpl");
const config = require(`../config.json`)
const ytsr2 = require("youtube-sr").default;
var path = require("path");
const axios = require('axios');
const cheerio = require('cheerio');
const makeDir = require('make-dir');
const { exit } = require('process');
const request = require('request');
var snoowrap = require('snoowrap');
const r = new snoowrap({
    userAgent: 'put your user-agent string here',
    clientId: 'put your client id here',
    clientSecret: 'put your client secret here',
    refreshToken: 'put your refresh token here'
});
module.exports = {
    async run(args) {
        let type = 0;
        if (this.validYTPlaylistURL(args[0])) type = 1
        else if (this.validYTURL(args[0])) type = 2
        else if (this.validKHURL(args[0])) type = 3
        else if (args[0] == 'reddit') type = 4
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
                const a = playlistInfo.items;
                for (const track of a) {
                    ytdl(track.shortUrl, { "filter": 'audioonly' }).pipe(fs.createWriteStream(`${config['download-path']}/${(track.title).replace(/[<>:"/\\|?*\u0000-\u001F]/g, ``)}.mp3`));
                    console.log(chalk.whiteBright(`Downloaded ${track.title}.`))
                }
                break;
            case 2:
                const track = (await ytdl.getBasicInfo(link)).videoDetails
                ytdl(link, { "filter": 'audioonly' }).pipe(fs.createWriteStream(`${config['download-path']}/${(track.title).replace(/[<>:"/\\|?*\u0000-\u001F]/g, ``)}.mp3`));
                console.log(chalk.whiteBright(`Downloaded ${track.title}.`))
                break;
            case 3:
                //code by https://github.com/RasterCrow/khinsider-downloader
                await axios(args[0])
                    .then(async response => {
                        const html = response.data;
                        const $ = cheerio.load(html);
                        const album_name = $('#EchoTopic > h2').first()
                        const song_list = $('#songlist > tbody > tr');

                        console.log(album_name.text())
                        destinationFolder = `${config['download-path']}/` + album_name.text()
                        await (async () => {
                            let path = await makeDir(destinationFolder);
                            destinationFolder = path
                            console.log(destinationFolder)

                        })();

                        console.log('Saving songs in ' + destinationFolder)
                        console.log("Getting songs...")
                        if (song_list.length == 0) {
                            console.log("I couldn't find any songs...")
                            exit()
                        }
                        await asyncForEach(song_list, async function (value) {
                            let song_title = $(value).children('.clickable-row').eq(0).text();
                            let song_url_part1 = "https://downloads.khinsider.com";
                            let song_url_part2 = $(value).children('.clickable-row').eq(0).children('a').attr('href');
                            let song_url = song_url_part1 + song_url_part2
                            if (song_url_part2 != null) {
                                await axios(song_url)
                                    .then(async response => {
                                        let receivedBytes = 0
                                        let html2 = response.data;
                                        let $2 = cheerio.load(html2);
                                        let mp3_link = $2("#EchoTopic > p:nth-child(9) > a").attr('href');

                                        if (!fs.existsSync(destinationFolder + "\\" + song_title + ".mp3")) {
                                            console.log("Downloading " + song_title)
                                            let file = fs.createWriteStream(destinationFolder + "\\" + song_title + ".mp3");
                                            //console.log(mp3_link)
                                            /*
                                                https.get(mp3_link, async function(response) {
                                                response.pipe(file);
                                            });
                                            */
                                            let request_call = new Promise((resolve, reject) => {
                                                request.get(mp3_link)
                                                    .on('response', (response) => {
                                                        if (response.statusCode !== 200) {
                                                            return callback('Response status was ' + response.statusCode);
                                                        }

                                                        const totalBytes = response.headers['content-length'];
                                                    })
                                                    .on('data', (chunk) => {
                                                        receivedBytes += chunk.length;
                                                    })
                                                    .pipe(file)
                                                    .on('error', (err) => {
                                                        fs.unlink(filename);
                                                        return callback(err.message);
                                                    });

                                                file.on('finish', () => {
                                                    file.close();
                                                    resolve()
                                                });

                                                file.on('error', (err) => {
                                                    fs.unlink(filename);
                                                    return callback(err.message);
                                                });
                                            });
                                            let response_body = await request_call
                                        } else {
                                            console.log("Song : " + song_title + " was already downloaded")
                                        }


                                    })
                                    .catch(error => {
                                        console.log(error)
                                    })

                            } else {

                            }
                        });

                        console.log("Done")
                    })
                    .catch(error => {
                        console.log(error)
                    });
                async function asyncForEach(array, callback) {
                    for (let index = 0; index < array.length; index++) {
                        await callback(array[index], index, array);
                    }
                }
                break;
            case 4:

                break;
            default:
                const tracks = await ytsr2.search(args.join(` `), { limit: 30 }).catch(async function () {
                    console.log(chalk.redBright('there was a problem searching the video you requested!'));
                    return;
                });
                if (tracks.length < 1 || !tracks) {
                    console.log(chalk.redBright(`There was some trouble finding what you were looking for, please try again or be more specific.`));
                    return;
                }
                var o =0
                for (var s = 0; s < tracks.length; s++) {
                if (this.isGoodMusicVideoContent(tracks[s])) {
o = so = s;
s = tracks.length - 1;
                }
                if (s + 1 == tracks.length) {
                    ytdl(`https://www.youtube.com/watch?v=${tracks[o].id}`, { "filter": 'audioonly' }).pipe(fs.createWriteStream(`${config['download-path']}/${(tracks[0].title).replace(/[<>:"/\\|?*\u0000-\u001F]/g, ``)}.mp3`));
                console.log(chalk.whiteBright(`Downloaded ${tracks[o].title}.`))
                }
            }
                break;
        }
        console.log(chalk.greenBright(`Your downloads have finished in`, path.resolve(config['download-path'])))
    },
    validYTURL: (str) => !!str.match(/^(https?:\/\/)?((w){3}.)?youtu(be|.be)?(.com)?\/.+/),
    validYTPlaylistURL: (str) => !!str.match(/^(http(s)?:\/\/)?((w){3}.)?youtu(be|.be)?(.com)?\/playlist\?list=\w+/),
    validSPURL: (str) => !!str.match(/open.spotify.com\/.*/),
    validKHURL: (str) => !!str.includes('downloads.khinsider.com'),
    isGoodMusicVideoContent(videoSearchResultItem) {
        const contains = (string, content) => !!~(string || "").indexOf(content);
        return (contains(videoSearchResultItem.author ? videoSearchResultItem.author.name : undefined, "VEVO") || contains(videoSearchResultItem.author ? videoSearchResultItem.author.name.toLowerCase() : undefined, "official") || contains(videoSearchResultItem.title.toLowerCase(), "official") || !contains(videoSearchResultItem.title.toLowerCase(), "extended"));
    },
}