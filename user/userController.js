const bluebird = require('bluebird');
const neo4j = require('neo4j');
const sequelize = require('sequelize');
const dbSql = require('../db/sqlconfig');
// const db = new neo4j.GraphDatabase('http://app55234389-2DSvfe:UxlI4yKGxG8cueLnV1ca@app552343892dsvfe.sb10.stations.graphenedb.com:24789');
const db = new neo4j.GraphDatabase('http://neo4j:cake@localhost:7474');
const request = require('request');
require('../helpers/api_keys');

const queryUserSubreddits = (redditId) => (
  new Promise((resolve, reject) => {
    db.cypher({
      query: 'MATCH (user:Person)-[r:FOLLOWS]->(subreddit) \
              WHERE user.redditId={redditId} \
              RETURN subreddit;',
      params: {
        redditId,
      },
    }, (err, subreddits) => {
      if (err) {
        console.log('server/userController.js 74: error');
        reject(err);
      } else {
        const subredditList = subreddits.map(item => (item.subreddit.properties.name));
        resolve(subredditList);
      }
    });
  })
);

// Get the user's temporary access token
const queryAccessToken = (redditId) => (
  new Promise((resolve, reject) => {
    dbSql.Users.findAll({ where: { redditId: redditId } }).then((userData, err) => {
      if (err) {
        reject(err);
      } else {
        resolve(userData[0].dataValues.accessToken);
      }
    });
  })
);

// Get the user's refresh token
const queryRefreshToken = (username) => (
  new Promise((resolve, reject) => {
    dbSql.Users.find({ where: { name: username } }).then((userData) => {
      if (userData === undefined || userData === null) {
        reject('error with finding user');
      } else {
        var user = userData.dataValues;
        resolve(user.refreshToken);
      }
    });
  })
);

// Get list of subscribed subreddits from reddit and add to the database
const createUserSubreddits = (redditId) => {
  // Request list of subscribed subreddits from Reddit
  queryAccessToken(redditId).then((accessToken) => {
    request({
      url: 'https://@oauth.reddit.com/subreddits/mine',
      method: 'GET',
      headers: {
        'authorization': `bearer ${accessToken}`,
        'User-Agent': 'javascript:reddi2mingle:v1.0.0 (by /u/neil_white)',
      },
    }, (err, response) => {
      // Create array of the subreddits
      const rawData = JSON.parse(response.body).data.children;
      const subredditList = rawData.map(item => ({ name: item.data.display_name, subscribers: item.data.subscribers}));

      // Build cypher query to save new subreddits to database
      var mergeArray = [];
      var returnArray = [' RETURN '];

      subredditList.forEach((item, index) => {
        mergeArray.push(` MERGE (${item.name}:Subreddit { name: '${item.name}' }) 
          ON CREATE SET ${item.name}.subscribers = ${item.subscribers} 
          ON MATCH SET ${item.name}.subscribers = ${item.subscribers} `)
         // Example of result from above line:
         // "MERGE (sanfrancisco:Subreddit { name: 'sanfrancisco', subscribers: 108}) MERGE ... "
        returnArray.push(`${item.name}, `);
        // Example of result from above line:
        // "RETURN sanfrancisco, ..."
      });

      // Join the two arrays together into one cypher query to save subreddits to Neo4j
      var saveSubreddits = mergeArray.join('') + returnArray.join('');
      // Replace last comma character with a semicolon
      saveSubreddits = saveSubreddits.slice(0, saveSubreddits.length - 2) + ';';

      // Build cypher query to save follows relationship
      // between new user and their subscribed subreddits

      var matchArray = [`MATCH (user:Person {redditId:"${redditId}"}) `];
      var followsArray = [];

      subredditList.forEach((item, index) => {
        matchArray.push(` MATCH (${item.name}:Subreddit { name: '${item.name}' })`);
        followsArray.push(` MERGE (user)-[:FOLLOWS]->(${item.name})`);
      });

      var saveFollows = matchArray.join('') + followsArray.join('');
      saveFollows += ';';

      // Save the subreddits database
      db.cypher({
          query: saveSubreddits,
      }, (err, results) => {
        if (err) {
          console.log(`server/userController.js 150: issue with adding ${results}: ${err}`);
        } else {
          console.log(`server/userController.js 152: subreddits saved to database, results: ${results}`);
          // Save the follow relationships for (user)->(subreddits) to the database
          db.cypher({
              query: saveFollows,
          }, (err, results) => {
            if (err) {
              console.log(`server/userController.js 158: issue with adding ${results}: ${err}`);
            } else {
              console.log(`server/userController.js 160: subreddit relationships saved to database, results:  ${results}`);
            }
          });
        }
      });
    });
  });
};

module.exports = {
  //once authenticated, create new user in neo4j. once successful, create new user in sql
  createNewUser: (req, res) => {
    console.log('create New User in user service');

    const accessToken = req.body.accessToken;
    const refreshToken = req.body.refreshToken;
    const profile =  req.body.profile;

    db.cypher({
      query: `MERGE (user:Person { redditId: {redditId} }) \
              ON CREATE SET user.name = {username} \
              ON CREATE SET user.redditId = {redditId} \
              ON CREATE SET user.photo = "" \
              RETURN user;`,
      params: {
        username: profile.name,
        redditId: profile.id,
      },
    }, (err, results) => {
      if (err) {
        console.log(`user-service/userController.js: issue with adding ${profile.name}: ${err}`);
      } else {
        console.log(`user-service/userController.js: user is actually saved to Neo4j, results: ${results}`);
        // Find or create the user
        dbSql.Users.findOrCreate({ where: { redditId: profile.id, name: profile.name } }).then(() => {
          dbSql.Users.find({ where: { redditId: profile.id } }).then((task) => {
            // Update is invoked (so that we aren't creating duplicate users)
            task.update({
              refreshToken: refreshToken,
              accessToken: accessToken,
              photo: 'https://cdn1.iconfinder.com/data/icons/simple-icons/4096/reddit-4096-black.png',
              preference: null,
              gender: null,
            });
          })
          .then((data) => {
            console.log('user-service/userController.js: User added to MySQL database:', profile.id);
            createUserSubreddits(profile.id);
          });
        });
      }
    });
  },

  loginCredentials: (req, res) => {
    var username = req.body.username;
    var password = req.body.password;

    dbSql.Users.findAll({ where: { name: username, password: password } }).then(function(data) {
      if (data.length) {
        var redditId = data[0].dataValues.redditId;
        var name = data[0].dataValues.name;
        var photo = data[0].dataValues.photo;
        res.send({ redditId: redditId, name: name, photo: photo });
      } else {
        res.status(401).send('invalid username or password');
      }
    });
  },

  queryUserInfo: (req, res) => {
    const redditId = req.query.redditId;
    // var subreddits = [];
    console.log(`server/userController.js 211: my reddit id: ${redditId}`);
    // First query database for subreddit connections
    queryUserSubreddits(redditId).then((subreddits) => {
      // Query database for the user's name, photo, etc.
      db.cypher({
        query: 'MATCH (user:Person) WHERE user.redditId={redditId} RETURN user;',
        params: {
          redditId,
        },
      }, (err, results) => {
        if (err) {
          console.log(`server/userController.js 222: issue with retrieving, err: ${err}`);
        } else {
          console.log(`server/userController.js 224: results: ${results}`);
          var aggregateInfo = results[0].user.properties;
          aggregateInfo.subreddits = subreddits;

          res.send(aggregateInfo);
        }
      });
    });
  },

  updatePassword: (req, res) => {
    var redditId = req.body.redditId;
    var password = req.body.password;
    dbSql.Users.find({where: {redditId: redditId}}).then((task) => {
      task.update({password: password}).then((data2) => {
        res.send('password updated in MySQL');
      });
    });
  },

  updateAccessToken: (req, res) => {
    var username = req.body.username;
    var password = req.body.password;

    queryRefreshToken(username, password).then((refreshToken) => {
      request({
        url: `https://T3zDXS9GxKukbA:TAKMSJzrlZPzTWxK5O3w7OglWA8@ssl.reddit.com/api/v1/access_token?state=uniquestring&scope=identity&client_id=T3zDXS9GxKukbA&redirect_uri=http://127.0.0.1:3000/auth/reddit/callback&refresh_token=${refreshToken}&grant_type=refresh_token`,
        method: 'POST',
      }, (err, results) => {
        if (err) {
          console.log(`server/userController.js 222: issue with retrieving, err: ${err}`);
        } else {
          // console.log(`server/userController.js 224: results: ${results}`);
          var newAccessToken = JSON.parse(results.body).access_token;
          dbSql.Users.find({where: {name: username}}).then((task) => {
            task.update({accessToken: newAccessToken}).then((data2) => {
              res.send('accessToken updated in MySQL');
            });
          });
        }
      });
    });
  },

  addPreference: (req, res) => {
    const gender = req.body.gender;
    const preference = req.body.preference;
    const redditId = req.body.redditId;
    db.cypher({
      query: `MERGE (user:Person {redditId: "${redditId}"})
                ON MATCH SET user.gender = "${gender}"
                ON MATCH SET user.preference = "${preference}"
              RETURN user;`,
    }, (err, results) => {
      if (err) {
        console.log(`server/userController.js: error with updating preference and gender ${err}`);
      } else {
        console.log('server/userController.js: gender and prefernce added sucessfully');
        dbSql.Users.find({ where: { redditId: redditId }}).then((task) => {
          task.update({ gender: gender, preference: preference }).then((data2) => {
            // User preferences have now been added
            // Request main app server to being the potential creation process
            request({
              method: 'POST',
              url: `http://localhost:${process.env.PORT_APP}/api/potentials/createPotentials`,
              form: {
                redditId: redditId,
              }
            }, (err, response) => {
              if (err) {
                console.log('error with creating potentials');
              } else {
                res.send('preferences updated in MySQL and potentials created');
              }
            })
          });
        });
      }
    });
  },

  addPhoto: (req, res) => {
    db.cypher({
      query: `MATCH (user:Person)
                WHERE user.redditId = "${req.body.redditId}" 
              SET user.photo = "${req.body.photo}"
              RETURN user`,
    }, (err, results) => {
      if (err) {
        console.log(`server/userController.js: issue with updating photo, err ${err}`);
      } else {
        res.send(results);
      }
    });
  },

};
