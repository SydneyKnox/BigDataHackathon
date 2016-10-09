var express = require('express');
var app = express();
var http = require('http');
var server = http.createServer(app);
var io = require('socket.io').listen(server);
var path = require('path');
var Twit = require('twit');
var Sentiment140 = require('sentiment140');

//var uiMask = require('angular-ui-mask');

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});

app.get('/main.js', function(req, res) {
  res.sendFile(__dirname + '/main.js');
});

io.on('connection', function(socket) {

  console.log("connected.");

  var T = new Twit({
    consumer_key: 'DPurB5ajhwzzzn3KDNysowwSC',
    consumer_secret: 'U4KSyam6mpvidy2RzH4fl7DRhtVT5hyqIARRglTH0t4spRgy4m',
    access_token: '155041176-JwBaxhPQh8rh22ZMjFgnPh6HGRbFx7Y0hY6UnfFq',
    access_token_secret: 'xPsIcfO6ABTNaWZNcU45BdHXhWvnVE8IqWyOSRA4DzPDW',
    timeout_ms: 60 * 1000, // optional HTTP request timeout to apply to all requests.
  });

  var sentiment140 = new Sentiment140({
    auth: 'rohit563@gmail.com'
  });

    process.on('unhandledRejection', (reason) => {
       // console.log('Reason: ' + reason);
    });

  var stream = null; 

  console.log("twitter setup done");

  socket.on('startStream', function(topic) {
    stream = null;
    console.log("stream started");
    var sanFrancisco = ['-180', '-90', '180', '90'];
    var tweetData = {};
    var tweetCount = 0;
    if (stream === null) {
      stream = T.stream('statuses/filter', {
        locations: sanFrancisco,
        track: topic
      });
      
      var singleTweets = []
      
      tweetData.data = singleTweets
      //console.log(tweetData)

      stream.on('tweet', function(tweet) {
        if (tweet.coordinates != null) {
          //console.log(tweet)
          if (tweetCount < 10) {          

            //console.log(tweet.coordinates.coordinates);
            console.log(tweet.text);

           // tweetData[tweetCount] = tweet.text;
           var singletweet = {
             "text": tweet.text,
             "id": tweet.coordinates.coordinates
           }
           //console.log(tweetData)
           tweetData.data.push(singletweet)
           
           tweetCount++;
            
          } else{
           
            sentiment140.sentiment(tweetData, function(error, result) {
            	//console.log(result[1].id);
            	//console.log(result[1].polarity);
            	
            	io.emit('bulkTweetInfo', result);
            //	console.log(error);
            });
  
          // console.log(jsonStuff);
            tweetCount = 0;
            tweetData.data = [];

          }
          
        }
          
      });

    }
  });


});

function makeJSON(myMap){
  var testArr = [];
  for (var key in myMap) {
    if(myMap.hasOwnProperty(key)){
      console.log(JSON.stringify(({text: myMap[key].toString(), id: key})));
    
      testArr.push(JSON.stringify(({text: myMap[key].toString(), id: key})))
    }
    
  }
  var finalStr = {"\"data\"": testArr}
  console.log(finalStr);

  return finalStr;

}

server.listen(process.env.PORT, function() {
  console.log('listening');
});
