/* Programmer: Francis Mendoza
 * File: starRegistryLevel.js
 * Purpose: Interact with star registry
*/
//=============================================================================

//Relevant Dependencies 
const starRegistryDB = './starRegistryData';

const levelSandBoxVar = require('level');

const db = levelSandBoxVar(starRegistryDB);

const boom = require('boom');


// Get star with key
async function getStarRegistryData(key) {
    return new Promise(function(resolve, reject) {
        db.get(key, function(err, value) {
            if (err) {
                console.log('Not found!', err);
                reject(boom.notFound('FAILURE: Star Registry Data Not Found! Please Post Validation!'));
            }

            else if (value == undefined) {
                console.log('Undefined');
                reject(boom.badRequest('FAILURE: Star Registry Data Undefined'));
            }

            else {
                console.log(value);
                resolve(value);
            }
        });
    });
}

// Push star to levelDB. Rep as a key/val pair
async function addStarRegistryData(key, value) {
    return new Promise(function (resolve, reject) {
        db.put(key, value, function (err) {
            if (err) {
                console.log('FAILURE: Address # ' + key + ' Submission failed', err);
                reject(err);
            }

            else {
                resolve('SUCCESS: Added Address # ' + key + ', value: ' + value);
            }
        });
    });
}

// Delete star with key
async function deleteStarRegistryData(key) {
    return new Promise(function(resolve, reject) {
        try {
            db.del(key);
            resolve('Success');
        }

        catch (err) {
            console.log('FAILURE: Error Detected: ' + err);
            reject(err);
        }

        finally {
            console.log('>> STEPCHECK: deleteStarRegistryData function.');
        }
    });
}

module.exports.getStarRegistryData = getStarRegistryData;
module.exports.addStarRegistryData = addStarRegistryData;
module.exports.deleteStarRegistryData = deleteStarRegistryData;

//Checked out