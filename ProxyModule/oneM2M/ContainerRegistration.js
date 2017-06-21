/**
 * Created by JaeYoungHwang on 2017-03-03.
 * forest62590@gmail.com
 */

var requestToAnotherServer = require('request');
var bodyGenerator = require('../Domain/BodyGenerator');

var RegistrationExecution = function (AEName, containerName, metadataName, callBackForResponse) {

    var targetURL = '', bodyObject = null;

    if(metadataName) { // Double Container format
        targetURL = yellowTurtleIP + '/mobius-yt/' + AEName + '/' + containerName;
        bodyObject = bodyGenerator.ContainerBodyGenerator(metadataName);
    } else { // General Container format
        targetURL = yellowTurtleIP + '/mobius-yt/' + AEName;
        bodyObject = bodyGenerator.ContainerBodyGenerator(containerName);
    }

    requestToAnotherServer({
        url: targetURL,
        method: 'POST',
        json: true,
        headers: { // Basic AE resource structure for registration
            'Accept': 'application/json',
            'X-M2M-RI': '12345',
            'X-M2M-Origin': 'Origin',
            'Content-Type': 'application/vnd.onem2m-res+json; ty=3'
        },
        body: bodyObject
    }, function (error, oneM2MResponse, body) {
        if(typeof(oneM2MResponse) !== 'undefined') {

            var statusCode = oneM2MResponse.statusCode;

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

exports.ContainerRegistrationExecution = function(AEName, containerName, metadataName, callBackForResponse) {
    RegistrationExecution(AEName, containerName, metadataName, callBackForResponse);
};