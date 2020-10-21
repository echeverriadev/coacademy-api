const fs = require('fs');
const path = require('path');
const Transbank = require('transbank-sdk');

var Transaction = function () {


    let privatePath = path.resolve(__dirname, '../597035841148.key');
    let publicPath = path.resolve(__dirname, '../597035841148.crt');

    let privateFileString = fs.readFileSync(privatePath).toString();
    let publicFileString = fs.readFileSync(publicPath).toString();

    const configuration = new Transbank.Configuration()
                        .withCommerceCode('597035841148')
                        .withPrivateCert(privateFileString)
                        .withPublicCert(publicFileString)
                        .usingEnvironment(Transbank.environments.production) 
    const transaction = new Transbank.Webpay(configuration).getNormalTransaction();
    return transaction;
}

module.exports = Transaction;