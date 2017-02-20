var fs = require('fs');
var config = require('../config')(process.env.NODE_ENV);
var credentials = require('../config/credentials')(process.env.NODE_ENV);
var crud = require('../util/crud');
var models = require('../models');
var multer  = require('multer');
var aws = require('aws-sdk');

var upload = multer({
	dest: 'uploads/',
});

var uploadToS3 = function(filename, file){
	return new Promise((resolve, reject) => {
		try {
			var s3 = new aws.S3({
					accessKeyId: credentials.S3.accessKeyId,
					secretAccessKey: credentials.S3.secretAccessKey
				});
		  s3.putObject({
		    Bucket: config.S3.bucket,
		    Key: filename,
		    Body: file
		  }, (err, data) => {
				if(err){
					console.error(err);
				}
				console.log('Successfully uploaded picture.');
				resolve("http://s3.amazonaws.com/" + config.S3.bucket + "/" + filename);
		  });
		} catch (e) {
			console.log(e);
			reject(e);
		}
	}); //Promise
};// function

module.exports = function(router){
	crud.api(router, "resume", models.resume, {});
	/*	prePost: (req, res, next) => {
			// aws code
		},
		cbPost: (results, req, res, next) => {

		}
	});*/

/*	router.route('/resume/upload/resume')
  .post(upload.single('resume'), function (req, res, next) {
		fs.readFile(req.file.path, (err, data) => {
			uploadToS3(req.file.originalname, data).then((response) => {
				console.log('Finished uploading!', response);
				res.json(response);
			});
		});

  });

  
  	router.route('/resume/upload/profile')
  .post(upload.single('profile'), function (req, res, next) {
		fs.readFile(req.file.path, (err, data) => {
			uploadToS3(req.file.originalname, data).then((response) => {
				console.log('Finished uploading!', response);
				res.json(response);
			});
		});

  });*/

}
