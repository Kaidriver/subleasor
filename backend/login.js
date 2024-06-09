const { CognitoUserPool, CognitoUserAttribute, CognitoUser, AuthenticationDetails } = require('amazon-cognito-identity-js')
var poolData = {
	UserPoolId: process.env.USER_POOL_ID, // Your user pool id here
	ClientId: process.env.CLIENT_ID // Your client id here
};

var userPool = new CognitoUserPool(poolData);

function login(pool, email, password) {
  return new Promise((resolve, reject) => {
    let authenticationData = {
      Username: email,
      Password: password
    };

    let userData = {
      Username: email,
      Pool: pool,
    };

    let authenticationDetails = new AuthenticationDetails(authenticationData)
    let cognitoUser = new CognitoUser(userData)
    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: function (result) {
        let accessToken = result.getAccessToken().getJwtToken()
        let idToken = result.idToken.jwtToken

        resolve({'accessToken': accessToken, 'idToken': idToken})
      },
    
      onFailure: function (err) {
        reject(err)
      },
    });
  });
}

module.exports.handler = async (event) => {
    
    let eventBody = JSON.parse(event.body)

    try {
        let result = await login(userPool, eventBody.email, eventBody.password);
        console.log(result);
        
        return {
            statusCode: 200,
            body: JSON.stringify(result),
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Credentials': true,
            }
        };
    } catch (e) {
        console.error(e);
        return {
            statusCode: 400,
            body: "Unable to login",
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Credentials': true,
            }
        };
    }
  };