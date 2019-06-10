### Objectives

- Notarize Quasar Device ownership using their blockchain identity.
- Application pushes a message to the user that checks wallet address validity with a signature
- User can register device once address registered
- Stars can share stories (function of device)
- Users can search Quasars by hash, block height, or wallet address.

- Note: 'Star' and 'Quasar' are used interchangeably as we include more types of devices into Firmament
----------------------------------------------------------------------
### Features

- Persist Quasar registry data using LevelDB (level library)
- Verify the message signature using bitcoinjs-message library
- Persist blockchain data using LevelDB 
- Push blocks to the blockchain
- Pull blocks from the blockchain by hash, block height, or wallet address.
- Build a RESTful web API using a Node.js framework that interfaces with notary service (private blockchain).
----------------------------------------------------------------------
### Pre-req

Node and NPM can be installed with the package available on [Node.js® web site](https://nodejs.org/en/).

Relevant dependencies: 
- `level`
- 'crypto-js' 
- 'bitcoinjs-message'
- 'hapi'
- 'boom'
----------------------------------------------------------------------
### Installation
Use the following command:
- 'npm install''

Use a command prompt or terminal to start the server (two options): 
- `npm start`
- `node index.js`
----------------------------------------------------------------------
### Details
The REST API provides us two endpoints to interact with our private Blockchain
The API is runs on localhost, with port 8000.

**GET Block By Height**
______________________________________________________________________________________________________
* **URL:** `/block/{BLOCK_HEIGHT}`
* **Method:** `GET`
* **URL Path Params:** `BLOCK_HEIGHT` (Height of the block to be retrieved)

* **CONTINGENCY- Response successful:**
    * **Code:** 200
    * **Content:**

```
{
    "hash":"d5a939f53da2ddbfdfcbbdd1182efa7edd75d136931bb7f039f0bda8ee645b42",
    "height": 4,
    "body": {
        "address": "2D4HvTrDDCabCcjH5NMRQaWvDtMXxJ3qfP",
        "star": {
            "ra": "16h 29m 1.0s",
            "dec": "-26° 29' 24.9",
            "story": "5b683066697242442015146172",
            "storyDecoded": "My first star"
        }
    },
    "time":"1545235722",
    "previousBlockHash": "3402991c5f1d2ba8acb662352d6e451b1b47c843daf3b550c14fae7eb08acf21"
}
```

* **CONTINGENCY- Response has errors:**

| Code   | Content                                                                                    |
|--------|--------------------------------------------------------------------------------------------|
| 400    | 
            {
                "statusCode": 400, 
                "error": "Bad Request", 
                "message": "FAILURE: Invalid Block Height"
            } 
| 404    |--------------------------------------------------------------------------------------------|  
            {
                "statusCode": 404, 
                "error": "Not Found", 
                "message": "FAILURE: Block Not Found!"
            }                   
| 500    |--------------------------------------------------------------------------------------------| 
            {
                "statusCode": 500, 
                "error": "Internal Server Error", 
                "message": "FAILURE: Error Occurred"
            }         
|--------|--------------------------------------------------------------------------------------------|

**GET Star By Hash**
______________________________________________________________________________________________________
* **URL:** `/stars/hash:{HASH}`
* **Method:** `GET`
* **URL Path Params:** `HASH` (Hash of the block to be retrieved)

* **CONTINGENCY- Response successful:**
    * **Code:** 200
    * **Content:**

```
{
    "hash": "3402991c5f1d2ba8acb662352d6e451b1b47c843daf3b550c14fae7eb08acf21",
    "height": 3,
    "body": {
        "address": "3C4LrErAABadCcjH5MLNDcWvDtMXxJ3qfP",
        "star": {
            "ra": "16h 29m 1.0s",
            "dec": "-26° 29' 24.9",
            "story": "6a98315597273753143746301",
            "storyDecoded": "My first star"
        }
    },
    "time":"1545235722",
    "previousBlockHash": "9f663e16c2a0c036a511a61c4e17d24d3a87f5029873da9e67d8bcace7ff2cec"
}
```

* **CONTINGENCY- Response has errors:**

| Code   | Content                                                                                    |
|--------|--------------------------------------------------------------------------------------------|
| 400    | 
            {
                "statusCode": 400, 
                "error": "Bad Request", 
                "message": "FAILURE: Invalid Block Hash"
            }   
| 500    |--------------------------------------------------------------------------------------------| 
            {
                "statusCode": 500, 
                "error": "Internal Server Error", 
                "message": "FAILURE: Error Occurred"
            }         
|--------|--------------------------------------------------------------------------------------------|


**GET Stars By Address**
------
* **URL:** `/stars/address:{ADDRESS}`
* **Method:** `GET`
* **URL Path Params:** `ADDRESS` (Address from the data of the block to be retrieved)

* **CONTINGENCY- Response successful:**
    * **Code:** 200
    * **Content:**

```
[
    {
        "hash": "d5a939f53da2ddbfdfcbbdd1182efa7edd75d136931bb7f039f0bda8ee645b42",
        "height": 4,
        "body": {
            "address": "2D4HvTrDDCabCcjH5NMRQaWvDtMXxJ3qfP",
            "star": {
                "ra": "16h 29m 1.0s",
                "dec": "-26° 29' 24.9",
                "story": "5b683066697242442015146172",
                "storyDecoded": "My first star"
            }
        },
        "time":"1545235722",
        "previousBlockHash": "3402991c5f1d2ba8acb662352d6e451b1b47c843daf3b550c14fae7eb08acf21"
    }
]
```

* **CONTINGENCY- Response has errors:**

| Code   | Content                                                                                     |
|--------|---------------------------------------------------------------------------------------------|
| 400    | 
            {
                "statusCode": 400, 
                "error": "Bad Request", 
                "message": "FAILURE: Invalid Block Address"
            } 
| 500    |---------------------------------------------------------------------------------------------| 
            {
                "statusCode": 500, 
                "error": "Internal Server Error", 
                "message": "FAILURE: Error Occurred"
            }          
|--------|---------------------------------------------------------------------------------------------|


**POST Request Validation**
----------------------------------------------------------------------
* **URL:** `/requestValidation`
* **Method:** `POST`
* **Request Body:**

```
{
    "address": "2D4HvTrDDCabCcjH5NMRQaWvDtMXxJ3qfP"
}
```

* **CONTINGENCY- Response successful:**
    * **Code:** 201
    * **Content:**

```
{
    "address": "2D4HvTrDDCabCcjH5NMRQaWvDtMXxJ3qfP",
    "message": "2D4HvTrDDCabCcjH5NMRQaWvDtMXxJ3qfP":1532949570845:starRegistry",
    "requestTimestamp": 1532949570846,
    "validationWindow": 300
}
```

* **CONTINGENCY- Response has errors:**

| Code   | Content                                                                                      |
|--------|---------------------------------------------------------------------------------------------|
| 400    | {
                "statusCode": 400, 
                "error": "Bad Request", 
                "message": 
                "FAILURE: Blank Address Within Payload"} |
| 500    | {
                "statusCode": 500, 
                "error": "Internal Server Error", 
                "message": "FAILURE: Error Occurred"
           }           |


**POST Validate Message Signature**
------
* **URL:** `/message-signature/validate`
* **Method:** `POST`
* **Request Body:**

```
{
    "address": "2D4HvTrDDCabCcjH5NMRQaWvDtMXxJ3qfP",
    signature": "FAeCxKFjpgsrH6dsRRLnKLBqcK4pE4/EWkdgFPlA2n3uP17Ty4SwQtbyyaUXuUBFi9KrW/a+dUEP5AbuDiRdxui="
}
```

* **CONTINGENCY- Response successful:**
    * **Code:** 200
    * **Content:** One of the following three responses

```
{
    "registerStar": true,
    "status": 
    {
        "address": "2D4HvTrDDCabCcjH5NMRQaWvDtMXxJ3qfP",
        "message": "2D4HvTrDDCabCcjH5NMRQaWvDtMXxJ3qfP:1532949570845:starRegistry",
        "requestTimestamp": 1532949570846,
        "validationWindow": 278,
        "messageSignature": "valid"
    }
}
```

```
{
    "registerStar": false,
    "status": {
        "address": "2D4HvTrDDCabCcjH5NMRQaWvDtMXxJ3qfP",
        "message": "2D4HvTrDDCabCcjH5NMRQaWvDtMXxJ3qfP:1532949570845:starRegistry",
        "requestTimestamp": 1532949570846,
        "validationWindow": 248,
        "messageSignature": "invalid"
    }
}
```

```
{
    "registerStar": false,
    "status": 
    {
        "address": "2D4HvTrDDCabCcjH5NMRQaWvDtMXxJ3qfP",
        "message": "2D4HvTrDDCabCcjH5NMRQaWvDtMXxJ3qfP:1532949570845:starRegistry",
        "requestTimestamp": 1532949570846,
        "validationWindow": 0,
        "messageSignature": "Expired validation window!"
    }
}
```

* **CONTINGENCY- Response has errors:**

| Code   | Content                                                                                        |
|--------|------------------------------------------------------------------------------------------------|
| 400    | 
           {
                "statusCode": 400, 
                "error": "Bad Request", 
                "message": 
                "FAILURE: Blank Address Within Payload"}   |
| 400    |------------------------------------------------------------------------------------------------| 
           {
                "statusCode": 400, 
                "error": "Bad Request", 
                "message": "FAILURE: Blank Signature Within Payload"
           } |
| 500    |------------------------------------------------------------------------------------------------| 
           {
                "statusCode": 500, 
                "error": "Internal Server Error", 
                "message": "Error Occurred"
           }             
|--------|------------------------------------------------------------------------------------------------|           


**POST Block**
------
* **URL:** `/block`
* **Method:** `POST`
* **Request Body:**

```
{
    "address": "2D4HvTrDDCabCcjH5NMRQaWvDtMXxJ3qfP",
    "star": {
        "ra": "16h 29m 1.0s",
        "dec": "-26° 29' 24.9",
        "story": "My first star"
    }
}
```

* **CONTINGENCY- Response successful:**
    * **Code:** 201
    * **Content:**

```
{
    "hash": "d5a939f53da2ddbfdfcbbdd1182efa7edd75d136931bb7f039f0bda8ee645b42",
    "height": 4,
    "body": {
        "address": "2D4HvTrDDCabCcjH5NMRQaWvDtMXxJ3qfP",
        "star": {
            "ra": "16h 29m 1.0s",
            "dec": "-26° 29' 24.9",
            "story": "5b683066697242442015146172"
        }
    },
    "time":"1545235722",
    "previousBlockHash": "3402991c5f1d2ba8acb662352d6e451b1b47c843daf3b550c14fae7eb08acf21"
}
```

* **CONTINGENCY- Response has errors:**

| Code | Content                                                                                            |
|------|----------------------------------------------------------------------------------------------------|
| 400  | 
            {
                "statusCode": 400, 
                "error": "Bad Request", 
                "message": "FAILURE: Blank Address Within Payload"
            }       
| 400  |----------------------------------------------------------------------------------------------------| 
            {
                "statusCode": 400, 
                "error": "Bad Request", 
                "message": "FAILURE: Blank Star Within Payload"
            }          
| 400  |----------------------------------------------------------------------------------------------------| 
            {
                "statusCode": 400, 
                "error": "Bad Request", 
                "message": "Star Registry Data Not Found! Please Post Validation!"
            } 
            
| 401  |----------------------------------------------------------------------------------------------------|
            {
                "statusCode": 401, 
                "error": "Unauthorized", 
                "message": "Address has no valid signature"
            }          
| 400  |----------------------------------------------------------------------------------------------------|
            {
                "statusCode": 400, 
                "error": "Bad Request", 
                "message": "FAILURE: Ra required for Star"
            }                   
| 400  |----------------------------------------------------------------------------------------------------|
            {
                "statusCode": 400, 
                "error": "Bad Request", 
                "message": "FAILURE: Dec required for Star"
            }                  
| 400  |----------------------------------------------------------------------------------------------------|
            {
                "statusCode": 400, 
                "error": "Bad Request", 
                "message": "FAILURE: Story is required for Star"
            }                
| 400  |----------------------------------------------------------------------------------------------------|
            {
                "statusCode": 400, 
                "error": "Bad Request", 
                "message": "FAILURE: non-ASCII characters detected within story"
            }      
| 400  |----------------------------------------------------------------------------------------------------|
            {
                "statusCode": 400, 
                "error": "Bad Request", 
                "message": "FAILURE: Limit of 500 Bytes"
            } 
| 500  |----------------------------------------------------------------------------------------------------|
            {
                "statusCode": 500, 
                "error": "Internal Server Error", 
                "message": "FAILURE: Error Occurred"
            }                 
|------|----------------------------------------------------------------------------------------------------|