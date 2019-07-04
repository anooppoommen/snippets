const aws = require('aws-sdk');
const multer = require('multer')
const multers3 = require('multer-s3');
const uuid = require('uuid/v4')
const AWS_ACCESS_KEY =  process.env.AWS_ACCESS_KEY;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;


var s3 = new aws.S3({
    accessKeyId : AWS_ACCESS_KEY,
    secretAccessKey: AWS_SECRET_ACCESS_KEY
});

function UploadObject(bucket){
    var upload = multer({
        storage: multers3({
            s3 : s3,
            bucket:bucket,
            metadata : function (req, file, cb) {
                cb(null, {fieldName: file.fieldname});
            },
            contentType: multers3.AUTO_CONTENT_TYPE,
            key: function (req, file, cb) {
                cb(null, uuid() )
            }
        })
    });
}


module.exports = UploadObject;