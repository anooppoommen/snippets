const express = require('express');
const winston = require('../logger');
const checkType = require('check-types');
const emailValidator = require('email-validator');
const Policy = require('./PolicyController');
const bluebird = require('bluebird');

var redis = require('redis');
// making redis into a promise makes programming 
// a lot easier
bluebird.promisifyAll(redis);

class ModelController{

    constructor(model,options={}){

        this.router   = express.Router();
        this.model    = model;
        this.handlers = {};

        // Protection level low only 
        // applies the auth middleware to  creation, update, push, pop and delete
        // in high the auth middleware is applied to all the routes

        this.protectionLevel =  options.level === undefined || options.level == null? "low": options.level;
        this.authorizationMiddleware = options.middleware === undefined || options.middleware === null ? this.defaultAuthMiddlerware : options.middleware;

        // For performance improvement we use a redis cache
        // All read routes write to a cache with a key of the url
        
        this.cacheRedisServerUrl =  options.redisUrl;
        this.cache = null;
        this.cacheEnabled = false;

        if(options.redisUrl !== null && options.redisUrl !== undefined){

            this.cache = redis.createClient(options.redisUrl);

            // this should auto enable the cache as soon as the
            // redis server connects.

            this.cache.on("connect", ()=>{
                winston.info(`Connected to redis cache for ${this.prefix}`)
                this.cacheEnabled = true;
            });
        }

        // every key set to the redis cache has to be invalidated
        // the invalidateKeys stores a list of cached keys. Once the 
        // invalidate function is called this is removed fastly.
        // all update functions are invalidators.

        this.invalidateKeys = [];
        this.creationModifier = options.modifier || undefined;
        // protected fields are the ones which are not disclosed to user
        // they are either returned on authorized routes
        // or never shown. They are similar to a projection format in
        // mongoose. 
        
        this.protectedfields = options.protectedfields === undefined ? {} : options.protectedfields;

        if( options.prefix === null || options.prefix === undefined){
            this.prefix =  '/'+ model.modelName.toLowerCase().replace('model','')
        }else{
            this.prefix = options.prefix;
        }

        this.modifiable = options.modifiable || true;
        
        this.creationroutes = [];
        this.readroutes = [];
        this.updateroutes = [];
        this.policy = new Policy(this.options.policy || {});
        this.registerAllRoutes();

    }

    // just a helper can be removed later
    isCacheEnabled(){
        return this.cache !== null && this.cacheEnabled ;
    }

    getFields() {
        // ...
    }

    registerHandlerField(url,handler){
        //...
    }

    getHandlerFields(req,type){
        var data;

        switch(type){
            case 'GET'  : data = req.query;
            case 'PARAM': data = req.params; break;
            case 'POST' :
            default: data = req.body;
        }
        
        var fields = this.handlers[req.path];
        var finalDataObject = {};

        for( var i in fields){
            if(i === undefined)
                continue;
            
            finalDataObject[fields[i]] = data[fields[i]];
        }
        return finalDataObject;

    }

    validationResult(status,msg,data={}){
        return {
            status: status,
            msg: msg,
            data: data
        }
    }

    defaultAuthMiddlerware(req,res,next){
        try {

            next();
            
        } catch (e) {
            winston.error("Failed to execute default auth middleware");
            res.status(500).json({
                status: false,
                msg: "Middleware error"
            })
        }
    }

    // all data will be cached for a 24 hr period
    // by default this can be adjusted using the ex
    // parameter. It takes the time as an interger
    // representing the number of seconds.
    async setCacheData(key,data,ex=86400){
        try {
            
            if(!this.isCacheEnabled()){
                return false;
            }

            var dataString = JSON.stringify(data);
            await this.cache.setexAsync(key,ex,dataString);

            // all key is to be invalidated on update
            if(this.invalidateKeys.indexOf(key) != -1){
                this.invalidateKeys.push(key);
            }
            return true;

        } catch (e) {
            winston.error(`Failed to cache ${key} ${e.message}  ${e.stack}`);
            return false;
        }
    }

    async getCacheData(key){

        // ...

    }

    async deleteCacheData(key){

        // ...
    }

    async invalidateCache(){
        var promiseArray = []

        // instead of waiting for each deletion to work we call all deletions 
        // asyn and store it to an array.
        for(var i =0 ;i < this.invalidateKeys.length; i++){
            promiseArray.push(this.deleteCacheData(this.invalidateKeys[i]));
        }

        var resDel = await Promise.all(promiseArray);
        return resDel.indexOf(false) === -1;

    }

    
    
    async validator(data,fieldsDefnitions){
        var finalData = {};

        // ..
    }

    

    async updateArrayObjectHandler(req,res){
        try {
            
            // the handler should have the entry for the 
            // type of the subdocument
            var fields = this.handlers[req.path][0];

            var data = req.body;
            const {id, subid} = req.body;
            var mainField = this.handlers[req.path][1]

            if(id === undefined || id === null || id === ""){
                res.status(401).json({
                    status: false,
                    msg: "invalid parameter id"
                });
                return;
            }

            if(subid === undefined || subid === null || subid === ""){
                res.status(401).json({
                    status: false,
                    msg: "invalid parameter subid"
                });
                return;
            }

            // this forms the query
            var query = {};
            query['_id'] = id;
            query[`${mainField}._id`] = subid;

            var validationCheck = await this.updateValidator(data,fields);

            if(validationCheck.status == false){
                res.status(401).json(validationCheck);
                return;
            }

            data = validationCheck.data;
            var formedData = {};

            for(var fieldName in data){
                
                if(fieldName === undefined ){
                    continue;
                }

                if(data[fieldName] ===  undefined){
                    continue;
                }

                formedData[`${mainField}.$.${fieldName}`] = data[fieldName];

            }

            // once the data is formed then the query should execute
            // like a normal query.

            await this.model.updateOne(query,{$set:formedData});

            this.invalidateCache();

            res.status(200).json({
                status: true,
                msg: "Successfully updated value"
            });

        } catch (e) {
            winston.error(`Failed to execute updateArrayObjectHandler at ${req.path} ${e.message} ${e.stack}`);
            res.status(500).json({
                status: false,
                msg : 'Internal Server error'
            });
        }
    }

    async deleteHandler(req,res){
        try {       
            
            // All delete requests will be based on the _id of the 
            // document.  
            const { id }   = req.body;
            
            if(id === undefined || id === null || id === ''){
                res.status(401).json({
                    status: false,
                    msg : 'Invalid data'
                });
                return ;
            }

            var one = await this.model.findById(id);
            
            if(one === undefined || one === null){
                res.status(404).json({
                    status: false,
                    msg : 'object not found'
                });
                return;
            }


            await this.model.deleteOne({_id : id})
            
            this.invalidateCache();

            res.status(200).json({
                status : true,
                msg : 'Deleted successfully'
            })
            
        } catch (e) {
            winston.error(`Failed to register a create model handler at ${req.path} ${e.message} ${e.stack}`);
            res.status(500).json({
                status: false,
                msg : 'Internal server error'
            });
            return false;
        }
    }

    async deleteModel(){
        var url = `${this.prefix}/delete`;
        this.updateroutes.push(url);
        var middlewares = [];
        middlewares.push(this.authorizationMiddleware)

        this.router.post(url,middlewares, async (req,res) => {
            try {
                await this.deleteHandler(req,res);
            } catch (e) {
                winston.error(`Failed to register a update model handler at ${url} ${e.message} ${e.stack}`);
                res.status(500).json({
                    status: false,
                    msg : 'Internal server error'
                });
                return false;
            }
        });
    }

    async checkdeftype(value,def){
        switch(def.type[0].name){
            case 'String' : return checkType.string(value);  break;
            case 'Number' : return checkType.number(value);  break;
            case 'ObjectId':
                    // This becomes complecated as we need to check if the object exists
                    // and dynamically load the model
                    var ref = def.ref;
                    // need to add a model directory for gloabal use
                    var refModel = require('../models/'+ref);
                    var existsCheck = await this.checkExists(value,refModel);
                    return existsCheck;
        }
    }

    // ... 
    
    async registerAllRoutes(){
        await this.createModel();
        await this.viewAll();
        await this.viewFields();
        await this.uniqueFieldSearch();
        await this.withId();
        await this.deleteModel();
        
        // some model need to be created but it does not need to 
        // be modified.
        if(this.modifiable){
            await this.updateModel();
            await this.arrayPush();
            await this.arrayPop();
            await this.arrayIn();
        }
    }

}

module.exports = ModelController;