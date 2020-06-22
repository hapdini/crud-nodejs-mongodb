const users = require('./user.routes');

module.exports = (router) => {
  users(router);
  return router;
};