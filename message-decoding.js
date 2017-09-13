#!/usr/bin/env node

// generate next key of the sequence: 0, 00, 01, 10, 000, 001 , ...
var generateNextKey = function (currentKey) {
    var currentLength = currentKey.length;
    var nextKey = (parseInt(currentKey, 2) + 1).toString(2);
    nextKey = ("0".repeat(currentLength) + nextKey).slice(-currentLength);
    nextKey = /^[1]+$/.test(nextKey) ? "0".repeat(currentLength + 1) : nextKey;
    return nextKey;
};

// a payload contains multiple messages
var splitPayload = function (payload) {
    payload = payload.replace(/\n/g, "");
    var messageRe = /[^01]+[01]+/g;
    return payload.match(messageRe);
};

// a message consists of a header and a encoded body
var splitMessage = function (message) {
    return {
        header: message.match(/[^01]+/)[0],
        encoded: message.match(/[01]+/)[0]
    };
};

// generate key-char map, Ex: { '0': '$', '10': '*', '00': '#', '01': '*', '000': '\\' }
var generateKeyMap = function (header) {
    var key = "0";
    return Array.from(header).reduce(function (keyMap, char) {
        keyMap[key] = char;
        key = generateNextKey(key);
        return keyMap;
    }, {});
};

// decode message's encoded body using a key-char map
var decode = function (keyMap, encoded) {
    var result = "";
    var index = 0;
    while (true) {
        var keyLength = parseInt(encoded.substr(index, 3), 2);
        if (keyLength === 0) break;
        index += 3;
        var key = encoded.substr(index, keyLength);
        index += keyLength;
        while (!/^[1]+$/.test(key)) {
            result += keyMap[key];
            key = encoded.substr(index, keyLength);
            index += keyLength;
        }
    }
    return result;
};


var payload = [
    "TNM AEIOU",
    "0010101100011",
    "1010001001110110011",
    "11000",
    "$#**\\",
    "0100000101101100011100101000"
].join("\n");

splitPayload(payload).forEach(function (message) {
    message = splitMessage(message);
    var decoded = decode(generateKeyMap(message.header), message.encoded);
    console.log(decoded);
});

