const path = require('path');
// const authController = require('../auth/authController');
const userRouter = require('../user/userRouter');

module.exports = (app) => {
  app.use('/api/user-sql', userRouter);
};
