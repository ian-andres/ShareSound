'use strict';

var _ = require('lodash');
var Track = require('./track.model');

var AWS = require('aws-sdk');
AWS.config.region = 'us-west-1';
var S3_BUCKET = 'sharesound';

var FAILURE = -1;
var SUCCESS = 1;
var supertrackid = "";

// Get list of tracks
exports.index = function(req, res) {
	Track.find(function (err, tracks) {
		if(err) { return handleError(res, err); }
		return res.json(200, tracks);
	});
};

// Get a single track
exports.show = function(req, res) {
	Track.findById(req.params.id, function (err, track) {
		if(err) { return handleError(res, err); }
		if(!track) { return res.send(404); }
		return res.json(track);
	});
};

// Updates an existing track in the DB.
exports.update = function(req, res) {
	if(req.body._id) { delete req.body._id; }
	Track.findById(req.params.id, function (err, track) {
		if (err) { return handleError(res, err); }
		if(!track) { return res.send(404); }
		var updated = _.merge(track, req.body);
		updated.save(function (err) {
			if (err) { return handleError(res, err); }
			return res.json(200, track);
		});
	});
};

// Deletes a track from the DB.
exports.destroy = function(req, res) {
	Track.findById(req.params.id, function (err, track) {
		if(err) { return handleError(res, err); }
		if(!track) { return res.send(404); }
		track.remove(function(err) {
			if(err) { return handleError(res, err); }
			return res.send(204);
		});
	});
};


exports.getUserTracks = function(req, res){
	console.log("getting tracks for ..... " + req.params.id); 
	Track.find({uploader_id : req.params.id}, function (err, track) {
		if(err) { return handleError(res, err); }
		if(!track) { return res.send(404); }

		console.log("Found tracks: " + JSON.stringify(track));     
		return res.json(track);
	});
}; 



exports.download = function(req, res) {
	var s3 = new AWS.S3();

	res.setHeader('Content-disposition', 'attachment; filename=track.wma');

	var params = {Bucket: 'sharesound', Key: 'prelude_in_c.wma'};
	// var file = require('fs').createWriteStream('./download_test_file.wma');
	s3.getObject(params)
		.createReadStream().pipe(res);
};

// Creates a new track in the DB.
exports.create = function(req, res, callback) {
	var userID = req.query.user;
	var name = req.query.s3_object_name;
	if (!Track.isValidTrack(name)) { 
		console.log("Invalid track name.");
		supertrackid = null;
	} else {
		req.body = { 
			name: name,
			uploader_id: userID
		};
		console.log('Created track for user: ' + userID);
		Track.create(req.body, function(err, track) {
			//if(err) { return handleError(res, err); }
			//return res.json(201, track);
			supertrackid = track._id.toString();
			track.url = 'https://'+S3_BUCKET+'.s3.amazonaws.com/'+track._id;
			callback();
			console.log(JSON.stringify(track));
		});
	}
};

exports.getUploadURL = function(req, res) {
	console.log("OVER 9000 EXPIRATION!!!!! :-)");
	var trackId;
	exports.create(req, res, function() {
		trackId = supertrackid;
		if (!trackId) { return res.json(324, {'status code': FAILURE});}

		AWS.config.update({accessKeyId: process.env.AWS_ACCESS_KEY, secretAccessKey: process.env.AWS_SECRET_KEY});
		var s3 = new AWS.S3();
		var s3_params = {
			Bucket: S3_BUCKET,
		Key: trackId,
		Expires: 9001,
		ContentType: req.query.s3_object_type,
		ACL: 'public-read-write'
		};

		s3.getSignedUrl('putObject', s3_params, function(err, data){
			if(err){ console.log(err); }
			else{
				var return_data = {
					signed_request: data,
			url: 'https://'+S3_BUCKET+'.s3.amazonaws.com/'+s3_params.Key
				};
				res.write(JSON.stringify(return_data));
				res.end();
			}
		});
	});
};

exports.upload = function(req, res) {
	var file = req.files.toUpload;
	var options = {
	};
};

exports.foo = function(req, res) {
	console.log("FOOOOO");
	console.log(JSON.stringify(req.query));
};

function handleError(res, err) {
	return res.send(500, err);
}
