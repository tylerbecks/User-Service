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
  });

};

module.exports = Users;