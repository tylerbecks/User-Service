const app = require('express')();
const server = require('http').Server(app);
const middleware = require('./helpers/middleware');
const routers = require('./helpers/routes');
// require('./helpers/seed');
// require('./helpers/seedCreation');
require('./db/sqlconfig');
require('./helpers/api_keys')

// Invoke middleware function on app to 'use' all the middleware functions
middleware(app);

// Invoke routers function on app to provide access to all routes defined
routers(app);

// App now listening on port 81
server.listen(`${process.env.PORT_USER}`, (err) => {
  err ? console.log(`server/server.js 19: server error: ${err}`) :
  console.log(`Server listening on ${process.env.PORT_USER} in user-service server.js`);
});
