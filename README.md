
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

**Input Body**: { email, password }

**Result:** 

    {
      "ok": true, 
      "token": "..."
    }

### DELETE /users

**Input Body**: { email, password }

**Result:** 

    {
      "ok": true, 
      "message": "user deleted!"
    }


### PUT /users

**Input Body**: { idUser, email, password, gender, address, phone, birthDate, nationalId }

**Result:** 

    {
      "ok": true, 
      "message": "user updated!"
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
          "isConfirmed": false,
          "isCancelled": false,
          "date": "1520102376071",
          "latitude": 40.4166159,
          "longitude": -3.703788,
          "address": "40.4166159, -3.703788",
          "extraInfo": "Tercero izquierda",
          "__v": 0
      }
    }

### GET /appointments/{Date}

**Input Query**: { date }

**Result:**

{
    "ok": true,
    "result": {
        "_id": "5a9aec0f15c5371f1159c994",
        "idService": 1,
        "idCustomer": 1,
        "idProfessional": 1,
        "idAppointment": 1,
        "isConfirmed": false,
        "isCancelled": false,
        "date": "2018-03-03T19:17:56.071Z",
        "latitude": 40.4166159,
        "longitude": -3.703788,
        "address": "myAddress",
        "extraInfo": "Segundo izquierda",
        "__v": 0
    }
}

### GET /appointments/byId/{idAppointment}

**Input Query**: { idAppointment }

**Result:**

{
    "ok": true,
    "result": {
        "_id": "5a9aec0f15c5371f1159c994",
        "idService": 1,
        "idCustomer": 1,
        "idProfessional": 1,
        "idAppointment": 1,
        "isConfirmed": false,
        "isCancelled": false,
        "date": "2018-03-03T19:17:56.071Z",
        "latitude": 40.4166159,
        "longitude": -3.703788,
        "address": "myAddress",
        "extraInfo": "Segundo izquierda",
        "__v": 0
    }
}

### POST /appointments

Save a new appointment.

**Input body:**

{ idService, idCustomer, idProfessional, idAppointment, isConfirmed, isCancelled, date, latitude,
longitude, address, extraInfo }

**Result:** 

    {
      "ok": true,
      "created": {
        "__v": 0,
        ...
      }
    }

### PUT /appointments/{idAppointment}

Update an existing appointment.
In the body is only sent the information you want to update.

**Input body:**

{ isConfirmed, isCancelled, date, latitude, longitude, address, extraInfo }

**Result:** 

    {
        "ok": true,
        "message": "appointment updated"
    }

### DELETE /appointments/{idAppointment}

Delete an existing appointment.

**Input body:**

**Result:** 

    {
        "ok": true,
        "message": "appointment deleted"
    }


### GET /products

**Input Query**: 

**Result:** 

    {
        "ok": true,
        "result": {
            "rows": [
                {
                    "_id": "5a9aec0f15c5371f1159c99a",
                    "idProduct": 1,
                    "name": "product 1",
                    "description": "1 hour session",
                    "price": 30,
                    "__v": 0
                },
                {
                    "_id": "5a9aec0f15c5371f1159c99b",
                    "idProduct": 2,
                    "name": "product 2",
                    "description": "2 hour session",
                    "price": 50,
                    "__v": 0
                }
            ]
        }
    }

### GET /products/{idProduct}

**Input Query**: { idProduct }

**Result:**

    {
        "ok": true,
        "result": {
            "_id": "5a9aec0f15c5371f1159c99a",
            "idProduct": 1,
            "name": "product 1",
            "description": "1 hour session",
            "price": 30,
            "__v": 0
        }
    }

### POST /products

Save a new product.

**Input body:**

{ idProduct, name, description, price }

**Result:** 

    {
      "ok": true,
      "created": {
        "__v": 0,
        ...
      }
    }

### PUT /products/{idProduct}

Update an existing product.
In the body is only sent the information you want to update.

**Input body:**

{ name, description, price }

**Result:** 

    {
        "ok": true,
        "message": "product updated"
    }

### DELETE /products/idProduct

Delete an existing product.

**Input body:**

**Result:** 

    {
        "ok": true,
        "message": "product deleted"
    }

### GET /services

**Input Query**: 

**Result:** 

    {
        "ok": true,
        "result": {
            "rows": [
                {
                    "_id": "5a9aec0f15c5371f1159c99c",
                    "idService": 1,
                    "name": "service 1",
                    "description": "1 hour session",
                    "price": 30,
                    "__v": 0
                },
                {
                    "_id": "5a9aec0f15c5371f1159c99d",
                    "idService": 2,
                    "name": "service 2",
                    "description": "2 hour session",
                    "price": 50,
                    "__v": 0
                }
            ]
        }
    }

### GET /services/{idService}

**Input Query**: { idService }

**Result:**

    {
        "ok": true,
        "result": {
            "_id": "5a9aec0f15c5371f1159c99d",
            "idService": 2,
            "name": "service 2",
            "description": "2 hour session",
            "price": 50,
            "__v": 0
        }
    }

### POST /services

Save a new service.

**Input body:**

{ idService, name, description, price }

**Result:** 

    {
      "ok": true,
      "created": {
        "__v": 0,
        ...
      }
    }

### PUT /services/{idService}

Update an existing service.
In the body is only sent the information you want to update.

**Input body:**

{ name, description, price }

**Result:** 

    {
        "ok": true,
        "message": "service updated"
    }

### DELETE /services/{idService}

Delete an existing service.

**Input body:**

**Result:** 

    {
        "ok": true,
        "message": "service deleted"
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
