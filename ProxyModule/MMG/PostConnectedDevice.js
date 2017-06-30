/**
 * Created by JaeYoungHwang on 2017-06-30.
 */

/**
 * Created by JaeYoungHwang on 2017-03-03.
 * forest62590@gmail.com
 */

var requestToAnotherServer = require('request');
var bodyGenerator = require('../Domain/BodyGenerator');

var sendingFIWARENodeCount = function (fiwareNodeCount, callBackForResponse) {

    var targetURL = MMGURL, bodyObject = null;

    bodyObject = bodyGenerator.nodeCountBodyGenerator(fiwareNodeCount);

    requestToAnotherServer({
        url: targetURL,
        method: 'POST',
        json: true,
        headers: { // Basic AE resource structure for registration
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: bodyObject
    }, function (error, nodeCountResponse, body) {
        if(typeof(nodeCountResponse) !== 'undefined') {

            var statusCode = nodeCountResponse.statusCode;

            if (statusCode == 201) { // resource creation
                callBackForResponse(statusCode); // Callback method for sending QueryEntity result to FiwareController
            } else if(statusCode == 400) { // bad request
                callBackForResponse(statusCode);
            } else if (statusCode == 409) { // resource conflict error
                callBackForResponse(statusCode);
            } // Status code will be added later
        } else { // For example, Request Timeout
            if(error.code === 'ETIMEDOUT') // request timeout
                callBackForResponse(408);
        }
    });
};

exports.FIWARENodeCountExecution = function(fiwareNodeCount, callBackForResponse) {
    sendingFIWARENodeCount(fiwareNodeCount, callBackForResponse);
};
