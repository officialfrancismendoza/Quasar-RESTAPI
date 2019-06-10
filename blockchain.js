/* Programmer: Francis Mendoza
 * File: blockchain.js
 * Purpose: Blockchain Helper Methods
*/
//=============================================================================
// -- BLOCK CLASS (CALL THROUGH DEPENDENCY) --
var BlockArchetype = require('./blockArchetype.js');

// -- SHA256 LIBRARY --  
const SHA256 = require('crypto-js/sha256');

// -- PERSIST WITH LEVELDB -- 
const levelSandbox = require('./levelSandbox.js');

//(!!!) nA4: Added util class 
// -- UTIL CLASS -- 
const util = require('./util.js');

// -- BLOCKCHAIN CLASS -- 
class Blockchain {
    constructor() {
        this.pushGenesisBlock();
    }
//=======================================================================================
    // -- PUSHGENESISBLOCK FUNCTION -- 
    async pushGenesisBlock() {
        try {
            // Get block height
            let height = await this.getBlockHeight();

            // Check if start of program
            if (height === -1) {
                this.addBlock(new BlockArchetype('Genesis Block'));
                console.log('SUCCESS: Genesis Block pushed.');
            }
        }

        catch (err) {
            console.log('FAILURE: Error encountered while attempting to push: ' + err);
        }

        finally {
            console.log('>> STEPCHECK: pushGenesis function.');
        }
    }
    //--------------------------------------------------------------------
    // -- ADDBLOCK FUNCTION -- 
    async addBlock(newBlock) {
        try {
            // Block height
            let currentHeight = await this.getBlockHeight();

            // New Block height
            newBlock.height = currentHeight + 1;

            // UTC timestamp
            newBlock.time = new Date().getTime().toString().slice(0, -3);
            if (newBlock.height > 0) {
                // Previous Block
                let previousBlock = await this.getBlock(currentHeight);

                // Previous block hash
                newBlock.previousBlockHash = previousBlock.hash;

                // Block hash with SHA256 using newBlock and converting to a string
                newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();

                // Adding block object to chain
                let pushCheck = await levelSandbox.addLevelDBData(newBlock.height, JSON.stringify(newBlock).toString());
                console.log('Pushcheck = ' + pushCheck);

                return newBlock;
            }

            else {
                // Block hash with SHA256 using newBlock and converting to a string
                newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();

                // Adding block object to chain
                let pushCheck = await levelSandbox.addLevelDBData(newBlock.height, JSON.stringify(newBlock).toString());
                console.log('Pushcheck = ' + pushCheck);

                return newBlock;
            }
        }

        catch (err) {
            console.log(err);
            return err;
        }

        finally {
            console.log('>> STEPCHECK: addBlock function.');
        }
    }
    //--------------------------------------------------------------------
    //(!!!) nA4: New method 
    // -- GETBLOCKBYHASH FUNCTION -- 
    async getBlockByHash(hash) {
        try {
            // Get block height
            let height = await this.getBlockHeight();

            for (var i = 1; i <= height; i++)
            {
                let targetHashBlock = await this.getBlock(i);

                // Check for matching hash
                if (targetHashBlock.hash == hash)
                {
                    // Decode 
                    targetHashBlock.body.star.storyDecoded = Buffer.from(targetHashBlock.body.star.story, 'hex').toString()
                    // Return 
                    return targetHashBlock;
                }
            }

            // If match unsuccessful
            let emptyBlock = {};
            return emptyBlock;
        }

        catch (err) {
            console.log(err);
            return err;
        }

        finally {
            console.log('>> STEPCHECK: getBlockByHash function.');
        }
    }    
    //--------------------------------------------------------------------
    //(!!!) nA4: New Method
    // -- GETBLOCKBYADDRESS FUNCTION --
    // Get block by address
    async getBlockByAddress(address) {
        try {
            // Blocks to return
            const targetAddressBlock = [];

            // Get block height
            let height = await this.getBlockHeight();

            for (var j = 1; j <= height; j++)
            {
                let targetAddressBlock = await this.getBlock(j);

                // Check for matching address
                if (targetAddressBlock.body.address == address)
                {
                    // Decode
                    targetAddressBlock.body.star.storyDecoded = Buffer.from(targetAddressBlock.body.star.story, 'hex').toString()
                    // Push
                    blocks.push(targetAddressBlock);
                }
            }

            // Return blocks
            return targetAddressBlock;
        }

        catch (err) {
            console.log(err);
            return err;
        }

        finally {
            console.log('>> STEPCHECK: getBlockByAddress function.');
        }
    }
    //--------------------------------------------------------------------
    // -- GETBLOCKHEIGHT FUNCTION --
    async getBlockHeight() {
        try {
            // Get height
            return await levelSandbox.getHeight();
        }

        catch (err) {
            console.log(err);
        }

        finally {
            console.log('>> STEPCHECK: getBlockHeight function.');
        }
    }
    //--------------------------------------------------------------------
    // -- GETBLOCK FUNCTION -- 
    async getBlock(blockHeight) {
        try {
            // Get block from Level db

            //(!!!) nA4: Comment out these lines 
            //let pickBlock = await levelSandbox.getLevelDBData(blockHeight);
            // Return object as a single string
            //return JSON.parse(pickBlock);

            //(!!!) nA4: New Logic
            //Changed to JSON format
            let levelData = await levelSandbox.getLevelDBData(blockHeight);

            //Check Genesis Block
            let targetHeightBlock = JSON.parse(levelData);

            //Check if genesis block as story won't be present
            if (blockHeight != 0) {
                //Convert story from hex encoding
                targetHeightBlock.body.star.storyDecoded = Buffer.from(targetHeightBlock.body.star.story, 'hex').toString()
            }

            //Object casted as a string
            return targetHeightBlock;
        }

        catch (err) {
            console.log(err);
            return err;
        }

        finally {
            console.log('>> STEPCHECK: getBlock function.');
        }
    }
    //--------------------------------------------------------------------
    // -- VALIDATEBLOCK FUNCTION -- 
    async validateBlock(blockHeight) {
        try {
            // Get block
            let currentBlock = await this.getBlock(blockHeight);

            // Get block hash
            let blockHash = currentBlock.hash;

            // Remove block hash to test block integrity
            currentBlock.hash = '';

            // Generate block hash
            let validBlockHash = SHA256(JSON.stringify(currentBlock)).toString();

            let changeBool = true;

            //Boolean value for switch-case
            if (blockHash === validBlockHash) {
                changeBool = true;
            }

            else if (blockHash !== validBlockHash) {
                changeBool = false;
            }

            // Switch Statement
            switch (changeBool) {
                // changeBool === true
                case true:
                    console.log('SUCCESS: Block # ' + blockHeight + ' is valid.');
                    return true;

                // changeBool === false 
                case false:
                    console.log('FAILURE: Block # ' + blockHeight + ' is invalid.');
                    console.log('Actual Hash: ' + blockHash + ' <> ' + validBlockHash);
                    return false;

                // All other cases 
                default:
                    console.log('Other Exception');
                    return false;
            }
        }

        catch (err) {
            console.log(err);
        }

        finally {
            console.log('>> STEPCHECK: validateBlock function.');
        }
    }
    //--------------------------------------------------------------------
    // -- VALIDATE BLOCKCHAIN FUNCTION -- 
    // >>> CRITERIA #5: Modify validateChain to store within levelDB
    async validateChain() {
        var errorLog = [];

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            try
            {
                // Get 
                let currentHeight = await this.getBlockHeight();

                for (var k = 0; k <= currentHeight; k++)
                {
                    // Validate block
                    let currentRevBlock = await this.validateBlock(k);

                    if (!currentRevBlock)
                    {
                        console.log('FALURE: Block # ' + k + ' failed validation');
                        errorLog.push(k);
                    }

                    // Compare blocks hash link
                    if (k > 0)
                    {
                        // Get current and previous block
                        let [previousBlock, block] = await Promise.all([this.getBlock(k - 1), this.getBlock(k)]);
                        if (previousBlock.hash != block.previousBlockHash) {
                            console.log('FAILURE: Block # ' + k + ' previousBlockHash: ' + block.previousBlockHash +
                                ' mismatches with Block # ' + (k - 1) + ' hash: ' + previousBlock.hash);
                            errorLog.push(k);
                        }
                    }
                }

                if (errorLog.length >= 1)
                {
                    console.log('FAILURE: Block errors = ' + errorLog.length);
                    console.log('FAILURE: Blocks: ' + errorLog);
                    return false;
                }

                else
                {
                    console.log('No errors detected');
                    return true;
                }
            }
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        catch (err) {
            console.log(err);
        }

        finally {
            console.log('>> STEPCHECK: validateChain function.');
        }
    }
}

module.exports = new Blockchain();
//Checked out