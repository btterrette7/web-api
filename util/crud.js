var config = require('../config')(process.env.NODE_ENV);
var credentials = require('../config/credentials')(process.env.NODE_ENV);
var multer  = require('multer');
var resume = require('../routes/resume');
var aws = require('aws-sdk');
var fs = require('fs');
//var models = require('../models');
var runPrePromise = function(promise, req, res, next){
  return new Promise((resolve, reject) => {
    if(promise == null){
      resolve();
    } else {
      promise(req, res, next).then(() => {
        resolve();
      }, () => {
        reject();
      });
    }
  });
}

var uploadToS3 = function(filename, file){
	return new Promise((resolve, reject) => {
		try {
			buf = new Buffer(file,'base64')
			var s3 = new aws.S3({
					accessKeyId: credentials.S3.accessKeyId,
					secretAccessKey: credentials.S3.secretAccessKey
				});
		  s3.putObject({
		    Bucket: config.S3.bucket,
		    Key: filename,
		    ACL: 'public-read', 
		    Body: buf,
			ContentEncoding: 'base64',
			ContentType: 'image/png'
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

var deleteFromS3 = function(filename){
	return new Promise((resolve, reject) => {
		try {
			var s3 = new aws.S3({
					accessKeyId: credentials.S3.accessKeyId,
					secretAccessKey: credentials.S3.secretAccessKey
				});
		  s3.deleteObject({
		    Bucket: config.S3.bucket,
		    Key: filename
		  }, (err, data) => {
				if(err){
					console.error(err);
				}
				console.log('Successfully deleted picture.');
				resolve("http://s3.amazonaws.com/" + config.S3.bucket + "/" + filename);
		  });
		} catch (e) {
			console.log(e);
			reject(e);
		}
	}); //Promise
};// function

var getWebURL = function(filename){
	return new Promise((resolve, reject) => {
		try {
			var s3 = new aws.S3({
					accessKeyId: credentials.S3.accessKeyId,
					secretAccessKey: credentials.S3.secretAccessKey
				});
		  s3.getBucketWebsite({
		    Bucket: config.S3.bucket,
		    Key: filename
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

var processErr = function (err, res) {
  console.log(err);
  switch (err.name) {
  case "SequelizeAccessDeniedError":
    res.status(403).json(err);
    break;
  case "SequelizeDatabaseError":
    if(err.message.includes("new row violates row-level security policy")){
      res.status(403).json();
    }else{
      res.status(500).json("Internal Server Error: Signed Key");
    }
    break;
  default:
    res.status(500).json("Internal Server Error");
    break;
  }
};
var api = function (router, name, model, options) {
  options = options || {};
  var route = router.route('/' + name);
  
  if (!(options.omitGetAll === true)) {
    route.get(function (req, res, next) {
      runPrePromise(options.preGetAll, req, res, next).then(() => {
		model.findAll(options).then((results) => {
          if(options.cbGetAll != null){
            options.cbGetAll(results, req, res, next);
          }else{
            res.status(200).json(results);
          }
        }).catch((err) => {
          processErr(err, res);
        });

      });
    });
  }
  if (!(options.omitPost === true)) {
    route.post(function (req, res, next) {
      runPrePromise(options.prePost, req, res, next).then(() => {
		
		var resume="http://s3.amazonaws.com/" + config.S3.bucket + "/" + req.body.Id+"Resume.png";
		var profile="http://s3.amazonaws.com/" + config.S3.bucket + "/" + req.body.Id+"Profile.png";
		var ResumeOverlay="http://s3.amazonaws.com/" + config.S3.bucket + "/" + req.body.Id+"ResumeOverlay.png";
		//console.log(profile);
		
		model.create({"Id": req.body.Id, "Name": req.body.Name,"Email": req.body.Email,"Number": req.body.Number,"Notes": req.body.Notes,"Resume": resume,"Profile": profile,"ResumeOverlay": ResumeOverlay, "Rating": req.body.Rating}).then((results) => {
		
			resume="http://s3.amazonaws.com/" + config.S3.bucket + "/" + results.Id+"Resume.png";
			profile="http://s3.amazonaws.com/" + config.S3.bucket + "/" + results.Id+"Profile.png";
			ResumeOverlay="http://s3.amazonaws.com/" + config.S3.bucket + "/" + req.body.Id+"ResumeOverlay.png";
			
			model.update({"Id": results.Id, "Name": results.Name,"Email": results.Email,"Number": results.Number,"Notes": results.Notes,"Resume": resume,"Profile": profile,"ResumeOverlay": ResumeOverlay, "Rating": results.Rating}, {
            where: {
              Id: results.Id
            }
			}).then((results) => {
			
			if(options.cbPut != null){
				options.cbPut(results, req, res, next);
			}else{
				res.status(200).json(results);
			}
			}).catch((err) => {
				processErr(err, res);
			});
		
			if(req.body.Resume!=null)
			{
				uploadToS3(results.Id+"Resume.png", req.body.Resume).then((response) => {
						console.log('Finished uploading!', response);
						//res.json(response);
			});}
			if(req.body.Profile!=null)
			{	
			uploadToS3(results.Id+"Profile.png", req.body.Profile).then((response) => {
					console.log('Finished uploading!', response);
					//res.json(response);
			});}
			
			if(req.body.ResumeOverlay!=null){
				uploadToS3(results.Id+"ResumeOverlay.png", req.body.ResumeOverlay).then((response) => {
				console.log('Finished uploading!', response);
				//res.json(response);
			});
			}
		  
		  if(options.cbPost != null){
            options.cbPost(results, req, res, next);
          }else{
            res.status(200).json(results);
          }
        }).catch((err) => {
          processErr(err, res);
        });
      });
    });
  }
  
  
  route = router.route('/' + name + '/:Id(\\d+)')
  if (!(options.omitGet === true)) {
    route.get(function (req, res, next) {
      runPrePromise(options.preGet, req, res, next).then(() => {
			model.findOne({
              where: {
                id: req.params.Id
              }
            })
          .then((results) => {
            if(options.cbGet != null){
              options.cbGet(results, req, res, next);
            }else{
              res.status(200).json(results);
            }
          }).catch((err) => {
            processErr(err, res);
          });
        });
    });
  }
  
  
  
  if (!(options.omitPut === true)) {
    route.put(function (req, res, next) {
      runPrePromise(options.prePut, req, res, next).then(() =>{ 
		var resume="http://s3.amazonaws.com/" + config.S3.bucket + "/" +req.body.Id+"Resume.png";
		var profile="http://s3.amazonaws.com/" + config.S3.bucket + "/" + req.body.Id+"Profile.png";
		var ResumeOverlay="http://s3.amazonaws.com/" + config.S3.bucket + "/" + req.body.Id+"ResumeOverlay.png";
		
		if(req.body.Resume!=null)
		{
		uploadToS3(req.body.Id+"Resume.png", req.body.Resume).then((response) => {
				console.log('Finished uploading!', response);
				//res.json(response);
		});}
		
		if(req.body.Profile!=null)
		{
		uploadToS3(req.body.Id+"Profile.png", req.body.Profile).then((response) => {
				console.log('Finished uploading!', response);
				//res.json(response);
		});}
		
		if(req.body.ResumeOverlay!=null){
		uploadToS3(req.body.Id+"ResumeOverlay.png", req.body.ResumeOverlay).then((response) => {
				console.log('Finished uploading!', response);
				//res.json(response);
			});
			ResumeOverlay="http://s3.amazonaws.com/" + config.S3.bucket + "/" + req.body.Id+"ResumeOverlay.png";
		}
	  
			model.update({"Id": req.body.Id, "Name": req.body.Name,"Email": req.body.Email,"Number": req.body.Number,"Notes": req.body.Notes,"Resume": resume,"Profile": profile,"ResumeOverlay": ResumeOverlay, "Rating": req.body.Rating}, {
            where: {
              Id: req.params.Id
            }
          }).then((results) => {
			
          if(options.cbPut != null){
            options.cbPut(results, req, res, next);
          }else{
            res.status(200).json(results);
          }
        }).catch((err) => {
          processErr(err, res);
        });
      });
    });
  }
  if (!(options.omitDelete === true)) {
    route.delete(function (req, res, next) {
		runPrePromise(options.preDelete, req, res, next).then(() => {	  
			
			deleteFromS3(req.params.Id+"Resume.png").then((response) => {
			  console.log('Finished deleting resume!', response)});
			
			deleteFromS3(req.params.Id+"Profile.png").then((response) => {
			  console.log('Finished deleting profile!', response)});

			// insert a try catch, or an if statement to determine whether ResumeOverlay exists
			deleteFromS3(req.params.Id+"ResumeOverlay.png").then((response) => {
			  console.log('Finished deleting profile!', response)});

			model.destroy({
            where: {
              Id: req.params.Id
            },
            //transaction: t
          }).then((results) => {
          if(options.cbDelete != null){
            options.cbDelete(results, req, res, next);
          }else{
            if(results == 0){
              res.status(404).json(results);
            } else {
              res.status(200).json(results);
            }
          }
        }).catch((err) => {
          processErr(err, res);
        });
			  
    });

    });
  }
};
module.exports.processErr = processErr;
module.exports.api = api;
