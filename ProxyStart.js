/**
 * Created by JaeYoungHwang on 2017-06-20.
 * forest62590@gmail.com
 */

// extract the modules
var fs = require('fs');
var async = require('async');
var express = require('express');
var bodyParser = require('body-parser');
var fiwareController = require('./ProxyModule/FiwareController');
var oneM2MController = require('./ProxyModule/oneM2MController');
var statusCodeMessage = require('./ETC/StatusCode');
var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

global.fiwareIP = '';
global.yellowTurtleIP = '';
global.notificationURL = '';

fs.readFile('conf.json', 'utf-8', function (err, data) {
    if (err) {
        console.log("FATAL An error occurred trying to read in the file: " + err);
        console.log("error : set to default for configuration");
    } else {
        var conf = JSON.parse(data)['proxy:conf'];

        fiwareIP = conf['fiwareIP'];
        yellowTurtleIP = conf['yellowTurtleIP'];
        notificationURL = conf['notificationURL'];

        serverStartFunction();

        /*fs.readFile('subscriptionList.txt', 'utf-8', function (err, data) {
            if (err) {
                console.log("FATAL An error occurred trying to read in the file: " + err);
            } else {
                var subIdArray = data.split("\n");

                if(subIdArray.length > 0 && subIdArray[0] != '') {
                    console.log('Subscription Delete start....');

                    fiwareController.executeUnsubscriptionEntity(subIdArray, function (requestResult, statusCode) {

                        if(requestResult) { // success (true)
                            fs.writeFile('subscriptionList.txt', '', function (err) {
                                if (err)
                                    console.log('FATAL An error occurred trying to write in the file: ' + err);
                                else {
                                    serverStartFunction();
                                }
                            });
                        } else { // fail (false)
                            console.log(statusCodeMessage.statusCodeGenerator(statusCode) + '\n');
                            console.log('Please restart server...');
                        }
                    });
                } else {
                    serverStartFunction();
                }
            }
        });*/
    }
});

// Device information from MMG management system
app.post('/MMGDeviceInfoEndpoint', function(request, response) {

    console.log(request.body);

    var selectedDevices = request.body['FiwareDevices']; // Root
    var deviceInfo = selectedDevices.deviceInfo;
    var deviceCount = Object.keys(deviceInfo).length;

    // Changing ContextBrokerIP and oneM2M ServerIP
    if(selectedDevices.fiwareIPAddr)
        fiwareIP = selectedDevices.fiwareIPAddr;

    if(selectedDevices.mobiusServerAddr)
        yellowTurtleIP = selectedDevices.mobiusServerIPAddr;

    var fiwareDeviceInfo = new Entity( ); // Device information container

    // get entity name and entity type for executing QueryEntity
    for(var i = 0; i < deviceCount; i++) {
        fiwareDeviceInfo.setEntityName(deviceInfo[Object.keys(deviceInfo)[i]].entityName);
        fiwareDeviceInfo.setEntityType(deviceInfo[Object.keys(deviceInfo)[i]].entityType);
    }

    async.waterfall([
        // Get Fiware device information
        function(callbackForOneM2M){
            fiwareController.executeQueryEntity(fiwareDeviceInfo, function (requestResult, statusCode, detailFiwareDeviceInfo) {

                console.log(JSON.stringify(detailFiwareDeviceInfo));

                if (requestResult) { // success (true)
                    callbackForOneM2M(null, detailFiwareDeviceInfo);
                } else { // fail (false)
                    callbackForOneM2M(statusCode, null);
                }
            });
        }// Fiware resource retrieve

        /* Spot Container creation, Status Container creation, Info Container creation */
    ], function (statusCode, result) { // response to client such as web or postman
        console.log(statusCodeMessage.statusCodeGenerator((statusCode)));
        response.status(statusCode).send(statusCodeMessage.statusCodeGenerator(statusCode));
    });
});

// Fiware Subscription endpoint
app.post('/FiwareNotificationEndpoint', function(request, response) {
    oneM2MController.updateFiwareToOneM2M(request.body, function (requestResult, statusCode) {
        // In this function we don't use requestResult
        console.log(statusCodeMessage.statusCodeGenerator(statusCode));
    });
});

// Server testing code
app.get('/', function (request, response) {
    response.send('<h1>'+ 'WISE-IoT' + '</h1>');
});

var serverStartFunction = function( ) {
    // Server start!!
    app.listen(62590, function () {
        console.log('Server running at http://127.0.0.1:62590');
    });
};

// Entity Container
function Entity( ) {
    // Pair Value
    this.entityName = []; // Mandatory field
    this.entityType = []; // Mandatory field

    this.setEntityName = function(entityName) {
        this.entityName.push(entityName);
    };

    this.getEntityName = function(selectedIndex) {
        return this.entityName[selectedIndex];
    };

    this.setEntityType = function (entityType) {
        this.entityType.push(entityType);
    };

    this.getEntityType = function(selectedIndex) {
        return this.entityType[selectedIndex];
    };

    this.getDeviceNumber = function ( ) {
        return this.entityName.length;
    }
}