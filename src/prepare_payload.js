'use strict'

const { createContext, CryptoFactory } = require('sawtooth-sdk/signing')
const context = createContext('secp256k1')
const cbor = require('cbor')
const { createHash } = require('crypto')
const protobuf = require('sawtooth-sdk/protobuf')
const hash = require('hash.js')

function preparePayload(payload, privateKey) {
    const privateKeyBuffer = Buffer.from(privateKey, 'hex')
    const signer = new CryptoFactory(context).newSigner({ privateKeyBytes: privateKeyBuffer })
    const payloadBytes = cbor.encode(payload).slice(payload.split(',')[0].length < 19?1:2)
    const gameAddress = hash.sha512().update('xo').digest('hex').substring(0,6) + hash.sha512().update(payload.split(',')[0]).digest('hex').substring(0,64)
    const transactionHeaderBytes = protobuf.TransactionHeader.encode({
        familyName: 'xo'
        , familyVersion: '1.0'
        , inputs:  [gameAddress]
        , outputs: [gameAddress]
//        , inputs:  ['5b73494b5a23208dadc3cd5833608e050d3d78ffe40e9eda427fa7066a3fb25fcbb3f4']
//        , outputs: ['5b73494b5a23208dadc3cd5833608e050d3d78ffe40e9eda427fa7066a3fb25fcbb3f4']
        , signerPublicKey: signer.getPublicKey().asHex()
        , batcherPublicKey: signer.getPublicKey().asHex()
        , dependencies: []
        , payloadEncoding: "csv-utf8"
        , payloadSha512: createHash('sha512').update(payloadBytes).digest('hex')
    }).finish()
    const signature = signer.sign(transactionHeaderBytes)
    const transaction = protobuf.Transaction.create({
        header: transactionHeaderBytes,
        headerSignature: signature,
        payload: payloadBytes
    })
    const transactions = [transaction]
    const batchHeaderBytes = protobuf.BatchHeader.encode({
        signerPublicKey: signer.getPublicKey().asHex(),
        transactionIds: transactions.map((txn) => txn.headerSignature),
    }).finish()
    const signature1 = signer.sign(batchHeaderBytes)
    const batch = protobuf.Batch.create({
        header: batchHeaderBytes,
        headerSignature: signature1,
        transactions: transactions
    })
    const batchListBytes = protobuf.BatchList.encode({
        batches: [batch]
    }).finish()

    return batchListBytes
}

module.exports = { preparePayload }