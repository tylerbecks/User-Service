const Sequelize = require('sequelize');
// const sequelize = new Sequelize('heroku_bc34dd4371107d4', 'bd77d9f718d486', '21120e85', {
//   host: 'us-cdbr-iron-east-04.cleardb.net',
//   dialect: 'mysql',
//   pool: {
//     maxIdleTime: 10000000000,
//     max: 5,
//     min: 0
//   },
// });
const sequelize = new Sequelize('reddi2mingle', 'root', '', {
  dialect: 'mysql',
});

// Table models
const Users = require('../user/userModel')(sequelize, Sequelize);

// Connect to database
sequelize.authenticate()
  .then((err) => {
    console.log('Connection has been established successfully.');
  }, (err) => {
    console.log('Unable to connect to the database:', err);
  });

// // // USERS Table - add foreign key creatorId to the Eatup model
// User.belongsTo(User, { foreignKey: 'creatorId', targetKey: 'id' });
// Eatup.belongsTo(Restaurant, { foreignKey: 'restaurantId', targetKey: 'id' });

// // // SUBREDDIT Table - add foreign key userId to User eatupId to Eatup
// Comment.belongsTo(User, {foreignKey: 'userId', targetKey: 'id'});
// Comment.belongsTo(Eatup, {foreignKey: 'eatupId', targetKey: 'id'});

// // MATCH Table - add foreign key userId to User eatupId and Eatup
// Users.belongsToMany(Users, { through: 'Match', foreignKey: 'userId' });

// // Synchronizing the database
sequelize.query('SET FOREIGN_KEY_CHECKS = 0')
  .then(function() {
    return sequelize.sync();
  })
  .then(function() {
    return sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
  })
  .then(function() {
    console.log('Database synchronised.');
  }, function(err) {
    console.log(err);
  });

module.exports = {
  Users: Users,
  sequelize: sequelize,
};
