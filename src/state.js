/* 
This code was written by Bormisov Vlad @bormisov.
 */

'use strict'

const $ = require('jquery')
const { createContext, CryptoFactory } = require('sawtooth-sdk/signing')

const { preparePayload } = require('./prepare_payload')

const hash = require('hash.js')

// Config variables
const KEY_NAME = 'xo.keys'
const API_URL = 'http://localhost:8008'

const FAMILY = 'xo'
const VERSION = '1.0'
const PREFIX = '5b7349'

// Fetch key-pairs from localStorage
const getKeys = () => {
  const storedKeys = localStorage.getItem(KEY_NAME)
  if (!storedKeys) return []

  return storedKeys.split(';').map((pair) => {
    const separated = pair.split(',')
    return {
      public: separated[0],
      private: separated[1]
    }
  })
}

// Create new key-pair
const makeKeyPair = () => {
  const context = createContext('secp256k1')
  const privateKey = context.newRandomPrivateKey()
  const signer = new CryptoFactory(context).newSigner(privateKey)
  return {
    public: signer.getPublicKey().asHex(),
    private: privateKey.asHex()
  }
}

// Save key-pairs to localStorage
const saveKeys = keys => {
  const paired = keys.map(pair => [pair.public, pair.private].join(','))
  localStorage.setItem(KEY_NAME, paired.join(';'))
}

const getGameAdress = gameName => {
  return hash.sha512().update('xo').digest('hex').substring(0,6) + hash.sha512().update(gameName).digest('hex').substring(0,64);
}

/*
const getState = cb => {
  $.get(`${API_URL}/state?address=${PREFIX}`, ({ data }) => {
    cb(data.reduce((processed, datum) => {
      if (datum.data !== '') {
        const parsed = JSON.parse(atob(datum.data))
        if (datum.address[7] === '0') processed.assets.push(parsed)
        if (datum.address[7] === '1') processed.transfers.push(parsed)
      }
      return processed
    }, {assets: [], transfers: []}))
  })
}
*/

// Fetch current Sawtooth XO Chain state from validator and parse it
const getState = cb => {
  $.get(`${API_URL}/state?reverse`, ({ data }) => {
    let processedGamesNames = [ ];
    cb(data.reduce((processed, datum) => {
      if (datum.data !== '') {
        const decoded = atob(datum.data);
        if (decoded[0] != '\n') { // not just created game
          const parsed = decoded.split(',');
          if (!processedGamesNames.includes(parsed[0])) {
            processedGamesNames.push(parsed[0]);
            processed.push({
              name: parsed[0]
              , cells: parsed[1]
              , state: parsed[2]
              , player1Key: parsed[3]
              , player2Key: parsed[4]
            });
          }
        }
      }
      return processed;
    }, [ ]))
  })
}

// Submit signed Transaction to validator
const submitUpdate = (payload, privateKey, cb) => {
  $.post({
    url: `${API_URL}/batches?wait`,
    data: preparePayload(payload, privateKey),
    headers: {'Content-Type': 'application/octet-stream'},
    processData: false,
    // Any data object indicates the Batch was not committed
    success: ({ link }) => cb(link),
    error: () => cb(false)
  })
}

const checkStatus = (link, cb) => {
  $.get({
    url: link,
    data: {},
    success: ({ data }) => cb(data[0].status == 'COMMITTED'?true:false),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
    }
  })
}

module.exports = {
  getKeys,
  makeKeyPair,
  saveKeys,
  getState,
  submitUpdate,
  checkStatus
}
