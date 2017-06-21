/**
 * Created by JaeYoungHwang on 2017-02-28.
 * forest62590@gmail.com
 */

// extract the modules
var async = require('async');
var AERegistration = require('./oneM2M/AERegistration');
var containerRegistration = require('./oneM2M/ContainerRegistration');
var contentInstanceRegistration = require('./oneM2M/contentInsatnceRegistration');

var executeRegistrationAE = function(count, fiwareInformation, oneM2MControllerCallback){

    var selectedDevices = fiwareInformation['FiwareDevices']; // Root
    var deviceInfo = selectedDevices.deviceInfo;

    // Creating AE name using Entity Name and Entity Type.
    var AEName = deviceInfo[Object.keys(deviceInfo)[count]].entityName + ":" + deviceInfo[Object.keys(deviceInfo)[count]].entityType;

    AERegistration.CallAERegistrationFunction(AEName, function (statusCode) {

        if(statusCode == 201)
            oneM2MControllerCallback(true, statusCode);
        else
            oneM2MControllerCallback(false, statusCode);
    })
};

var executeRegistrationConCin = function(count, fiwareInformation, oneM2MControllerCallback) {

    var attrCount = 0;

    var selectedDevices = fiwareInformation['FiwareDevices']; // Root
    var deviceInfo = selectedDevices.deviceInfo;
    var deviceKey = [Object.keys(deviceInfo)[count]]; // device1, device2, ... , deviceN
    var device = deviceInfo[deviceKey];

    // Getting device attributes such as entityName, temperature, pressure and so on.
    var attributeKey = Object.keys(device);
    var attributeCount = attributeKey.length;

    // Creating AE name using Entity Name and Entity Type.
    var AEName = device.entityName + ":" + device.entityType;

    async.whilst(
        function () {
            return attrCount < attributeCount;
        },

        function (async_for_loop_callback) {

            if ((attributeKey[attrCount] == 'entityName' || attributeKey[attrCount] == 'entityType') == false) {
                async.waterfall([
                    // Container Registration
                    function (callbackForOneM2M) {
                        var containerName = attributeKey[attrCount]; // Container Name
                        containerRegistration.ContainerRegistrationExecution(AEName, containerName, null, function (statusCode) {
                            if(statusCode == 201)
                                callbackForOneM2M(null);
                            else
                                callbackForOneM2M(statusCode, null);
                        });
                    },

                    // If attributes have metadata...
                    function (callbackForOneM2M) {
                        var metadataCount = 0;
                        var metadataSet = device[attributeKey[attrCount]].metadata;
                        var metadataKey = Object.keys(metadataSet);

                        async.whilst(
                            function () { return metadataCount < metadataKey.length; },

                            // Creating metadata resource using double Container structure
                            function (async_for_loop_callback) {
                                async.waterfall([

                                    // Creating Container resource for metadata
                                    function(callbackForOneM2M) {
                                        var containerName = attributeKey[attrCount]; // Container Name
                                        var metadataName = metadataKey[metadataCount];

                                        containerRegistration.ContainerRegistrationExecution(AEName, containerName, metadataName, function (statusCode) {
                                            if(statusCode == 201)
                                                callbackForOneM2M(null);
                                            else
                                                callbackForOneM2M(statusCode, null);
                                        });
                                    },

                                    // Creating contentInstance resource for metadata value
                                    function(callbackForOneM2M) {
                                        var containerName = attributeKey[attrCount]; // Container Name
                                        var metadataName = metadataKey[metadataCount];
                                        var metadataValue = metadataSet[metadataKey[metadataCount]];// contentInstance value

                                        contentInstanceRegistration.contentInstanceRegistrationExecution(AEName, containerName, metadataName, metadataValue, function (statusCode) {
                                            if(statusCode == 201)
                                                callbackForOneM2M(null);
                                            else
                                                callbackForOneM2M(statusCode, null);
                                        });
                                    }
                                ], function (statusCode, result) {
                                    if(statusCode) {
                                        if(statusCode == 409) { // Container Registration Conflict
                                            metadataCount++; async_for_loop_callback();
                                        } else {
                                            async_for_loop_callback(statusCode); // fail
                                        }
                                    } else {
                                        metadataCount++; async_for_loop_callback();
                                    }
                                }); // End of async.waterfall
                            },
                            function (statusCode, n) {
                                if(statusCode) {
                                    callbackForOneM2M(statusCode, null); // fail
                                } else {
                                    callbackForOneM2M(null); // success
                                }
                            }
                        ); // End of async.whilist
                    },

                    // contentInstance Registration
                    function (callbackForOneM2M) {
                        // If FIWARE resource has Location Information...
                        var containerName = attributeKey[attrCount]; // Container Name
                        var findingLocationType = device[attributeKey[attrCount]].type;

                        var contentInstanceValue = '';

                        if(findingLocationType == 'geo:json') {
                            var Location = device[attributeKey[attrCount]].value;
                            var coordinates = Location.coordinates;
                            contentInstanceValue = coordinates[0] + ":" + coordinates[1];
                        } else {
                            contentInstanceValue = device[attributeKey[attrCount]].value;// contentInstance value
                        }

                        contentInstanceRegistration.contentInstanceRegistrationExecution(AEName, containerName, null, contentInstanceValue, function (statusCode) {
                            if(statusCode == 201)
                                callbackForOneM2M(null);
                            else
                                callbackForOneM2M(statusCode, null);
                        });
                    }
                ], function (statusCode, result) { // response to client such as web or postman
                    if(statusCode) {
                        if(statusCode == 409) { // Container Registration Conflict
                            attrCount++; async_for_loop_callback();
                        } else {
                            async_for_loop_callback(statusCode); // fail
                        }
                    } else {
                        attrCount++; async_for_loop_callback();
                    }
                });
            } else {
                attrCount++; async_for_loop_callback();
            }
        },
        function (statusCode, n) {
            if (statusCode) {
                oneM2MControllerCallback(false, statusCode);
            } else {
                console.log("oneM2M resource registration is finished");
                oneM2MControllerCallback(true, statusCode);
            }
        }
    );
};

var fiwareDeviceUpdateForOneM2M = function(fiwareInformation, oneM2MControllerCallback) {

    var attrCount = 0; // Initialization for counting

    var attributeOrigin = fiwareInformation['data'][0]; // Root
    var attributeKeys = Object.keys(attributeOrigin);
    var attributeNumber = attributeKeys.length;

    async.whilst(
        function () { return attrCount < attributeNumber; },

        function (async_for_loop_callback) {
            // Creating AE name using Entity Name and Entity Type.
            var AEName = attributeOrigin.id + ":" + attributeOrigin.type;

            if ((attributeKeys[attrCount] == 'id' || attributeKeys[attrCount] == 'type') == false) {
                async.waterfall([
                    function(CallbackForNotification){
                        var metadataCount = 0;
                        var metadataSet = attributeOrigin[attributeKeys[attrCount]].metadata;
                        var metadataKey = Object.keys(metadataSet);
                        var findingLocationType = '';

                        if(metadataKey.length)
                            findingLocationType = attributeOrigin[attributeKeys[attrCount]].type;

                        if(metadataKey.length && findingLocationType != 'geo:json') { // if metadata exist...
                            async.whilst(
                                function () { return metadataCount < metadataKey.length; },

                                function (async_for_loop_callback) {
                                    var containerName = attributeKeys[attrCount]; // Container Name
                                    var metadataName = metadataKey[metadataCount]; // 2nd Container Name
                                    var metadataValue = metadataSet[metadataKey[metadataCount]].value; // contentInstance value

                                    contentInstanceRegistration.contentInstanceRegistrationExecution(AEName, containerName, metadataName, metadataValue, function (statusCode) {
                                        if (statusCode == 201) {
                                            metadataCount++; async_for_loop_callback();
                                        } else
                                            async_for_loop_callback(statusCode, null);
                                    });
                                },
                                function (statusCode, n) {
                                    if(statusCode) {
                                        CallbackForNotification(statusCode, null); // fail
                                    } else {
                                        CallbackForNotification(null); // success
                                    }
                                }
                            ); // End of async.whilist
                        } else { // if not...
                            CallbackForNotification(null);
                        }
                    },

                    // Container, contentInstance registration
                    function(CallbackForNotification) {
                        var containerName = attributeKeys[attrCount];
                        var contentInstanceValue = '';

                        var findingLocationType = attributeOrigin[attributeKeys[attrCount]].type;

                        if(findingLocationType == 'geo:json') {
                            var Location = attributeOrigin[attributeKeys[attrCount]].value;
                            var coordinates = Location.coordinates;
                            contentInstanceValue = coordinates[0] + ":" + coordinates[1];
                        } else {
                            contentInstanceValue = attributeOrigin[attributeKeys[attrCount]].value; // contentInstance value
                        }

                        contentInstanceRegistration.contentInstanceRegistrationExecution(AEName, containerName, null, contentInstanceValue, function (statusCode) {
                            if(statusCode == 201) {
                                CallbackForNotification(null);
                            } else {
                                CallbackForNotification(statusCode);
                            }
                        });
                    }
                ], function (statusCode, result) { // response to client such as web or postman
                    if(statusCode) {
                        async_for_loop_callback(statusCode); // fail
                    } else {
                        attrCount++; async_for_loop_callback();
                    }
                }); // End of async.waterfall
            } else {
                attrCount++; async_for_loop_callback();
            }
        },
        function (statusCode, n) {
            if(statusCode) {
                oneM2MControllerCallback(false, statusCode);
            } else {
                console.log("contentInstance registration is finished");
                oneM2MControllerCallback(true, 201);
            }
        }
    ); // End of async.whilist
};

exports.registrationAE = function(count, fiwareInformation, oneM2MControllerCallback) {
    executeRegistrationAE(count, fiwareInformation, oneM2MControllerCallback);
};

exports.registrationConCin = function (count, fiwareInformation, oneM2MControllerCallback) {
    executeRegistrationConCin(count, fiwareInformation, oneM2MControllerCallback);
};

exports.updateFiwareToOneM2M = function (fiwareInformation, oneM2MControllerCallback) {
    fiwareDeviceUpdateForOneM2M(fiwareInformation, oneM2MControllerCallback);
};