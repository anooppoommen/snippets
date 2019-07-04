const defaults = require('./defaults');
const bluebird = require('bluebird');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const redis = require('redis');
// making redis into a promise makes programming 
// a lot easier

bluebird.promisifyAll(redis);
const client = redis.createClient( process.env.REDIS_CACHE );
const winston = require('./logger');

module.exports = {
    isAuthorised : function(req,res,next){
        const verificationHeader = req.headers['x-auth-token'];
        const verify;

        if(verificationHeader === undefined || verificationHeader === null || verificationHeader === ''){
            res.status(400).json({ // bad request format
                status : false,
                msg : 'auth error'
            });
            return;
        }
        
        try{
            
            // all token are available for one day before it is marked 
            // as invalid. all issued tokens are stored to the defualt cache
            // server to . this allows for a clean removal without just relying on
            // on the token
            
            var key = crypto.Hash('sha256').digest(verificationHeader).toString('hex');
            var serverToken = client.getAsync(key);
            
            if(serverToken !== verificationHeader){
                res.status(401).json({ // unauthorized access due to expired token
                    status: false,
                    msg: 'Token expired'
                });
                return;
            }
            
            verify = jwt.verify(verificationHeader,process.env.SERVER_SIGNATURE || defaults.token);
            
            req.user = verify;
            next();

        }
        catch(e){
            winston.error(`Failed to executed auth middleware ${e.message} ${e.stack}`)
            res.status(400).json({ //bad request
                status : false,
                msg : 'auth error'
            });
        }
    }
}