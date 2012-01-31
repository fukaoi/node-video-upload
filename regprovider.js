var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test');

var Schema = mongoose.Schema,
    ObjectId = Schema.Objectid;

var Post = new Schema({
    filename: String,
    file: String,
    create_at: Date
});

mongoose.model('Post', Post);
var Post = mongoose.model('Post');

RegProvider = function(){};

RegProvider.prototype.findAll = function(callback) {
  Post.find({}, function(err, posts) {
          callback(null, posts)
      });
};

RegProvider.prototype.findById = function(id, callback) {
  Post.findById(id, function(err, posts) {
          callback(null, posts)
      });
};

RegProvider.prototype.save = function(params, callback) {
    var post = new Post(
        {filename: params['filename'],
         file: params['file'],
         create_at: new Date().toLocaleString().toString()});
        post.save(function(err) {
           callback();
        });
};
exports.RegProvider = new RegProvider();