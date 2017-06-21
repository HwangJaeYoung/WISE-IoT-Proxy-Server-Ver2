/**
 * Created by JaeYoungHwang on 2017-03-08.
 * forest62590@gmail.com
 */

var requestToAnotherServer = require('request');
var bodyGenerator = require('../Domain/BodyGenerator');

var RegistrationExecution = function (AEName, containerName, metadataName, contentInstanceValue, callBackForResponse) {

    var targetURL = '', bodyObject = null;

    if(metadataName) { // Double Container format
        targetURL = yellowTurtleIP + '/mobius-yt/' + AEName + '/' + containerName + '/' + metadataName;
        bodyObject = bodyGenerator.contentInstanceBodyGenerator(contentInstanceValue);
    } else { // General Container format
        targetURL = yellowTurtleIP + '/mobius-yt/' + AEName + '/' + containerName;
        bodyObject = bodyGenerator.contentInstanceBodyGenerator(contentInstanceValue);
    }

    requestToAnotherServer({
        url: targetURL,
        method: 'POST',
        json: true,
        headers: { // Basic AE resource structure for registration
            'Accept': 'application/json',
            'X-M2M-RI': '12345',
            'X-M2M-Origin': 'Origin',
            'Content-Type': 'application/vnd.onem2m-res+json; ty=4'
        },
        body: bodyObject
    }, function (error, oneM2MResponse, body) {

        if(typeof(oneM2MResponse) !== 'undefined') {
            var statusCode = oneM2MResponse.statusCode;

            if (statusCode == 201) { // resource creation
                callBackForResponse(statusCode);
            } else if(statusCode == 400) { // bad request
                callBackForResponse(statusCode);
            } // Status code will be added later
        } else { // For example, Request Timeout
            if(error.code === 'ETIMEDOUT') // request timeout
                callBackForResponse(408);
        }
    });
};

exports.contentInstanceRegistrationExecution = function(AEName, containerName, metadataName, contentInstanceValue, callBackForResponse) {
    RegistrationExecution(AEName, containerName, metadataName, contentInstanceValue, callBackForResponse);
};