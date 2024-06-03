const { CognitoUserPool, CognitoUserAttribute  } = require('amazon-cognito-identity-js')
var poolData = {
	UserPoolId: process.env.USER_POOL_ID, // Your user pool id here
	ClientId: process.env.CLIENT_ID // Your client id here
};

var userPool = new CognitoUserPool(poolData);

function register(pool, email, password, attribute_list) {
  return new Promise((resolve, reject) => {
    pool.signUp(email, password, attribute_list, null, (err, result) => {
      if (err) {
        console.log(err)
        reject(err);
        return;
      }
      console.log(result)
      resolve(result)
    });
  });
}

module.exports.handler = async (event) => {
    
    let eventBody = JSON.parse(event.body)
    
    console.log(eventBody.email)
    let email = eventBody.email
    let password =  eventBody.password 
    let firstName = {Name: 'given_name', Value: eventBody.firstName}
    let lastName = {Name: 'family_name', Value: eventBody.lastName}  

    let attributeList = [new CognitoUserAttribute(firstName), new CognitoUserAttribute(lastName)]
    console.log("BEFORE")
    try {
        var result = await register(userPool, email, password, attributeList);
        console.log(result);
        
        return {
            statusCode: 200,
            body: "User ",
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Credentials': true,
            }
        };
    } catch (e) {
        console.error(e);
        return {
            statusCode: 400,
            body: "Unable to register user",
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Credentials': true,
            }
        };
    }
  };