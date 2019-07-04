var  mongoose = require('mongoose');

function usertypevalid(v){
    try {
        var vt = parseInt(v);
        
        if(vt < 0 || vt > 3)
            return 0;
        
        return vt;
            
    } catch (e) {
        return 0;
    }
}

function roleset(v){
    if(v=== undefined || v === null){
        return 'guest';
    }
    v = v.toLowerCase();
    var allowedList = ['guest','user','client','admin'];

    if(allowedList.indexOf(v) === -1){
        return 'guest';
    }
    return v;
}

var UserSchema = mongoose.Schema({
    
    username : { type: String, required: true, unique: true, trim: true, index: true},
    password: {type: String, required: true},
    name : { type: String, required: true, trim: true},
    email: {type: String, required: true},
    phone: {type: String, required:true},
    address0: {type: String},
    address1: {type: String},
    city: {type: String},
    state: {type: String},
    country: {type: String, default: 'India'},
    image: {type: String},
    usertype: {type:Number,default: 0, index: true, set: usertypevalid },
    createdon: {type: Date, default: Date.now},
    role: {type: String, default: 'guest', set: roleset}
});

module.exports = mongoose.model('UserModel', UserSchema);