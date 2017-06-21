/**
 * Created by JaeYoungHwang on 2017-03-03.
 * forest62590@gmail.com
 */

var requestToAnotherServer = require('request');
var bodyGenerator = require('../Domain/BodyGenerator');

var subscriptionFiwareDevice = function (device, fiwareCallback) {

    var targetURL = fiwareIP + '/v2/subscriptions';
    var bodyObject = bodyGenerator.fiwareSubscriptionBodyGenerator(device);

    // Request for subscribing fiware device information from ContextBroker (Subscription Entity)
    requestToAnotherServer( { url : targetURL,
        method : 'POST',
        strictSSL: false,
        json: true,
        headers : {
            'Accept' : 'application/json',
            'Content-Type' : 'application/json'
        },
        body: bodyObject
    }, function (error, fiwareResponse, body) {
        if(typeof(fiwareResponse) !== 'undefined') {
            var statusCode = fiwareResponse.statusCode;

            if (statusCode == 201) { // resource creation
                var headerLocationSplit = fiwareResponse.headers.location.split("/");
                var subscriptionID = headerLocationSplit[headerLocationSplit.length - 1];
                fiwareCallback(statusCode, subscriptionID);
            } else if (statusCode == 400) { // bad request
                fiwareCallback(statusCode, null);
            } else if (statusCode == 409) { // resource conflict error
                fiwareCallback(statusCode, null);
            }
        } else { // For example, Request Timeout
            if(error.code === 'ETIMEDOUT') // request timeout
                fiwareCallback(408, null);
        }
    });
};

exports.subFiwareDevice = function(device, fiwareCallback) {
    subscriptionFiwareDevice(device, fiwareCallback);
};