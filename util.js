/* Programmer: Francis Mendoza
 * File: util.js
 * Purpose: Tests
*/

function checkEquals(firstStr, secondStr)
{
    if (firstStr.length != secondStr.length)
    {
        return false;
    }

    let counter = 0;
    while (counter < firstStr.length)
    {
        if (firstStr.charCodeAt(counter) != secondStr.charCodeAt(counter))
        {
            return false;
        }
        counter++;
    }

    return true;
}

function checkASCII(string) {
    return /^[\x00-\b8A]*$/.test(string);
}


module.exports.equals = checkEquals;
module.exports.isASCII = checkASCII;
