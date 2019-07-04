const ModelController = require('../controllers/ModelController');
const UserModel  = require('../models/UserModel');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const winston = require('../logger');
const defaults = require('../defaults');
const crypto = require('crypto');
const { validationResult, check }  = require('express-validator/check');
const bluebird = require("bluebird");

var redis = require('redis');
bluebird.promisifyAll(redis);

var client = redis.createClient( process.env.REDIS_CACHE );
const middlewares = require('../middlewares');

// we use asyn await instead of the general callback 
// it makes the code a whole lot easier to read and 
// work with.

async function creationModifier(data){

    if(data['password'] != undefined){

        // all users have passwords and hence it needs to be modified
        data['password'] = bcryptjs.hashSync(data['password'],10);
        
    }

    if(data['usertype'] != undefined){

        // all users have usertypes and hence it needs to be modified
        // but a super admin is 3 hence it should never be registered on
        // on a normal route.

        var ut = parseInt(data['usertype']);
        if(ut >= 3 || ut < 0 ){
            ut = 0;
            return {
                msg : "invalid user group",
                status: false,
                data: {
                    name: 'usertype'
                }
            };
        }

        data['usertype'] = ut;
        
    }

    return {
        msg: 'done',
        status: true,
        data: data
    }

}

// Ths is our custom dynamic api generation class
// it implements most of the required CRUD operation

var controller  = new ModelController(UserModel,{
    redisUrl: process.env.REDIS_CACHE || undefined,
    level: 'high',
    modifier: creationModifier,
    protectedfields: {password: 0},
    middleware: middlewares.isAuthorised
});

// a helper to assign error messages to a single field
// having an array. To help clients easily display messages
function flattenError(errors){
    var fin = {};
    errors.array().forEach(element => {
        if(fin[element.param] === undefined)
            fin[element.param] = [element.msg]
        else
            fin[element.param].push(element.msg);
        
    });
    return fin;
}

// CRUD doesn't handel all the logic for a project so cusotm logic
// can also be added to the created CRUD router

let loginurl = `${controller.prefix}/login`;
let loginChecks = [check('username','Username missing').exists().isString(), check('password').exists().isString()];
controller.router.post(loginurl,...loginChecks, async(req,res) => {

    try {
        var errors = validationResult(req);

        if(!errors.isEmpty()){
            res.status(400).json({
                status: false,
                errors: flattenError(errors) ,
                msg : "invalid data"
            })
            return;
        } 
        
        const {username, password } = req.body;

        var user = await UserModel.findOne({username: username});
        if(user === undefined || user === null){
            
            res.status(401).json({
                status: false,
                auth: false,
                msg: 'invalid username or password'
            });
            return;

        }

        const validationResult = await bcryptjs.compare(password, user.password);

        if( validationResult ){
            
            var tokendata = {
                ...user,
                createdon: Date.now()
            }

            var tok = jwt.sign(tokendata, process.env.SERVER_SIGNATURE || defaults.token );
            var key = crypto.Hash('sha256').digest(tok).toString('hex');
            
            await client.setexAsync(key,86400,tok);
            // await client.zaddAsync(user._id.toString(), Date.now, key);

            res.status(200).json({
                auth: true,
                status: true,
                token : tok
            });
        }

    } catch (e) {
        winston.error(`Failed to execute ${req.path} ${e.message} ${e.stack}`);
        res.status(200).json({
            status: false,
            msg: 'Auth internal error'
        });
    }

});

module.exports = controller.router;