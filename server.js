//require the Elasticsearch librray
const elasticsearch = require("elasticsearch");
// instantiate an elasticsearch client
const client = new elasticsearch.Client({
  hosts: ["http://localhost:9200"],
});
//require Express
const express = require("express");
// instanciate an instance of express and hold the value in a constant called app
const app = express();
//require the body-parser library. will be used for parsing body requests
const bodyParser = require("body-parser");

// ping the client to be sure Elasticsearch is up
client.ping(
  {
    requestTimeout: 30000,
  },
  function (error) {
    if (error) {
      console.error("elasticsearch cluster is down!");
    } else {
      console.log("Everything is ok");
    }
  }
);

// use the bodyparser as a middleware
app.use(bodyParser.json());
// set port for the app to listen on
app.set("port", process.env.PORT || 3001);

// enable CORS
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "PUT, GET, POST, DELETE, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

// the /search route return elastic search results
app.get("/search", function (req, res) {
  var size = 0;
  var isGood = false;
  var isSinger = false;
  var isSong = false;

  var wordsList = req.query["text"].split(" ");
  var newWordsList = [];
  wordsList.forEach((element) => {
    if (Boolean(parseInt(element)) && parseInt(element) > 0) {
      size = parseInt(element);
    } else if (element.includes("හොඳ")) {
      isGood = true;
    } else if (element.includes("ගායක")) {
      isSinger = true;
    } else if (element.includes("සින්දු")) {
      isSong = true;
    } else if (element.length > 0) {
      newWordsList.push(element);
    }
  });

  var searchText = "";

  newWordsList.forEach((element) => {
    searchText += element + " ";
  });

  searchText = searchText.trim();

  let body = {
    size: 100,
    from: 0,
    query: {
      bool: {
        should: [
          {
            match_phrase_prefix: {
              lyrics: {
                query: searchText,
                slop: 3,
                max_expansions: 10,
              },
            },
          },
          {
            multi_match: {
              query: searchText,
              fields: ["lyrics"],
            },
          },
          {
            multi_match: {
              query: searchText,
              fields: ["artist_name_si^3", "artist_name_en^3"],
            },
          },
          {
            match_phrase_prefix: {
              artist_name_si: {
                query: searchText,
                slop: 3,
                max_expansions: 10,
              },
            },
          },
          {
            match_phrase_prefix: {
              track_name_si: {
                query: searchText,
                slop: 3,
                max_expansions: 10,
              },
            },
          },
          {
            match_phrase_prefix: {
              album_name_si: {
                query: searchText,
                slop: 2,
                max_expansions: 10,
              },
            },
          },
          {
            match_phrase_prefix: {
              album_name_en: {
                query: searchText,
                slop: 2,
                max_expansions: 10,
              },
            },
          },
        ],
        minimum_should_match: 1,
      },
    },
  };
  console.log(searchText, newWordsList);

  if (newWordsList.length == 0) {
    body.query = {
      match_all: {},
    };
  }

  if (isGood) {
    if (size > 0) {
      body.size = size;
    }
    if (isSinger) {
      body.sort = [{ artist_rating: "desc", _score: "desc" }];
    } else {
      body.sort = [{ track_rating: "desc", _score: "desc" }];
    }
  }

  // perform the actual search passing in the index, the search query and the type
  client
    .search({ index: "sinhala_songs", body: body })
    .then((results) => {
      res.send(results.hits.hits);
    })
    .catch((err) => {
      console.log(err);
      res.send([]);
    });
});
// listen on the specified port
app.listen(app.get("port"), function () {
  console.log("Express server listening on port " + app.get("port"));
});
