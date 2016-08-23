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
    goldMember: { type: DataTypes.BOOLEAN },
    receivedUpvotes: { type: DataTypes.INTEGER },
    receivedDownvotes: { type: DataTypes.INTEGER },
    deliveredUpvotes: { type: DataTypes.INTEGER },
    deliveredDownvotes: { type: DataTypes.INTEGER },
  });

};

module.exports = Users;