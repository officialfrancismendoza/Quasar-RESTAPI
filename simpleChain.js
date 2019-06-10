/* Programmer: Francis Mendoza
 * Purpose: Data Access Layer for application
*/
//--------------------------------------------------------------------
// -- SHA256 LIBRARY --  
const SHA256 = require('crypto-js/sha256');

// -- PERSIST WITH LEVELDB -- 
const levelSandbox = require('./levelSandbox.js');
//--------------------------------------------------------------------
// -- BLOCK CLASS --
class BlockArchetype {
    constructor(data) {
        this.hash = '',
            this.height = 0,
            this.body = data,
            this.time = 0,
            this.previousBlockHash = ''
    }
}

// -- BLOCKCHAIN CLASS -- 
class Blockchain {
    constructor() {
        this.pushGenesisBlock();
    }

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
                let lastBlock = await this.getBlock(currentHeight);

                // Previous block hash
                newBlock.previousBlockHash = lastBlock.hash;

                // Block hash with SHA256 using newBlock and converting to a string
                newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();

                // Adding block object to chain
                let pushCheck = await levelSandbox.addLevelDBData(newBlock.height, JSON.stringify(newBlock).toString());
                console.log(pushCheck);
            }

            else {
                // Block hash with SHA256 using newBlock and converting to a string
                newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();

                // Adding block object to chain
                let pushCheck = await levelSandbox.addLevelDBData(newBlock.height, JSON.stringify(newBlock).toString());
                console.log(pushCheck);
            }
        }

        catch (err) {
            console.log(err);
        }

        finally {
            console.log('>> STEPCHECK: addBlock function.');
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
            let pickBlock = await levelSandbox.getLevelDBData(blockHeight);

            // Return object as a single string
            return JSON.parse(pickBlock);
        }

        catch (err) {
            console.log(err);
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
    async validateChain() {
        var errorLog = [];
        try {
            // Get block height
            let currentHeight = await this.getBlockHeight();

            var counter = 0;
            while (counter <= currentHeight) {
                // Validate block
                let currentReviewBlock = await this.validateBlock(counter);

                if (!currentReviewBlock) {

                    console.log('FAILURE: Block # ' + counter + ' Validation Failed');
                    errorLog.push(counter);
                }

                // Compare blocks hash link
                if (counter > 0) {
                    // Get current and previous block
                    let [lastBlock, block] = await Promise.all([this.getBlock(counter - 1), this.getBlock(counter)]);
                    if (lastBlock.hash != block.previousBlockHash) {
                        console.log('FAILURE: Block # ' + counter + ' previousBlockHash: ' + block.previousBlockHash +
                            ' does not match with Block # ' + (counter - 1) + ' hash: ' + lastBlock.hash);
                        errorLog.push(counter);
                    }
                }

                counter++;
            }

            // Check error length
            if (errorLog.length > 0) {
                console.log('Block errors = ' + errorLog.length);
                console.log('Blocks: ' + errorLog);
                return false;
            }

            else {
                console.log('No errors detected');
                return true;
            }
        }

        catch (err) {
            console.log(err);
        }

        finally {
            console.log('>> STEPCHECK: validateChain function.');
        }
    }
}
//==================================================================
//Checked out