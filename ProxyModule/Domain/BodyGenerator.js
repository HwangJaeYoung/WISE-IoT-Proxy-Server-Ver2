/**
 * Created by JaeYoungHwang on 2017-03-08.
 * forest62590@gmail.com
 */

var AEBodyGeneration = function (AEName) {
    var bodyObject = new Object();

    var rootForAttr = new Object();
    rootForAttr['api'] = "0.2.481.2.0001.001.000111";
    rootForAttr['rr'] = "true";
    rootForAttr['rn'] = AEName;
    bodyObject['m2m:ae'] = rootForAttr;

    return bodyObject;
};

var ContainerBodyGeneration = function (ContainerName) {
    var bodyObject = new Object();

    var rootForAttr = new Object();
    rootForAttr['rn'] = ContainerName;
    bodyObject['m2m:cnt'] = rootForAttr;

    return bodyObject;
};

var contentInstanceBodyGeneration = function (contentInstanceName) {
    var bodyObject = new Object();

    var rootForAttr = new Object();
    rootForAttr['con'] = contentInstanceName;
    bodyObject['m2m:cin'] = rootForAttr;

    return bodyObject;
};

var subscriptionBodyGenerator = function (device) {
    var bodyObject = new Object();
    var attributeKey = Object.keys(device);
    var attributeCount = attributeKey.length;

    // Description
    bodyObject['description'] = "Fiware Device Subscription for oneM2M";

    /****************** Subject object generation ******************/
        // Subject Root
    var subjectObjectsRoot = new Object();
    var entitiesArray = new Array();

    // Subject entities
    var entity = new Object();
    entity['id'] = device.entityName;
    entity['type'] = device.entityType;
    entitiesArray.push(entity);

    // Subject condition
    var condition = new Object();
    var conditionArray = new Array();

    for(var i = 0; i < attributeCount; i++) {
        if ((attributeKey[i] == 'entityName' || attributeKey[i] == 'entityType') == false)
            conditionArray.push(attributeKey[i]);
    }
    condition['attr'] = conditionArray;

    // Merging subject information
    subjectObjectsRoot['entities'] = entitiesArray;
    subjectObjectsRoot['condition'] = condition;
    bodyObject['subject'] = subjectObjectsRoot;

    /****************** Notification object generation ******************/
        // Making notification information
    var notification = new Object();

    // Notification http
    var urlObject = new Object();
    urlObject['url'] = notificationURL;
    notification['http'] = urlObject;

    // Notification attrs
    var attributeArray = new Array();
    for(var i = 0; i < attributeCount; i++) {
        if ((attributeKey[i] == 'entityName' || attributeKey[i] == 'entityType') == false)
            attributeArray.push(attributeKey[i]);
    }

    // Merging notification information
    notification['attrs'] = attributeArray;
    bodyObject['notification'] = notification;

    /****************** Expires & Throttling ******************/
    bodyObject['expires'] = "2040-01-01T14:00:00.00Z"; // We can omit 'expires' attribute then it will be permanently
    bodyObject['throttling'] = 5;

    return bodyObject;
};

// oneM2M Body Generator
exports.AEBodyGenerator = function(AEName) {
    return AEBodyGeneration(AEName);
};

exports.ContainerBodyGenerator = function(containerName) {
    return ContainerBodyGeneration(containerName);
};

exports.contentInstanceBodyGenerator = function(contentInstanceValue) {
    return contentInstanceBodyGeneration(contentInstanceValue);
};

// FIWARE Body Generator
exports.fiwareSubscriptionBodyGenerator = function (device) {
    return subscriptionBodyGenerator(device);
};