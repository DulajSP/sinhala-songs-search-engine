//require the Elasticsearch librray
const elasticsearch = require("elasticsearch");

//require the data file
const songs = require("./data/sinhala_songs.json");

// instantiate an Elasticsearch client
const client = new elasticsearch.Client({
  hosts: ["http://localhost:9200"],
});
// ping the client to be sure Elasticsearch is up
client.ping(
  {
    requestTimeout: 30000,
  },
  function (error) {
    if (error) {
      console.error("Elasticsearch cluster is down!");
    } else {
      console.log("Everything is ok");
    }
  }
);

// create a new index called sinhala_songs. If the index has already been created, this function fails safely
client.indices.create(
  {
    index: "sinhala_songs",
    body: {
      settings: {
        analysis: {
          filter: {
            my_edge_ngram: {
              type: "edge_ngram",
              min_gram: 1,
              max_gram: 20,
            },
          },
          analyzer: {
            my_analyzer: {
              tokenizer: "standard",
              filter: "my_edge_ngram",
            },
          },
        },
      },
      mappings: {
        properties: {
          album_name_si: {
            type: "text",
            analyzer: "my_analyzer",
          },
          album_name_en: {
            type: "text",
            analyzer: "my_analyzer",
          },
          artist_name_si: {
            type: "text",
            analyzer: "my_analyzer",
          },
          artist_name_en: {
            type: "text",
            analyzer: "my_analyzer",
          },
          artist_rating: {
            type: "long",
            analyzer: "my_analyzer",
          },
          lyrics: {
            type: "text",
            analyzer: "my_analyzer",
          },
          track_name_si: {
            type: "text",
            analyzer: "my_analyzer",
          },
          track_rating: {
            type: "long",
            analyzer: "my_analyzer",
          },
          track_id: {
            type: "text",
            analyzer: "my_analyzer",
          },
        },
      },
    },
  },
  function (error, response, status) {
    if (error) {
      console.log(error);
    } else {
      console.log("created a new index", response);
    }
  }
);

var bulk = [];

songs.forEach((song) => {
  bulk.push({
    index: {
      _index: "sinhala_songs",
    },
  });
  bulk.push({
    album_name_si: song.album_name_si,
    artist_name_si: song.artist_name_si,
    artist_name_en: song.artist_name_en,
    album_name_en: song.album_name_en,
    artist_rating: parseInt(song.artist_rating, 10),
    lyrics: song.lyrics,
    track_name_si: song.track_name_si,
    track_rating: parseInt(song.track_rating, 10),
    track_id: song.track_id,
  });
});

client.bulk({ body: bulk }, function (err, response) {
  console.log(response);

  if (err) {
    console.log("Failed Bulk operation".red, err);
  } else {
    console.log("Successfully imported %s".green, songs.length);
  }
});
