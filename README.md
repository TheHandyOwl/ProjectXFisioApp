
# FisioApp

Api for the iOS/Android/Web apps.

## Deploy

### Install dependencies  
    
    npm install

### Configure  

Review models/db.js to set database configuration

Create a new config/config.js with your custom information

```json
'use strict';

module.exports = {
    jwt: {
      secret: 'yoursecretkey',
      options: {
        expiresIn: '2 days'
      }
    },
    app: {
      imagesURLBasePath: '/images/app/',
      imageLogoDate: "icons8-calendar-50.png"
    }
};

module.exports.SEED = 'yourcustomseed';

// Google
module.exports.GOOGLE_CLIENT_ID = 'YourCustomClientId.apps.googleusercontent.com';
module.exports.GOOGLE_SECRET = 'YourCustomSecret';
```

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

The API uses JSON Web Token to handle users. First you will need to call /register to create a user.  

Then call /authenticate to obtain a token.
  
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


### POST /authenticate

**Input Body**: { email, password }

**Result:**

    {
      "ok": true, 
      "token": "..."
    }

### GET /appointments/professional

**Input Query**: 

Possible filters:

{dateFrom}: Date from to filter the appointment
{dateTo}: Date to to filter the appointment
{confirmed}: true/false
{cancelled}: true/false
{customer}: customer id to find the appointments for a specific customer

**Result:**

    {
        "ok": true,
        "result": {
            "_id": "5aa106e46750320b606db6ce",
            "service": {
                "_id": "5aa00e386281ea2d347d4732",
                "name": "service 1",
                "description": "1 hour session",
                "price": 30,
                "__v": 0
            },
            "customer": {
                "_id": "5a9f054f602dd0e540c71bc7",
                "isProfessional": true,
                "fellowshipNumber": 33,
                "gender": "Female",
                "name": "thecustomer",
                "lastName": "lastname",
                "email": "customer@invalid.com",
                "password": "ef797c8118f02dfb649607dd5d3f8c7623048c9c063d532cc95c5ed7a898a64f",
                "address": "Customer Address, 44",
                "phone": "626626626",
                "birthDate": "1980-12-30T12:30:00.000Z",
                "nationalId": "87654321Z",
                "registrationDate": "2018-02-02T02:02:00.000Z",
                "lastLoginDate": "2018-03-07T17:00:00.000Z",
                "__v": 0
            },
            "professional": {
                "_id": "5a9f054f602dd0e540c71bc6",
                "isProfessional": true,
                "fellowshipNumber": 33,
                "gender": "Male",
                "name": "fisio",
                "lastName": "lastname",
                "email": "fisio@invalid.com",
                "password": "ef797c8118f02dfb649607dd5d3f8c7623048c9c063d532cc95c5ed7a898a64f",
                "address": "Fisio Address, 33",
                "phone": "626626626",
                "birthDate": "1970-12-30T12:30:00.000Z",
                "nationalId": "12345678Z",
                "registrationDate": "2018-01-01T01:01:00.000Z",
                "lastLoginDate": "2018-03-07T16:00:00.000Z",
                "__v": 0
            },
            "isConfirmed": false,
            "isCancelled": false,
            "date": "1976-05-24T16:23:31.700Z",
            "latitude": 40.4166159,
            "longitude": -3.703788,
            "extraInfo": "Tercero izquierda",
            "__v": 0
        }
    }


### GET /appointments/customer

**Input Query:**
Possible filters:

{dateFrom}: Date from to filter the appointment
{dateTo}: Date to to filter the appointment
{confirmed}: true/false
{cancelled}: true/false
{professional}: professional id to find the appointments for a specific professional

**Result:**

{
    "ok": true,
    "result": {
        "_id": "5aa106e46750320b606db6ce",
        "service": {
            "_id": "5aa00e386281ea2d347d4732",
            "name": "service 1",
            "description": "1 hour session",
            "price": 30,
            "__v": 0
        },
        "customer": {
            "_id": "5a9f054f602dd0e540c71bc7",
            "isProfessional": true,
            "fellowshipNumber": 33,
            "gender": "Female",
            "name": "thecustomer",
            "lastName": "lastname",
            "email": "customer@invalid.com",
            "password": "ef797c8118f02dfb649607dd5d3f8c7623048c9c063d532cc95c5ed7a898a64f",
            "address": "Customer Address, 44",
            "phone": "626626626",
            "birthDate": "1980-12-30T12:30:00.000Z",
            "nationalId": "87654321Z",
            "registrationDate": "2018-02-02T02:02:00.000Z",
            "lastLoginDate": "2018-03-07T17:00:00.000Z",
            "__v": 0
        },
        "professional": {
            "_id": "5a9f054f602dd0e540c71bc6",
            "isProfessional": true,
            "fellowshipNumber": 33,
            "gender": "Male",
            "name": "fisio",
            "lastName": "lastname",
            "email": "fisio@invalid.com",
            "password": "ef797c8118f02dfb649607dd5d3f8c7623048c9c063d532cc95c5ed7a898a64f",
            "address": "Fisio Address, 33",
            "phone": "626626626",
            "birthDate": "1970-12-30T12:30:00.000Z",
            "nationalId": "12345678Z",
            "registrationDate": "2018-01-01T01:01:00.000Z",
            "lastLoginDate": "2018-03-07T16:00:00.000Z",
            "__v": 0
        },
        "isConfirmed": false,
        "isCancelled": false,
        "date": "1976-05-24T16:23:31.700Z",
        "latitude": 40.4166159,
        "longitude": -3.703788,
        "extraInfo": "Tercero izquierda",
        "__v": 0
    }
}

### POST /appointments

Save a new appointment.

**Input body:**

{ idService, idCustomer, idProfessional, isConfirmed, isCancelled, date, latitude, longitude, address, extraInfo }

**Result:**

    {
      "ok": true,
      "created": {
        "__v": 0,
        ...
      }
    }

### PUT /appointments/{id}

Update an existing appointment.
In the body is only sent the information you want to update.

**Input body:**

{ isConfirmed, isCancelled, date, latitude, longitude, address, extraInfo }

**Result:**

    {
        "ok": true,
        "message": "appointment updated"
    }

### DELETE /appointments/{id}

Delete an existing appointment.

**Input body:**

**Result:**

    {
        "ok": true,
        "message": "appointment deleted"
    }

### GET /notifs

**Input Query**: 

**Result:**

    {
        "ok": true,
        "result": {
            "rows": [
                {
                    "_id": "5aa01386f056e02c7ce13f1e",
                    "professional": {
                        "_id": "5a9f054f602dd0e540c71bc6",
                        "isProfessional": true,
                        "fellowshipNumber": 33,
                        "gender": "Male",
                        "name": "fisio",
                        "lastName": "lastname",
                        "email": "fisio@invalid.com",
                        "password": "ef797c8118f02dfb649607dd5d3f8c7623048c9c063d532cc95c5ed7a898a64f",
                        "address": "Fisio Address, 33",
                        "phone": "626626626",
                        "birthDate": "1970-12-30T12:30:00.000Z",
                        "nationalId": "12345678Z",
                        "registrationDate": "2018-01-01T01:01:00.000Z",
                        "lastLoginDate": "2018-03-07T16:00:00.000Z",
                        "__v": 0
                    },
                    "customer": {
                        "_id": "5a9f054f602dd0e540c71bc7",
                        "isProfessional": true,
                        "fellowshipNumber": 33,
                        "gender": "Female",
                        "name": "thecustomer",
                        "lastName": "lastname",
                        "email": "customer@invalid.com",
                        "password": "ef797c8118f02dfb649607dd5d3f8c7623048c9c063d532cc95c5ed7a898a64f",
                        "address": "Customer Address, 44",
                        "phone": "626626626",
                        "birthDate": "1980-12-30T12:30:00.000Z",
                        "nationalId": "87654321Z",
                        "registrationDate": "2018-02-02T02:02:00.000Z",
                        "lastLoginDate": "2018-03-07T17:00:00.000Z",
                        "__v": 0
                    },
                    "name": "message 1",
                    "description": "description message 1",
                    "isSent": false,
                    "creationDate": "2018-03-07T16:00:00.000Z",
                    "sendingDate": null,
                    "__v": 0
                },
                {
                    "_id": "5aa01386f056e02c7ce13f1f",
                    "professional": {
                        "_id": "5a9f054f602dd0e540c71bc6",
                        "isProfessional": true,
                        "fellowshipNumber": 33,
                        "gender": "Male",
                        "name": "fisio",
                        "lastName": "lastname",
                        "email": "fisio@invalid.com",
                        "password": "ef797c8118f02dfb649607dd5d3f8c7623048c9c063d532cc95c5ed7a898a64f",
                        "address": "Fisio Address, 33",
                        "phone": "626626626",
                        "birthDate": "1970-12-30T12:30:00.000Z",
                        "nationalId": "12345678Z",
                        "registrationDate": "2018-01-01T01:01:00.000Z",
                        "lastLoginDate": "2018-03-07T16:00:00.000Z",
                        "__v": 0
                    },
                    "customer": {
                        "_id": "5a9f054f602dd0e540c71bc7",
                        "isProfessional": true,
                        "fellowshipNumber": 33,
                        "gender": "Female",
                        "name": "thecustomer",
                        "lastName": "lastname",
                        "email": "customer@invalid.com",
                        "password": "ef797c8118f02dfb649607dd5d3f8c7623048c9c063d532cc95c5ed7a898a64f",
                        "address": "Customer Address, 44",
                        "phone": "626626626",
                        "birthDate": "1980-12-30T12:30:00.000Z",
                        "nationalId": "87654321Z",
                        "registrationDate": "2018-02-02T02:02:00.000Z",
                        "lastLoginDate": "2018-03-07T17:00:00.000Z",
                        "__v": 0
                    },
                    "name": "message 2",
                    "description": "description message 2",
                    "isSent": false,
                    "creationDate": "2018-03-07T16:00:00.000Z",
                    "sendingDate": null,
                    "__v": 0
                }
            ]
        }
    }

### GET /notifs/{id}

**Input Query**: { id }

**Result:**

    {
        "ok": true,
        "result": {
            "_id": "5aa01386f056e02c7ce13f1e",
            "professional": {
                "_id": "5a9f054f602dd0e540c71bc6",
                "isProfessional": true,
                "fellowshipNumber": 33,
                "gender": "Male",
                "name": "fisio",
                "lastName": "lastname",
                "email": "fisio@invalid.com",
                "password": "ef797c8118f02dfb649607dd5d3f8c7623048c9c063d532cc95c5ed7a898a64f",
                "address": "Fisio Address, 33",
                "phone": "626626626",
                "birthDate": "1970-12-30T12:30:00.000Z",
                "nationalId": "12345678Z",
                "registrationDate": "2018-01-01T01:01:00.000Z",
                "lastLoginDate": "2018-03-07T16:00:00.000Z",
                "__v": 0
            },
            "customer": {
                "_id": "5a9f054f602dd0e540c71bc7",
                "isProfessional": true,
                "fellowshipNumber": 33,
                "gender": "Female",
                "name": "thecustomer",
                "lastName": "lastname",
                "email": "customer@invalid.com",
                "password": "ef797c8118f02dfb649607dd5d3f8c7623048c9c063d532cc95c5ed7a898a64f",
                "address": "Customer Address, 44",
                "phone": "626626626",
                "birthDate": "1980-12-30T12:30:00.000Z",
                "nationalId": "87654321Z",
                "registrationDate": "2018-02-02T02:02:00.000Z",
                "lastLoginDate": "2018-03-07T17:00:00.000Z",
                "__v": 0
            },
            "name": "message 1",
            "description": "description message 1",
            "isSent": false,
            "creationDate": "2018-03-07T16:00:00.000Z",
            "sendingDate": null,
            "__v": 0
        }
    }

### POST /notifs

Save a new notifs.

**Input body:**

{ "professional", "customer", "name", "description", "isSent" }

**Result:**

    {
      "ok": true,
      "created": {
        "__v": 0,
        ...
      }
    }

### PUT /notifs/{id}

Update an existing notification.
In the body is only sent the information you want to update.

**Input body:**

{ name, description, price }

**Result:**

    {
        "ok": true,
        "message": "service updated"
    }

### DELETE /notifs/{id}

Delete an existing notification.

**Input body:**

**Result:**

    {
        "ok": true,
        "message": "notif deleted"
    }

### GET /products

**Input Query**: 

Possible filters: 

{id}: id from product
{professional}: professional id, owner's product
{pricefrom}: initial limit for price
{priceto}: final limit for price

**Result:**

    {
        "ok": true,
        "result": {
            "rows": [
                {
                    "_id": "5a9f054f602dd0e540c71bd1",
                    "professional": {
                        "_id": "5a9f054f602dd0e540c71bc6",
                        "isProfessional": true,
                        "fellowshipNumber": 33,
                        "gender": "Male",
                        "name": "fisio",
                        "lastName": "lastname",
                        "email": "fisio@invalid.com",
                        "password": "ef797c8118f02dfb649607dd5d3f8c7623048c9c063d532cc95c5ed7a898a64f",
                        "address": "Fisio Address, 33",
                        "phone": "626626626",
                        "birthDate": "1970-12-30T12:30:00.000Z",
                        "nationalId": "12345678Z",
                        "registrationDate": "2018-01-01T01:01:00.000Z",
                        "lastLoginDate": "2018-03-07T16:00:00.000Z",
                        "__v": 0
                    },
                    "name": "product 1",
                    "description": "1 hour session",
                    "price": 30,
                    "__v": 0
                },
                {
                    "_id": "5a9f054f602dd0e540c71bd2",
                    "professional": {
                        "_id": "5a9f054f602dd0e540c71bc6",
                        "isProfessional": true,
                        "fellowshipNumber": 33,
                        "gender": "Male",
                        "name": "fisio",
                        "lastName": "lastname",
                        "email": "fisio@invalid.com",
                        "password": "ef797c8118f02dfb649607dd5d3f8c7623048c9c063d532cc95c5ed7a898a64f",
                        "address": "Fisio Address, 33",
                        "phone": "626626626",
                        "birthDate": "1970-12-30T12:30:00.000Z",
                        "nationalId": "12345678Z",
                        "registrationDate": "2018-01-01T01:01:00.000Z",
                        "lastLoginDate": "2018-03-07T16:00:00.000Z",
                        "__v": 0
                    },
                    "name": "product 2",
                    "description": "2 hour session",
                    "price": 50,
                    "__v": 0
                }
            ]
        }
    }


### POST /products

Save a new product.

**Input body:**

{ name, description, price }

**Result:**

    {
      "ok": true,
      "created": {
        "__v": 0,
        ...
      }
    }

### PUT /products/{id}

Update an existing product.
In the body is only sent the information you want to update.

**Input body:**

{ name, description, price }

**Result:**

    {
        "ok": true,
        "message": "product updated"
    }

### DELETE /products/id

Delete an existing product.

**Input body:**

**Result:**

    {
        "ok": true,
        "message": "product deleted"
    }

### POST /register

**Input Body**: { name, email, password }

**Result:**

    {
      "ok": true, 
      "message": "user created!"
    }

### GET /services

**Input Query**: 

Possible filters: 

{id}: id from product
{professional}: professional id, owner's service
{pricefrom}: initial limit for price
{priceto}: final limit for price

**Result:**

    {
        "ok": true,
        "result": {
            "rows": [
                {
                    "_id": "5aa00e386281ea2d347d4732",
                    "professional": {
                        "_id": "5a9f054f602dd0e540c71bc6",
                        "isProfessional": true,
                        "fellowshipNumber": 33,
                        "gender": "Male",
                        "name": "fisio",
                        "lastName": "lastname",
                        "email": "fisio@invalid.com",
                        "password": "ef797c8118f02dfb649607dd5d3f8c7623048c9c063d532cc95c5ed7a898a64f",
                        "address": "Fisio Address, 33",
                        "phone": "626626626",
                        "birthDate": "1970-12-30T12:30:00.000Z",
                        "nationalId": "12345678Z",
                        "registrationDate": "2018-01-01T01:01:00.000Z",
                        "lastLoginDate": "2018-03-07T16:00:00.000Z",
                        "__v": 0
                    },
                    "name": "service 1",
                    "description": "1 hour session",
                    "price": 30,
                    "__v": 0
                },
                {
                    "_id": "5aa00e386281ea2d347d4733",
                    "professional": {
                        "_id": "5a9f054f602dd0e540c71bc6",
                        "isProfessional": true,
                        "fellowshipNumber": 33,
                        "gender": "Male",
                        "name": "fisio",
                        "lastName": "lastname",
                        "email": "fisio@invalid.com",
                        "password": "ef797c8118f02dfb649607dd5d3f8c7623048c9c063d532cc95c5ed7a898a64f",
                        "address": "Fisio Address, 33",
                        "phone": "626626626",
                        "birthDate": "1970-12-30T12:30:00.000Z",
                        "nationalId": "12345678Z",
                        "registrationDate": "2018-01-01T01:01:00.000Z",
                        "lastLoginDate": "2018-03-07T16:00:00.000Z",
                        "__v": 0
                    },
                    "name": "service 2",
                    "description": "2 hour session",
                    "price": 50,
                    "__v": 0
                }
            ]
        }
    }


### POST /services

Save a new service.

**Input body:**

{ name, description, price }

**Result:**

    {
      "ok": true,
      "created": {
        "__v": 0,
        ...
      }
    }

### PUT /services/{id}

Update an existing service.
In the body is only sent the information you want to update.

**Input body:**

{ name, description, price }

**Result:**

    {
        "ok": true,
        "message": "service updated"
    }

### DELETE /services/{id}

Delete an existing service.

**Input body:**

**Result:**

    {
        "ok": true,
        "message": "service deleted"
    }

### DELETE /users

**Input Body**: { email, password }

**Result:**

    {
      "ok": true, 
      "message": "user deleted!"
    }


### GET /users/{id}

**Input Query**: { id }

**Result:**

    {
        "ok": true,
        "result": {
            "_id": "5a9f054f602dd0e540c71bc6",
            "isProfessional": true,
            "fellowshipNumber": 33,
            "gender": "male",
            "name": "fisio",
            "lastName": "lastname",
            "email": "fisio@invalid.com",
            "password": "ef797c8118f02dfb649607dd5d3f8c7623048c9c063d532cc95c5ed7a898a64f",
            "address": "Fisio Address, 33",
            "phone": "626626626",
            "birthDate": "1970-12-30T12:30:00.000Z",
            "nationalId": "12345678Z",
            "registrationDate": "2018-01-01T01:01:00.000Z",
            "lastLoginDate": "2018-03-07T16:00:00.000Z",
            "__v": 0,
            "deleted": false
        }
    }

### PUT /users

**Input Body**: { email, password, gender, address, phone, birthDate, nationalId }

**Result:**

    {
      "ok": true, 
      "message": "user updated!"
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
