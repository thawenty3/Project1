let mongoose = require('mongoose');

//comment schema
let commentSchema = mongoose.Schema({
    body:{
        type:String,
        required:true
    },
    id:{
        type:String,
        required:true
    },
    writer:{
        type:String,
        required:true
    }
});

let Comment = module.exports = mongoose.model('Comment',commentSchema);
