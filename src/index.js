var TorrentSearchApi = require('torrent-search-api');
TorrentSearchApi.enablePublicProviders();

var express = require("express");
var app = express();

app.get("/", requestHandler);
app.get("/search/:query/:category", requestHandler);

app.listen(5000, () => {
  console.log("Server running on port 5000");
 });

function requestHandler(req, res, next){
  if(checkRequest(req.params)){
    TorrentSearchApi.search(req.params.query, req.params.category, 20).then(torrents => {
        res.json(torrents);
        res.end();
      }).catch(e => {
        res.statusCode = 500;
        res.end();
      });
    }
    else{
      res.statusCode = 404;
      res.end();
    }
};

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