require("dotenv").config();
var fs = require("fs");
const axios = require('axios');
const moment = require('moment');

var keys = require("./keys.js");
var Spotify = require('node-spotify-api');

var searchType = process.argv[2];
var searchTerm = process.argv.slice(3).join("+");
var searchDisplay = process.argv.slice(3).join(" ");
var apiLibr = ["spotify-this-song", "concert-this", "movie-this", "do-what-it-says"];


if (searchType == undefined) {
  newErr("Missing a search term.");
} else {
  searchType = searchType.toLowerCase();
  validateInput();
}

function validateInput() {
  var ix = apiLibr.indexOf(searchType);
  if (ix > -1) {
    if (ix == 0) {
      spotifySearch(searchTerm);
    } else if (ix == 1) {
      concertSearch(searchTerm);
    } else if (ix == 2) {
      movieSearch(searchTerm);
    } else {
      doThis();
    }
  } else {
    newErr("Not a valid search type");
  }
}

function spotifySearch(term) {
  let rando = false;
  var spotify = new Spotify(keys.spotify);
  if (term == undefined || term == '') {
    rando = true;
    term = "the sign artist: ace of bass";
  }
  spotify.search({ type: 'track', query: term }, function (err, data) {
    if (err) {
      return console.log('Error occurred: ' + err);
    } else {
      var strB = '';
      if (rando) {
        strB += "NO SEARCH TERM PROVIDED\n";
      }
      strB += 'Data for "' + searchDisplay + '": \n';
     
      strB += "Artist: " + data.tracks.items[0].album.artists[0].name + "\n";
      strB += "Album: " + data.tracks.items[0].album.name + "\n";
      strB += "Open on Spotify: " + data.tracks.items[0].album.artists[0].external_urls.spotify + "\n";
      writeData(strB);
       console.log(strB)
    }
  });
}



function movieSearch(term) {
  let rando = false;
  let url = "http://www.omdbapi.com/?apikey=trilogy&t=";
  var strB = '';
  if (term == undefined || term == '') {
    rando = true;
    term = "Mr. Nobody";
  }
  url += term;
console.log(url);
  axios.get(url).then(function (response) {
    let data = response.data;
    if (rando) {
      strB += "NO SEARCH PROVIDED\n";
      strB += 'Title: "' + term + '": \n';
    }else{
    // data = data.Search[0];
    strB += 'Title: "' + searchDisplay + '": \n';
    }
    strB += "Released: " + data.Year + "\n";
    // strB+="IMDB Rating: " + data.Ratings[0].value + "\n";
    // strB+="Rotten Tomatoes: " + data.Ratings[1].value + "\n";
    strB += "Country Produced: " + data.Country + "\n\n";
    strB += "Plot: " + data.Plot + "\n\n";
    strB += "Actors: " + data.Actors + "\n";
    console.log(strB);
    writeData(strB);
  })
}



function concertSearch(term) {
  let rando = false;

  if (term == undefined || term == '') {
    rando = true;
    term = "Blink+182";
  }
  let url = "https://rest.bandsintown.com/artists/" + term + "/events?app_id=codingbootcamp";
  var strB = '';
  // console.log(url);

  axios.get(url).then(function (response) {
    let data = response.data[0];
    // console.log(data);
    // Name of the venue
    // Venue location
    // Date of the Event (use moment to format this as "MM/DD/YYYY")
    let dt = moment(data.datetime).format('MM/DD/YYYY');
    if (rando){
      strB+="NO SEARCH TERM PROVIDED\nShowing results for: " + term+"\n";
    } else{
    strB='Results for: "' + searchDisplay + '": \n';
    }
    strB += "Perfoming at: " + data.venue.name + '\n';
    strB += "Located at: " + data.venue.city +', ' + data.venue.country + '\n';
    strB += "Perfoming on: " + dt;
    console.log(strB);
    writeData(strB);

  })

}
function doThis(term) {
 fs.readFile("random.txt", "utf8", function(err, data) {
  if (err) {
    return console.log(err);
  }

  // Break down all the numbers inside
  data = data.trim();
  data = data.split(",");
  // console.log(data);
  if (data[0]!= undefined && data[1] != undefined){
    searchDisplay = data[1];
    spotifySearch(data[1]);
  } else {
    newErr("Something is wrong with the file yo");
  }
  var result = 0;

  });
}



function newErr(err) {
  throw new Error(err);
}

function writeData(dd) {
  fs.access("log.txt", fs.F_OK, (err) => {
    if (err) {
      fs.writeFile("log.txt",dd, function(err){
        if (err){
          newErr("issue writing file");
        }
      });
      return
    } else { 

    fs.appendFile("log.txt", dd, function (err) {
      if (err) {
        return console.log(err);
      }
    });
  }
  
  })
  
}