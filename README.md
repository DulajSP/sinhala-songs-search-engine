# Sinhala Song Search Engine

## Introduction

This repository contains the source code for a Sinhala Song Search Engine developed using [ElasticSearch](https://www.elastic.co/) as the search engine, and [NodeJS](https://nodejs.org/en/) as server.
The search engine contains about 1500 sinhala song lyrics in sinhala letters.

## Prerequisites

- ElasticSearch v7.8.0
- NodeJS v11.12.0

## How to Setup

1. Download Elasticsearch from https://www.elastic.co/downloads/
2. Start an ElasticSearch instance on port 9200
3. Run `npm install` to install dependencies.
4. Run `node elasticsearch.js` to create the index and index the songs
5. Run `npm start` to start the server.
6. `http://localhost:3001/search?text=search_text` GET endpoint return the search results for `search_text`.
