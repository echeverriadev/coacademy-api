const Transbank = require('transbank-sdk');

var Transaction = function () {

    const transaction = new Transbank.Webpay(
        Transbank.Configuration.forTestingWebpayPlusNormal()
    ).getNormalTransaction();

    return transaction;
}

module.exports = Transaction;