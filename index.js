/* Programmer: Francis Mendoza
 * File: index.js
 * Purpose: Contains GET and POST Endpoints
*/
//=============================================================================
'use strict';

var BlockArchetype = require('./blockArchetype.js');

// (!!!) nA4: Added new dependency- util 
const util = require('./util.js');
const starValidation = require('./starValidation.js')

const Blockchain = require('./blockchain.js');

const boom = require('boom');
const hapi = require('hapi');

// Server creation 
const server = hapi.server({
    host: 'localhost',
    port: 8000
});
//----------------------------------------------------------------
var pointHandle =
{
    // curl http://localhost:8000/block/1
    // >>> CRITERIA #6: GET Endpoint by height <<< 
    getBlock: async function (request, reply)
    {
        console.log('GET block with BLOCK_HEIGHT: ' + request.params.BLOCK_HEIGHT);
        // Validate if BLOCK_HEIGHT is a number

        if (isNaN(request.params.BLOCK_HEIGHT))
        {
            // Bad Request
            return boom.badRequest('FAILURE: Block Height Invalid');
        }

        try
        {
            // Get block and return it
            return await Blockchain.getBlock(request.params.BLOCK_HEIGHT);
        }

        catch (err)
        {
            console.log(err);
            if (boom.isBoom(err))
            {
                // Not Found
                return err;
            }

            else
            {
                // Error
                return boom.badImplementation('FAILURE: Error Occurred');
            }
        }

        finally
        {
            console.log('>> STEPCHECK: getBlock endpoint.');
        }
    },
    //----------------------------------------------------------------
    //(!!!) nA4: New Method
    // >>> CRITERIA #5: GET Endpoint that searches by address <<< 
    getStarsByAddress: async function (request, reply) {
        console.log('GET block with BLOCK_ADDRESS: ' + request.params.BLOCK_ADDRESS);
        // Validate if BLOCK_HASH is not empty

        if (util.checkEquals(request.params.BLOCK_ADDRESS, '')) {
            // Bad Request
            let rejectAddress = boom.badRequest('Please Pass A Valid Block Address');
            return rejectAddress;
        }

        try {
            // Get block 
            return await Blockchain.getBlockByAddress(request.params.BLOCK_ADDRESS);
        }

        catch (err) {
            console.log(err);
            // Error
            return boom.badImplementation('Error Occurred');
        }

        finally {
            console.log('>> STEPCHECK: getStarsByAddress endpoint.');
        }
    },
    //----------------------------------------------------------------
    //(!!!) nA4: New Method
    // >>> CRITERIA #4: GET Endpoint that searches by Hash <<< 
    getStarByHash: async function (request, reply)
    {
        console.log('GET block with BLOCK_HASH: ' + request.params.BLOCK_HASH);
        // Validate if BLOCK_HASH is not empty

        if (util.checkEquals(request.params.BLOCK_HASH, '')) {
            // Bad Request
            return boom.badRequest('FAILURE: Invalid Block Hash');
        }

        try
        {
            // Get block 
            return await Blockchain.getBlockByHash(request.params.BLOCK_HASH);
        }

        catch (err)
        {
            console.log(err);
            // Error
            return boom.badImplementation('FAILURE: Error Occurred');
        }

        finally {
            console.log('>> STEPCHECK: getStarByHash endpoint.');
        }
    },
    //==================================================================================================
    //(!!!) nA4: Minor additions to logic (post endpoints)
    // curl http://localhost:8000/block -X POST -H 'Content-Type: application/json' -d '{"body":"Block Body Contents"}'
    // >>> CRITERIA #1: POST ENDPOINT <<< 
    postRequestValidation: async function (request, reply)
    {
        console.log('POST request validation: ' + JSON.stringify(request.payload));

        if (!request.payload.hasOwnProperty('address'))
        {
            // Bad Request
            return boom.badRequest('FAILURE: Blank Address Within Payload');
        }

        // Get address
        const address = request.payload.address;

        try
        {
            // Get data
            const postRVData = await starValidation.getStarRegistryData(address);

            // Return response
            return reply.response(postRVData).code(201);
        }

        catch (err)
        {
            console.log(err);
            if (boom.isBoom(err))
            {
                // Create data
                const postRVData2 = await starValidation.createStarRegistryData(address);

                // Return response
                return reply.response(postRVData2).code(201);
            }
            
            return boom.badImplementation('FAILURE: Error Occurred');
        }

        finally
        {
            console.log('>> STEPCHECK: postRequestValidation endpoint.');
        }
    },
    //----------------------------------------------------------------
    //(!!!) nA4: new method
    // >>> CRITERIA #2: POST Endpoint validate Message Signature <<<
    validateMessageSignature: async function (request, reply)
    {
        console.log('POST validate message signature: ' + JSON.stringify(request.payload));

        // Bad Requests
        if (!request.payload.hasOwnProperty('address'))
        {
            return boom.badRequest('FAILURE: Blank Address Within Payload');
        }

        if (!request.payload.hasOwnProperty('signature'))
        {
            return boom.badRequest('FAILURE: Blank Signature Within Payload');
        }

        try
        {
            // Get address
            const address = request.payload.address;

            // Get signature
            const signature = request.payload.signature;

            // Validate signature
            const data = await starValidation.validateMessageSignature(address, signature);

            // Return  response
            return data;

            //Missing error code? 200?
        }

        catch (err)
        {
            console.log(err);
            return boom.badImplementation('FAILURE: Error Occurred');
        }

        finally
        {
            console.log('>> STEPCHECK: validateMessageSignature endpoint.');
        }
    },
    //----------------------------------------------------------------
    //(!!!) nA4: postBlock method
    // >>> CRITERIA #3: POST Endpoint w star info <<< 
    postBlock: async function (request, reply)
    {
        console.log('POST block: ' + JSON.stringify(request.payload));

        // Bad Requests
        if (!request.payload.hasOwnProperty('address'))
        {
            return boom.badRequest('FAILURE: Blank Address Within Payload');
        }

        if (!request.payload.hasOwnProperty('star'))
        {
            return boom.badRequest('FAILURE: Blank Star Within Payload');
        }

        try
        {
            // Get address
            const address = request.payload.address;

            // Check if the address has validate message signature
            const validatedSignature = await starValidation.isValidMessageSignature(address);
            if (!validatedSignature) {
                return boom.unauthorized('FAILURE: Address contains invalid signature');
            }

            // Get star
            let pulledStar = request.payload.star;

            // Validate star
            if (!pulledStar.hasOwnProperty('ra')) {
                return boom.badRequest('FAILURE: Ra required within Star');
            }
            if (!pulledStar.hasOwnProperty('dec')) {
                return boom.badRequest('FAILURE: Dec required within Star');
            }
            if (!pulledStar.hasOwnProperty('story')) {
                return boom.badRequest('FAILURE: Story required within Star');
            }
            if (!util.checkASCII(pulledStar.story)) {
                return boom.badRequest('FAILURE: non-ASCII characters detected within story');
            }
            if (pulledStar.story.length > 500) {
                return boom.badRequest('FAILURE: Story exceeds 500 bytes');
            }

            // Star story encoding
            pulledStar.story = Buffer.from(pulledStar.story).toString('hex');

            // Create block
            const body = {
                address: address,
                star: pulledStar
            };

            // Push block to chain
            const prospectiveBlock = await Blockchain.addBlock(new BlockArchetype(body));

            // Invalidate address 
            const invalidatedAddress = await starValidation.invalidateAddress(address);
            if (!invalidatedAddress)
            {
                // Error
                return boom.badImplementation('Error Occurred');
            }

            // Return block
            return reply.response(prospectiveBlock).code(201);
        }

        catch (err)
        {
            console.log(err);
            if (boom.isBoom(err))
            {
                return boom.badRequest(err);
            }
            
            return boom.badImplementation('FAILURE: Error Occurred');
        }

        finally
        {
            console.log('>> STEPCHECK: postBlock endpoint.');
        }
    }

}
//----------------------------------------------------------------
server.route([
    // Get Block at a particular height
    {
        path: '/block/{BLOCK_HEIGHT}',
        method: 'GET',
        handler: pointHandle.getBlock
    },

    // GET Block with Address
    {
        path: '/stars/address:{BLOCK_ADDRESS}',
        method: 'GET',
        handler: pointHandle.getStarsByAddress
    },

    // GET Block with Hash
    {
        path: '/stars/hash:{BLOCK_HASH}',
        method: 'GET',
        handler: pointHandle.getStarByHash
    },
    //----------------------------------------------------------------
    //(!!!) nA4: Added new server.route stuff
    // POST Block with Star Object
    {
        path: '/block',
        method: 'POST',
        handler: pointHandle.postBlock
    },

    // POST Block with Request Validation
    {
        path: '/requestValidation',
        method: 'POST',
        handler: pointHandle.postRequestValidation
    },

    // POST Block with Message Signature Validation
    {
        path: '/message-signature/validate',
        method: 'POST',
        handler: pointHandle.validateMessageSignature
    }
]);

const startServer = async () => {
    try {
        await server.start();
        console.log('SUCCESS: Server running at: ' + server.info.uri);
    }

    catch (err) {
        console.log('FAILURE: Error while starting server: ', err);
    }

    finally {
        console.log('>> STEPCHECK: start function.');
    }
};

process.on('unhandledRejection', (err) => {
    console.log(err);
    process.exit(1);
});

// Start the server
startServer();

//(???)Checked out?