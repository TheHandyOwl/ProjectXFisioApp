
# FisiApp

Api for the iOS/Android apps.

## Deploy

### Install dependencies  
    
    npm install

### Configure  

Review models/db.js to set database configuration

### Init database

    npm run installDB

## Start

To start a single instance:
    
    npm start

To start in cluster mode: 

    npm run cluster  

To start a single instance in debug mode:

    npm run debug (including nodemon & debug log)

## Test

    npm test (pending to create, the client specified not to do now)

## JSHint & JSCS

    npm run hints

## API v1 info


### Base Path

The API can be used with the path: 
[API V1](/apiv1/appointments)

### Security

The API uses JSON Web Token to handle users. First you will need to call /users/register to create a user.  

Then call /users/authenticate to obtain a token.
  
Next calls will need to have the token in:  

- Header: x-access-token: eyJ0eXAiO...
- Body: { token: eyJ0eXAiO... }
- Query string: ?token=eyJ0eXAiO...

### Language

All requests that return error messages are localized to english, if you want to 
change language make the request with the header accept-language set to other language, 
i.e. Accept-Language: es 

### Error example

    {
      "ok": false,
      "error": {
        "code": 401,
        "message": "Authentication failed. Wrong password."
      }
    }

### POST /users/register

**Input Body**: { name, email, password }

**Result:** 

    {
      "ok": true, 
      "message": "user created!"
    }

### POST /users/authenticate

**Input Body**: { email, clave}

**Result:** 

    {
      "ok": true, 
      "token": "..."
    }

### GET /appointments

**Input Query**: 


**Result:** 

    {
      "ok": true,
      "result": { 
        "idService": 1,
        "idCustomer": 1,
        "idProfessional": 1,
        "idAppointment": 1,
        "date": "201803011700",
        "address": "40.4166159, -3.703788",
        "extraInfo": "Some info about direction",
        "__v": 0
      }
    }

### POST /pushtokens

Save user pushtoken { pushtoken, platform, iduser}

iduser is optional.
platform can be 'ios' or 'android'  

**Result:** 

    {
      "ok": true,
      "created": {
        "__v": 0,
        "token": "123456",
        "user": "560ad58ff82387259adbf26c",
        "platform": "android",
        "createdAt": "2015-09-30T21:01:19.955Z",
        "_id": "560c4b648b892ca73faac308"
      }
    }

### Images
[icons8.com](https://icons8.com/)
