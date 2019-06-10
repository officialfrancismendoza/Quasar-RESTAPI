/* Programmer: Francis Mendoza
 * File: starValidation.js
 * Purpose: Validate star data
*/
//==================================================================================
//Relevant Dependencies 
var starRegistryLevel = require('./starRegistryLevel.js');

const bitcoinMessage = require('bitcoinjs-message');

// Window time limit in seconds
const WINDOW_SECONDS = 60 * 5;

// Window time limit in milliseconds
const WINDOW_MILLISECONDS = 1000 * 60 * 5;

function getCurrentTimestamp() {
    return new Date().getTime();
}

function createMessage(address) {
    return `${address}:${getCurrentTimestamp()}:starRegistry`;
}
//-----------------------------------------------------------------------------------
//Gets star with address
async function getStarRegistryData(address)
{
    let dataParam;
    try {
        // Get data from star registry level db
        dataParam = await starRegistryLevel.getStarRegistryData(address);
    }

    catch (err) {
        return new Promise(function (resolve, reject) {
            console.log('FAILURE: Error Detected in getStarRegistryData: ' + err);
            reject(err);
        });
    }

    return new Promise(function (resolve, reject) {
        try {
            try {
                const parsedData = JSON.parse(dataParam);

                // Calculate time passed from the original request
                const elapsedTime = Date.now() - parsedData.requestTimestamp;

                // Expired validation window
                if (elapsedTime > WINDOW_MILLISECONDS) {
                    resolve(createStarRegistryData(address));
                }

                else {
                    // Generate star registry data from the level db data
                    const starRegistryData = {
                        address: parsedData.address,
                        message: parsedData.message,
                        requestTimestamp: parsedData.requestTimestamp,
                        validationWindow: elapsedTime
                    };
                    resolve(starRegistryData);
                }
            }

            catch (error) {
                reject(error);
            }
        }

        catch (err) {
            // Some error
            reject(err);
        }
    });
}
//-----------------------------------------------------------------------------------
//Create star using address, data parameters 
async function createStarRegistryDataWithInput(address, data)
{
    // Add data to star registry level db
    await starRegistryLevel.addStarRegistryData(address, JSON.stringify(data));
    return data;
}
//-----------------------------------------------------------------------------------
//Create star using address
async function createStarRegistryData(address)
{
    // Create message using address
    const message = createMessage(address);

    // Create data using address and message
    const data =
    {
        address: address,
        message: message,
        requestTimestamp: getCurrentTimestamp(),
        validationWindow: WINDOW_SECONDS
    }

    // Add data to star registry level db
    await starRegistryLevel.addStarRegistryData(address, JSON.stringify(data));
    return data;
}
//-----------------------------------------------------------------------------------
//Validates message signature
async function validateMessageSignature(address, signature)
{
    let dataParam2;
    try {
        // Get data from star
        dataParam2 = await starRegistryLevel.getStarRegistryData(address);
    }

    catch (err)
    {
        return new Promise(function (resolve, reject)
        {
            reject(err);
        });
    }

    return new Promise(function (resolve, reject)
    {
        try
        {
            const parsedData2 = JSON.parse(dataParam2);

            // If signature is valid, data is returned
            if (parsedData2.messageSignature == 'valid')
            {
                const validatedResponse = {
                    registerStar: true,
                    status: parsedData2
                };
                resolve(validatedResponse);
            }

            else
            {
                // Calculate time passed from original request
                const elapsedTime = Date.now() - parsedData2.requestTimestamp;

                 // Bool for expired window 
                let sigValBool = false;
               
                if (elapsedTime > WINDOW_MILLISECONDS)
                {
                    parsedData2.validationWindow = 0;
                    parsedData2.messageSignature = 'Expired validation window!'

                    // Create star registry data
                    createStarRegistryDataWithInput(address, parsedData2);
                }

                else
                {
                    // Verify if signature is valid using bitcoin-message library
                    try {
                        sigValBool = bitcoinMessage.verify(parsedData2.message, address, signature);
                    }

                    catch (err)
                    {
                        sigValBool = false;
                    }

                    // Add message signature validation
                    if (sigValBool) {
                        parsedData2.messageSignature = 'valid';
                    }

                    else
                    {
                        parsedData2.messageSignature = 'invalid';
                    }

                    // Calculate validation window timeframe
                    parsedData2.validationWindow = Math.floor((WINDOW_MILLISECONDS - elapsedTime) / 1000);
                    // Create star registry data
                    createStarRegistryDataWithInput(address, parsedData2);
                }

                // Create response
                const response = {
                    registerStar: sigValBool,
                    status: parsedData2
                };
                // Return response
                resolve(response);
            }
        }

        catch (err)
        {
            console.log('FAILURE: Error while validating message signature: ' + err);
            reject(err);
        }
    });
}
//-----------------------------------------------------------------------------------
//Invalidates address
async function invalidateAddress(address) {
    let resultBool = false;
    try {
        // Delete address from star registry data
        await starRegistryLevel.deleteStarRegistryData(address);
        resultBool = true;
    }

    catch (err)
    {
        console.log(err);
        resultBool = false;
    }

    return new Promise(function (resolve, reject)
    {
        if (resultBool)
        {
            resolve(resultBool);
        }

        else
        {
            reject(resultBool);
        }
    });
}
//-----------------------------------------------------------------------------------
//Checks if message signature is valid with address
async function isValidMessageSignature(address) {
    let dataParam3;

    try {
        // Get data from star registry level db
        dataParam3 = await starRegistryLevel.getStarRegistryData(address);
    }

    catch (err) {
        return new Promise(function (resolve, reject) {
            reject(err);
        });
    }

    return new Promise(function (resolve, reject) {
        try {
            const parsedData3 = JSON.parse(dataParam3);

            // Check if message signature is valid
            if (parsedData3.messageSignature == 'valid') {
                resolve(true);
            }

            else {
                resolve(false);
            }
        }

        catch (err) {
            console.log(err);
            reject(err);
        }
    });
}
//-----------------------------------------------------------------------------------
module.exports.getStarRegistryData = getStarRegistryData;
module.exports.createStarRegistryData = createStarRegistryData;
module.exports.createStarRegistryDataWithInput = createStarRegistryDataWithInput;
module.exports.validateMessageSignature = validateMessageSignature;
module.exports.invalidateAddress = invalidateAddress;
module.exports.isValidMessageSignature = isValidMessageSignature;