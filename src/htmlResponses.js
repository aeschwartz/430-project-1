const fs = require('fs'); // pull in the file system module

const index = fs.readFileSync(`${__dirname}/../client/client2.html`);
const game = fs.readFileSync(`${__dirname}/../client/game.html`);
const login = fs.readFileSync(`${__dirname}/../client/login.html`);
const user = fs.readFileSync(`${__dirname}/../client/user.html`);
const css = fs.readFileSync(`${__dirname}/../client/style/main.css`);
const gameCss = fs.readFileSync(`${__dirname}/../client/style/game.css`);
const userCss = fs.readFileSync(`${__dirname}/../client/style/user.css`);
const syndicatedScript = fs.readFileSync(`${__dirname}/../client/scripts/syndicates.js`);

const getIndex = (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.write(index);
  res.end();
};

const getGame = (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.write(game);
  res.end();
};

const getLogin = (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.write(login);
  res.end();
};

const getUser = (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.write(user);
  res.end();
};

const getCSS = (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/css' });
  res.write(css);
  res.end();
};

const getGameCSS = (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/css' });
  res.write(gameCss);
  res.end();
};

const getUserCSS = (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/css' });
  res.write(userCss);
  res.end();
};

const getSyndicatedScript = (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/javascript' });
  res.write(syndicatedScript);
  res.end();
};

module.exports = {
  getIndex,
  getGame,
  getLogin,
  getUser,
  getCSS,
  getGameCSS,
  getUserCSS,
  getSyndicatedScript,
};
