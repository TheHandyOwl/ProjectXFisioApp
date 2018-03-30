
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
    },
    db: {
      appointments: {
        appointmentsListPublicFields: '_id service customer professional isConfirmed isCancelled date latitude longitude address extraInfo',
        appointmentPublicFields: '_id service customer professional isConfirmed isCancelled date latitude longitude address extraInfo',
        appointmentPrivateFields: '_id service customer professional isConfirmed isCancelled date latitude longitude address extraInfo'
      },
      blogs: {
        blogsListPublicFields: '_id professional customer name description creationDate',
        blogPublicFields: '_id professional customer name description creationDate',
        blogPrivateFields: '_id professional customer name description isVisible creationDate publicationDate'
      },
      notifs: {
        notifsListPublicFields: '_id professional customer name description sendingDate',
        notifPublicFields: '_id professional customer name description sendingDate',
        notifPrivateFields: '_id professional customer name description isSent creationDate sendingDate'
      },
      products: {
        productsListPublicFields: '_id professional name description price',
        productPublicFields: '_id professional name description price',
        productPrivateFields: '_id professional name description price isActive'
      },
      services: {
        servicesListPublicFields: '_id professional name description price',
        servicePublicFields: '_id professional name description price',
        servicePrivateFields: '_id professional name description price isActive'
      },
      users: {
        usersListPublicFields: '_id isProfessional name lastName registrationDate',
        userPublicFields: '_id isProfessional name lastName registrationDate',
        userPrivateFields: '_id isProfessional fellowshipNumber gender name lastName email address phone birthDate nationalId registrationDate lastLoginDate'
      }
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


### POST /login

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
            "rows": [
                {
                    "_id": "5aa444978f1844370be55512",
                    "service": {
                        "_id": "5aa00e386281ea2d347d4733",
                        "professional": "5a9f054f602dd0e540c71bc6",
                        "name": "service 2",
                        "description": "2 hour session",
                        "price": 50
                    },
                    "customer": {
                        "_id": "5a9f054f602dd0e540c71bc7",
                        "isProfessional": true,
                        "name": "customer",
                        "lastName": "lastname",
                        "registrationDate": "2018-02-02T02:02:00.000Z"
                    },
                    "professional": {
                        "_id": "5a9f054f602dd0e540c71bc6",
                        "isProfessional": true,
                        "name": "fisio",
                        "lastName": "lastname",
                        "registrationDate": "2018-01-01T01:01:00.000Z"
                    },
                    "date": "2018-04-04T12:00:00.000Z",
                    "latitude": 40.4166159,
                    "longitude": -3.703788,
                    "extraInfo": "false",
                    "isCancelled": false,
                    "isConfirmed": true
                }
            ]
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
        "rows": [
            {
                "_id": "5abe4562f67bfb207a474d25",
                "service": {
                    "_id": "5aa00e386281ea2d347d4733",
                    "professional": "5a9f054f602dd0e540c71bc6",
                    "name": "service 2",
                    "description": "2 hour session",
                    "price": 50
                },
                "customer": {
                    "_id": "5a9f054f602dd0e540c71bc6",
                    "isProfessional": true,
                    "name": "fisio",
                    "lastName": "lastname",
                    "registrationDate": "2018-01-01T01:01:00.000Z"
                },
                "professional": {
                    "_id": "5a9f054f602dd0e540c71bc6",
                    "isProfessional": true,
                    "name": "fisio",
                    "lastName": "lastname",
                    "registrationDate": "2018-01-01T01:01:00.000Z"
                },
                "date": "2018-05-05T15:00:00.000Z",
                "isCancelled": false,
                "isConfirmed": false
            }
        ]
    }
}

### POST /appointments

Save a new appointment.

**Input body:**

{ idService, idCustomer, idProfessional, isConfirmed, isCancelled, date, latitude, longitude, address, extraInfo }

**Result:**

    {
        "ok": true,
        "message": "appointment created"
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
                        "name": "fisio",
                        "lastName": "lastname",
                        "registrationDate": "2018-01-01T01:01:00.000Z"
                    },
                    "customer": {
                        "_id": "5a9f054f602dd0e540c71bc7",
                        "isProfessional": true,
                        "name": "customer",
                        "lastName": "lastname",
                        "registrationDate": "2018-02-02T02:02:00.000Z"
                    },
                    "name": "message 1",
                    "description": "description message 1",
                    "sendingDate": null
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
                "name": "fisio",
                "lastName": "lastname",
                "registrationDate": "2018-01-01T01:01:00.000Z"
            },
            "customer": {
                "_id": "5a9f054f602dd0e540c71bc7",
                "isProfessional": true,
                "name": "customer",
                "lastName": "lastname",
                "registrationDate": "2018-02-02T02:02:00.000Z"
            },
            "name": "message 1",
            "description": "description message 1",
            "sendingDate": null
        }
    }

### POST /notifs

Save a new notifs.

**Input body:**

{ "professional", "customer", "name", "description", "isSent" }

**Result:**

    {
        "ok": true,
        "message": "notification created"
    }

### PUT /notifs/{id}

Update an existing notification.
In the body is only sent the information you want to update.

**Input body:**

{ name, description, price }

**Result:**

    {
        "ok": true,
        "message": "notification updated"
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
                    "_id": "5a9f054f602dd0e540c71bd3",
                    "professional": {
                        "_id": "5a9f054f602dd0e540c71bc8",
                        "isProfessional": true,
                        "name": "customerdeleted",
                        "lastName": "lastname",
                        "registrationDate": "2018-02-02T02:02:00.000Z"
                    },
                    "name": "product 1",
                    "description": "1 hour session",
                    "price": 300
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
        "message": "product created"
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
                    "_id": "5aa00e386281ea2d347d4734",
                    "professional": {
                        "_id": "5a9f054f602dd0e540c71bc8",
                        "isProfessional": true,
                        "name": "customerdeleted",
                        "lastName": "lastname",
                        "registrationDate": "2018-02-02T02:02:00.000Z"
                    },
                    "name": "service 1",
                    "description": "1 hour session",
                    "price": 300
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
        "message": "service created"
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

### GET /users/{id}

**Input Query**: { id }

**Result:**

    {
        "ok": true,
        "result": {
            "rows": [
                {
                    "_id": "5a9f054f602dd0e540c71bc7",
                    "isProfessional": true,
                    "name": "customer",
                    "lastName": "lastname",
                    "registrationDate": "2018-02-02T02:02:00.000Z"
                },
                {
                    "_id": "5a9f054f602dd0e540c71bc6",
                    "isProfessional": true,
                    "name": "fisio",
                    "lastName": "lastname",
                    "registrationDate": "2018-01-01T01:01:00.000Z"
                }
            ]
        }
    }

### PUT /users

**Input Body**: { email, password, gender, address, phone, birthDate, nationalId }

**Result:**

    {
      "ok": true,
      "message": "user updated!"
    }

### DELETE /users

**Input Body**: { email, password }

**Result:**

    {
      "ok": true,
      "message": "user deleted!"
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
