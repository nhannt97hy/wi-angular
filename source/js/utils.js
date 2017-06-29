'use strict';

function copyProperties(objectDest, objectCopy) {
    for (let prop in objectCopy) {
        objectDest[prop] = objectCopy[prop];
    }

    console.log(objectDest)
}

exports.copyProperties = copyProperties;