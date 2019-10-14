
const http = require('http');
const url = require('url');
const query = require('querystring');
const htmlHandler = require('./htmlResponses.js');
const jsonHandler = require('./jsonResponses.js');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

const urlStruct = {
  GET: {
    '/': htmlHandler.getIndex,
    '/game': htmlHandler.getGame,
    '/login': htmlHandler.getLogin,
    '/user': htmlHandler.getUser,
    '/style/main.css': htmlHandler.getCSS,
    '/style/game.css': htmlHandler.getGameCSS,
    '/style/user.css': htmlHandler.getUserCSS,
    '/js/syndicates.js': htmlHandler.getSyndicatedScript,
    '/getUsers': jsonHandler.getUsers,
    '/getUser': jsonHandler.getUser,
    '/getGameInfo': jsonHandler.getGameInfo,
    '/getGameCovers': jsonHandler.getGameCovers,
    '/suggestions': jsonHandler.getSuggestions,
    notReal: jsonHandler.notReal,
  },
  HEAD: {
    '/getUsers': jsonHandler.getUsers,
    '/getUser': jsonHandler.getUser,
    '/getGameInfo': jsonHandler.getGameInfo,
    '/getGameCovers': jsonHandler.getGameCovers,
    '/suggestions': jsonHandler.getSuggestions,
    notReal: jsonHandler.notReal,
  },
};

/* taken from body-parse example code */
const handlePost = (req, res, parsedUrl) => {
  // uploads come in as a byte stream that we need
  // to reassemble once it's all arrived
  const body = [];

  // if the upload stream errors out, just throw a
  // a bad request and send it back
  req.on('error', (err) => {
    console.dir(err);
    res.statusCode = 400;
    res.end();
  });

  // on 'data' is for each byte of data that comes in
  // from the upload. We will add it to our byte array.
  req.on('data', (chunk) => {
    body.push(chunk);
  });

  // on end of upload stream.
  req.on('end', () => {
    // combine our byte array (using Buffer.concat)
    // and convert it to a string value (in this instance)
    const bodyString = Buffer.concat(body).toString();
    // since we are getting x-www-form-urlencoded data
    // the format will be the same as querystrings
    // Parse the string into an object by field name
    const bodyParams = query.parse(bodyString);

    // pass to a post function
    switch (parsedUrl.pathname) {
      case '/addUser':
        jsonHandler.addUser(req, res, bodyParams);
        break;
      case '/addGame':
        jsonHandler.addGame(req, res, bodyParams);
        break;
      case '/removeGame':
        jsonHandler.removeGame(req, res, bodyParams);
        break;
      default:
        break;
    }
  });
};


const onRequest = (req, res) => {
  const parsedUrl = url.parse(req.url);

  const args = query.parse(parsedUrl.query);

  // add accept-type to args list bc easier
  Object.defineProperty(args, 'type', {
    value: req.headers.accept.split(',')[0],
    writable: false,
  });

  if (req.method === 'POST') {
    handlePost(req, res, parsedUrl);
  } else if (urlStruct[req.method][parsedUrl.pathname]) {
    urlStruct[req.method][parsedUrl.pathname](req, res, args);
  } else {
    urlStruct[req.method].notReal(req, res, args);
  }
};

http.createServer(onRequest).listen(port);

console.log(`Listening on localhost:${port}`);
