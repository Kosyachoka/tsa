const PORT = process.env.PORT || 5000;
const TorrentSearchApi = require('torrent-search-api');
TorrentSearchApi.loadProvider(ThePirateBayProvider());
//TorrentSearchApi.enablePublicProviders();
TorrentSearchApi.enableProvider('Torrent9');
TorrentSearchApi.enableProvider('1337x');
TorrentSearchApi.enableProvider('Torrentz2');
TorrentSearchApi.enableProvider('ThePirateBayProxy');

console.log("Using providers:");
console.log(TorrentSearchApi.getActiveProviders().map(t => t.name));

var express = require("express");
var app = express();

app.use(express.json());

app.get('/', (request, response, next) => {
  response.statusCode = 404;
  response.end();
});

app.post('/', (request, response, next) => {

  let searchRequest = request.body;

  if(checkRequest(searchRequest)){
    let searchPromise = (searchRequest.torrent === undefined || searchRequest.torrent == ''
    ? TorrentSearchApi.search(searchRequest.query, searchRequest.category, 10) 
    : TorrentSearchApi.search([searchRequest.torrent], searchRequest.query, searchRequest.category, 10));

    searchPromise.then((torrents) => {
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