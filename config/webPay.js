const fs = require('fs');
const path = require('path');
const WebPay = require('webpay-nodejs');

var Transaction = function () {


    let privatePath = path.resolve(__dirname, '../597035841148.key');
    let publicPath = path.resolve(__dirname, '../597035841148.crt');

    let privateFileString = fs.readFileSync(privatePath).toString();
    let publicFileString = fs.readFileSync(publicPath).toString();

    let wp = new WebPay({
        commerceCode: '597035841148',
        publicKey: publicFileString, // .cert file
        privateKey: privateFileString, // .key file
        env: WebPay.ENV.PRODUCCION
    });

    // const configuration = new Transbank.Configuration()
    //                     .withCommerceCode('597035841148')
    //                     .withPrivateCert(privateFileString)
    //                     .withPublicCert(publicFileString)
    //                     .usingEnvironment(Transbank.environments.production) 
    // const transaction = new Transbank.Webpay(configuration).getNormalTransaction();
    return wp;
}

module.exports = Transaction;