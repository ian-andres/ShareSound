'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ProjectSchema = new Schema({
  name: String,
  owner: String,
  tracks: [String],
  tags: [String],
  id: String,
  description: String,
  active: Boolean
});


module.exports = mongoose.model('Project', ProjectSchema);