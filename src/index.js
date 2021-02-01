const PORT = process.env.PORT || 5000;
const TorrentSearchApi = require('torrent-search-api');
TorrentSearchApi.enableProvider('1337x');
TorrentSearchApi.enableProvider('Yts');
TorrentSearchApi.enableProvider('ThePirateBay');
TorrentSearchApi.enableProvider('Rarbg');

console.log("Using providers:");
console.log(TorrentSearchApi.getActiveProviders().map(t => t.name));

var express = require("express");
var app = express();

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
    ? TorrentSearchApi.search(searchRequest.query, searchRequest.category, 15) 
    : TorrentSearchApi.search([torrentName], searchRequest.query, searchRequest.category, 15));

    searchPromise.then((torrents) => {
      response.json(torrents.sort((a, b) => {
        return (a.seeds == b.seeds ? (a.peers == b.peers ? 0 : (a.peers > b.peers ? -1 : 1)) : (a.seeds > b.seeds ? -1 : 1))
      }));

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
    return 'Rarbg';
    case 'ThePirateBayProxy':
    return 'ThePirateBay';
    case 'Torrentz2':
    return 'Yts';

    default:
    return torrentName;
  }
}