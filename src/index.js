var server_port = process.env.OPENSHIFT_NODEJS_PORT || 8080
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1'

const TorrentSearchApi = require('torrent-search-api');
TorrentSearchApi.loadProvider(ThePirateBayProvider());
//TorrentSearchApi.enablePublicProviders();
//TorrentSearchApi.enableProvider('Torrent9');
TorrentSearchApi.enableProvider('1337x');
TorrentSearchApi.enableProvider('Torrentz2');
TorrentSearchApi.enableProvider('ThePirateBayProxy');
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
    s:[
      
    ],
    t:30000});
});

app.post('/', (request, response, next) => {

  let searchRequest = request.body;

  let torrentName = transformTorrentName(searchRequest.torrent);

  if(checkRequest(searchRequest)){
    let searchPromise = (torrentName === undefined || torrentName == ''
    ? TorrentSearchApi.search(searchRequest.query, searchRequest.category, 15) 
    : TorrentSearchApi.search([torrentName], searchRequest.query, searchRequest.category, 15));

    searchPromise.then((torrents) => {
      console.log('torrent:' + torrentName + '| query:' + searchRequest.query + '| results:' + torrents.length);
      response.json(torrents);
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

app.listen(server_port, server_ip_address, () => console.log("Listening on " + server_ip_address + ", port " + server_port));

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

    default:
    return torrentName;
  }
}

function ThePirateBayProvider(){
  return {
    "name": "ThePirateBayProxy",
    "baseUrl": "https://pirateproxy.gdn",
    "searchUrl": "/search/{query}/0/7/{cat}",
    "categories": {
       "All": "0",
       "Audio": "100",
       "Video": "200",
       "Applications": "300",
       "Games": "400",
       "Porn": "500",
       "Other": "600",
       "Top100": "url:/top/all"
    },
    "defaultCategory": "All",
    "resultsPerPageCount": 30,
    "itemsSelector": "#searchResult tr",
    "itemSelectors": {
       "title": "a.detLink@text",
       "time": "font.detDesc@text | match:\"Uploaded\\s(.+?),\"",
       "seeds": "td:nth-child(3) | int",
       "peers": "td:nth-child(4) | int",
       "size": "font.detDesc@text | match:\"Size\\s(.+?),\"",
       "magnet": "a[title=\"Download this torrent using magnet\"]@href",
       "desc": "div.detName a@href"
    },
    "paginateSelector": "a:has(img[alt=\"Next\"])@href",
    "torrentDetailsSelector": "div.nfo > pre@text"
  }
}