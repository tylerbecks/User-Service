const userRouter = require('express').Router();
const userModel = require('./userModel');
const userController = require('./userController');

// Define API routes to /user-sql
userRouter.post('/createUser', userController.createNewUser);
// userRouter.get('/', userController.queryUserInfo);
// userRouter.post('/updatePassword', userController.updatePassword);
userRouter.post('/addPreference', userController.addPreference);
// userRouter.post('/addPhoto', userController.addPhoto);
userRouter.post('/updateAccessToken', userController.updateAccessToken);
userRouter.post('/updatePassword', userController.updatePassword);
userRouter.post('/loginCredentials', userController.loginCredentials);
userRouter.get('/userInfo', userController.queryUserInfo);


module.exports = userRouter;