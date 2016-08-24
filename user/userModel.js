const Users = function (sequelize, DataTypes) {

  return sequelize.define('Users', {
    redditId: { type: DataTypes.STRING, unique: true },
    name: { type: DataTypes.STRING },
    password: { type: DataTypes.STRING },
    accessToken: { type: DataTypes.STRING },
    refreshToken: { type: DataTypes.STRING },
    photo: { type: DataTypes.STRING },
    gender: { type: DataTypes.STRING },
    preference: { type: DataTypes.STRING },
    trophyCount: { type: DataTypes.INTEGER },
    postKarma: { type: DataTypes.INTEGER },
    commentKarma: { type: DataTypes.INTEGER },
    goldMember: { type: DataTypes.STRING },
    receivedUpvotes: { type: DataTypes.INTEGER, defaultValue: 0 },
    receivedDownvotes: { type: DataTypes.INTEGER, defaultValue: 0 },
    deliveredUpvotes: { type: DataTypes.INTEGER, defaultValue: 0 },
    deliveredDownvotes: { type: DataTypes.INTEGER, defaultValue: 0 },
  });

};

module.exports = Users;