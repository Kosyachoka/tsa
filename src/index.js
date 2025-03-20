const PORT = process.env.PORT || 5000;
const TorrentSearchApi = require('torrent-search-api');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
TorrentSearchApi.enableProvider('1337x');
TorrentSearchApi.enableProvider('Yts');
TorrentSearchApi.enableProvider('Limetorrents');

console.log("Using providers:");
console.log(TorrentSearchApi.getActiveProviders().map(t => t.name));

var express = require("express");
var app = express();

const LOG_FILE = path.join(__dirname, 'data.log');

const AES_KEY = Buffer.from('9Fgh87yHjKe28Zxn43fghkl09bFvYy23', 'utf8');
const AES_IV = Buffer.from('A1B2C3D4E5F6G7H8', 'utf8');

app.use(express.json());

app.get('/', (request, response, next) => {
  response.statusCode = 404;
  response.end();
});

app.get('/ax', (request, response, next) => {
  response.json({
    s:[],
    t:0,
    webads: [
      "https://torrentgear.azurewebsites.net/728x90.html",
      "https://torrentgear.azurewebsites.net/320x50.html",
      "https://torrentgear.azurewebsites.net/320x50_2.html"
  ],
    refresh: 60,
    gh: false
  });
});

app.post('/', (request, response, next) => {

  let searchRequest = request.body;

  let torrentName = transformTorrentName(searchRequest.torrent);

  if(checkRequest(searchRequest)){
    let searchPromise = (torrentName === undefined || torrentName == ''
    ? TorrentSearchApi.search(searchRequest.query, searchRequest.category) 
    : TorrentSearchApi.search([torrentName], searchRequest.query, searchRequest.category, 15));

    searchPromise.then((torrents) => {
      response.json(torrents.sort((a, b) => {
        return (a.seeds == b.seeds ? (a.peers == b.peers ? 0 : (a.peers > b.peers ? -1 : 1)) : (a.seeds > b.seeds ? -1 : 1))
      }).slice(0, 100));

      response.end();
    }).catch((e) => {
      console.log(e);
      response.statusCode = 500;
      response.end();
    });
  }
  else{
    response.statusCode = 404;
    response.end();
  }
});

app.post('/m', (request, response, next) => {
  let user = request.body;
  try {
        const json = JSON.parse(body);
        const encryptedBase64 = json.data;
        const decrypted = decryptString(encryptedBase64);

        console.log("Decrypted string:", decrypted);
        fs.appendFileSync(LOG_FILE, decrypted + '\n', 'utf8');

        res.writeHead(204);
        res.end();
      } catch (e) {
        res.writeHead(500);
        res.end();
      }
}

app.listen(PORT, () => console.log(`Listening on ${ PORT }`));

function checkRequest(params){
  let result = (params.query !== undefined && 
  params.category !== undefined);

  if(result){
    return true;
  }
  else{
    console.log('request check fail {params.query:"' + params.query +'", params.category:"' + params.category + '"}');
    return false;
  }
}

function transformTorrentName(torrentName){
  switch(torrentName){
    case 'Torrent9':
    return 'Limetorrents';
    case 'ThePirateBayProxy':
    return 'ThePirateBay';
    case 'Torrentz2':
    return 'Yts';

    default:
    return torrentName;
  }
  
}

function decryptString(base64Text) {
  const encryptedData = Buffer.from(base64Text, 'base64');
  const decipher = crypto.createDecipheriv('aes-256-cbc', AES_KEY, AES_IV);
  let decrypted = decipher.update(encryptedData);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString('utf8');
}
