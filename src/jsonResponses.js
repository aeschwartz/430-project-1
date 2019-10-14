const https = require('https');

const users = {}; // to be added in

const games = {};

const respond = (req, res, status, object) => {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  if (req.method !== 'HEAD' || status !== 204) res.write(JSON.stringify(object));
  res.end();
};

const getUsers = (req, res) => respond(req, res, 200, { users });

const getUser = (req, res, query) => {
  // check for name param
  if (!query.name) {
    return respond(req, res, 400, {
      message: 'Username is required.',
      id: 'missingParams',
    });
  }

  // check to see if user exists
  if (!users[query.name]) {
    return respond(req, res, 404, {
      message: 'Username not found.',
      id: 'notReal',
    });
  }

  // else return
  return respond(req, res, 200, users[query.name]);
};

const addUser = (req, res, query) => {
  const responseJSON = {
    message: 'Username is required.',
  };
  // basically on error ->
  // check to make sure we have all fields
  // We might want more validation than just checking if they exist
  // This could easily be abused with invalid types (such as booleans, numbers, etc)
  // If either are missing, send back an error message as a 400 badRequest
  if (!query.name) {
    responseJSON.id = 'missingParams';
    return respond(req, res, 400, responseJSON);
  }

  // if no error, set default response to 201
  const responseCode = 201;

  // if the name is already a key, don't add them again
  if (users[query.name]) {
    responseJSON.id = 'alreadyExists';
    responseJSON.message = 'Username already exists.';
    return respond(req, res, 409, responseJSON);
  }

  // copy in data regardless
  users[query.name] = {
    name: query.name,
    games: {},
  };
  // if response is created, then set our created message
  // and sent response with a message
  if (responseCode === 201) {
    responseJSON.message = 'Created Successfully';
  }
  // User cannot be updated from addUser method, 204 only returned in addGame
  return respond(req, res, responseCode, responseJSON);
};

const addGame = (req, res, query) => {
  const responseJSON = {
    message: 'Username, game name, game ID, and status are required.',
  };
  // basically on error ->
  // check to make sure we have all fields
  // We might want more validation than just checking if they exist
  // This could easily be abused with invalid types (such as booleans, numbers, etc)
  // If either are missing, send back an error message as a 400 badRequest
  if (!query.name || !query.game || !query.id || !query.status) {
    responseJSON.id = 'missingParams';
    return respond(req, res, 400, responseJSON);
  }

  // default here is 204, because all we are doing is updating the user object
  const responseCode = 204;

  // if the name is already a key, don't add them again
  if (!users[query.name]) {
    responseJSON.id = 'badUsername';
    responseJSON.message = 'Username provided does not correspond to valid user.';
    return respond(req, res, 400, responseJSON);
  }

  // create game object
  const gameObj = {
    name: query.game,
    id: query.id,
    status: query.status,
  };

  // copy in data to users
  users[query.name].games[query.game] = gameObj;

  // now for adding to games object!
  // create game in games object if it doesn't exist
  if (!games[query.game]) games[query.game] = {};

  // add user to game list
  games[query.game][query.name] = users[query.name];


  // if nothing else goes wrong, and the objects are all updated, send 204 back
  return respond(req, res, responseCode);
};

const notReal = (req, res) => {
  respond(req, res, 404, {
    message: 'The page you are looking for was not found.',
    id: 'notFound',
  });
};

const removeGame = (req, res, query) => {
  const responseJSON = {
    message: 'Username and game name are required.',
  };
  // basically on error ->
  // check to make sure we have all fields
  // We might want more validation than just checking if they exist
  // This could easily be abused with invalid types (such as booleans, numbers, etc)
  // If either are missing, send back an error message as a 400 badRequest
  if (!query.name || !query.game) {
    responseJSON.id = 'missingParams';
    return respond(req, res, 400, responseJSON);
  }

  // default here is 204, because all we are doing is updating the user object
  const responseCode = 204;

  // if the name is already a key, don't add them again
  if (!users[query.name]) {
    responseJSON.id = 'badUsername';
    responseJSON.message = 'Username provided does not correspond to valid user.';
    return respond(req, res, 400, responseJSON);
  }

  // remove game property from user
  delete users[query.name].games[query.game];

  // remove user from game on games object
  delete games[query.game][query.name];


  // if nothing else goes wrong, and the objects are all updated, send 204 back
  return respond(req, res, responseCode);
};


// API Stuff
const getSuggestions = (req, res, query) => {
  if (!query.q) {
    respond(req, res, 400, {
      id: 'missingParams',
      message: 'Requires a search query.',
    });
  }
  const data = `fields name, cover.image_id; search "${query.q}"; limit 3;`;
  const options = {
    hostname: 'api-v3.igdb.com',
    path: '/games',
    port: 443,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Key': '119f8b04a08b90a409cb283bad80d946',
    },
  };

  // let jsonString = '';
  // let statusCode = 200;
  res.writeHead(200, { 'Content-Type': 'application/json' });
  const apiReq = https.request(options, (apiRes) => {
    res.writeHead(apiRes.statusCode, { 'Content-Type': 'application/json' });
    apiRes.on('data', (resData) => {
      res.write(resData);
    });
  });

  apiReq.on('error', (e) => {
    console.error(e);
  });

  apiReq.on('close', () => {
    res.end();
  });

  apiReq.write(data);
  apiReq.end();
};

const getGameInfo = (req, res, query) => {
  if (!query.id) {
    respond(req, res, 400, {
      id: 'missingParams',
      message: 'Requires a game ID.',
    });
  }
  const data = `fields name, summary, age_ratings.category, age_ratings.rating, first_release_date, platforms.name, cover.image_id, screenshots.image_id; where id = ${query.id};`;
  const options = {
    hostname: 'api-v3.igdb.com',
    path: '/games',
    port: 443,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Key': '119f8b04a08b90a409cb283bad80d946',
    },
  };

  // let jsonString = '';
  // let statusCode = 200;

  const stringArr = [];
  const apiReq = https.request(options, (apiRes) => {
    res.writeHead(apiRes.statusCode, { 'Content-Type': 'application/json' });

    apiRes.on('data', (resData) => {
      stringArr.push(resData);
    });
  });

  apiReq.on('error', (e) => {
    console.error(e);
  });

  apiReq.on('close', () => {
    const initialJsonStr = stringArr.join('');
    const array = JSON.parse(initialJsonStr);
    const jsonObj = {
      igdb_info: array[0],
    };

    if (games[array[0].name]) jsonObj.players = games[array[0].name];

    respond(req, res, 200, jsonObj);
  });

  apiReq.write(data);
  apiReq.end();
};

const getGameCovers = (req, res, query) => {
  if (!query.ids) {
    respond(req, res, 400, {
      id: 'missingParams',
      message: 'Requires at least one game ID.',
    });
  }
  const data = `fields name, cover.image_id; where id = (${query.ids});`;
  const options = {
    hostname: 'api-v3.igdb.com',
    path: '/games',
    port: 443,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Key': '119f8b04a08b90a409cb283bad80d946',
    },
  };

  // let jsonString = '';
  // let statusCode = 200;
  res.writeHead(200, { 'Content-Type': 'application/json' });
  const apiReq = https.request(options, (apiRes) => {
    res.writeHead(apiRes.statusCode, { 'Content-Type': 'application/json' });
    apiRes.on('data', (resData) => {
      res.write(resData);
    });
  });

  apiReq.on('error', (e) => {
    console.error(e);
  });

  apiReq.on('close', () => {
    res.end();
  });

  apiReq.write(data);
  apiReq.end();
};

module.exports = {
  getUsers,
  getUser,
  addUser,
  addGame,
  notReal,
  removeGame,
  getGameInfo,
  getSuggestions,
  getGameCovers,
};
