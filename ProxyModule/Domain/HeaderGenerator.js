/**
 * Created by JaeYoungHwang on 2017-03-10.
 * forest62590@gmail.com
 */

var AEHeaderGeneration = function (AEName) {
    var headerObject = new Object();

    headerObject['Accept'] = "application/json";
    headerObject['X-M2M-RI'] = "12345";
    headerObject['X0M2M-Origin'] = 'C';
    headerObject['Content-Type'] = 'application/vnd.onem2m-res+json; ty=2';

    return headerObject;
};

// oneM2M Header Generator
exports.AEHeaderGenerator = function() {
    return AEHeaderGeneration();
};