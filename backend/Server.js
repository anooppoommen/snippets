
// a server class representing the main server app

const express = require('express');
const bodyParser = require('body-parser');
const socketio  = require('socket.io');
const http = require('http')
const jwt = require('jsonwebtoken');
const middlewares = require('./middlewares');
const DatabaseControllerPG = require('./Controllers/DatabaseControllerPG');

const cors = require('cors');
const SubscriberManager = require('./SubcriberManager');
var csv = require('csv-express')

class Server{
    /**
     * @constructor
     * @param options  thsocket of the app  
     */
    constructor(options){
        
        this.options = options;

        //for general http server
        this.api = null;

        //for chat server
        this.websocket = null;
        this.http = null;
        this.manager = null;
        this.messenger = null;
    }

    /**
     * @configServer 
     * used to initialise the api attribute with an object of express
     */
    async configServer(){

        var api = express();

        api.use(bodyParser.urlencoded({limit: '40mb', extended: true, parameterLimit: 1000000}));
        api.use(bodyParser.json({limit: '10mb', extended: true}));
        api.use(cors()); //allow cross domain requesting of urls
        
        //url to check health of server
        api.use('/health',function(req,res){
        
            res.json({
                health : true
            });
        
        });
        //ignore this route
        api.use('/s',express.static('./src/public'))
        //setup the database
        var db = new DatabaseControllerPG({
            host    : this.options.db.host,
            user    : this.options.db.user,
            password: this.options.db.password,
            db      : this.options.db.db
        });

        var dbStatus = await db.makeConnection();
        if(dbStatus !== true){
            return false;
        }

        //api.locals.db = db;
        api.set('db',db);
        api.set('x-powered-by',false);
        api.set('signature',this.options.signature);

        this.api     = api;
        this.manager = new SubscriberManager(db);
        
        return true;
    }

    async mountRoutes(){
        
        // ... mounted routes removed

        return true;
    }
    
    startQueueManager(){
        return false;
    }

    startSocketService(){
    
        this.http = http.createServer(this.api)
        this.websocket = socketio(this.http,{ origins: '*:*',path: "/channel"});
        
        //only authorized users are allowed to connect to the websocket

        this.websocket.on('connection', (socket) => {
            
            // socket.auth = false;
            socket.auth = false;
            socket.secureid   = uuid();
            
            socket.on('authenticate', (data) => {
                try{
                    var token = data.token;
                    var verify = jwt.verify(token,this.options.signature);
                    socket.user = verify;
                    socket.auth = true;                    
                    socket.emit('res', { auth : true, id:socket.secureid, token : token});
                    //now register it to the subscription manager
                    this.manager.addSubscriber(socket)
                }
                catch(e){
                    console.log(e)
                    socket.emit('res', { auth:false })
                }        
                
            })

        });

    }
    /**
     * @startServer
     * start the server on the specifed port in the options 
     */
    async startServer(){
        //set server congiurations
        var serverConfigStatus = await this.configServer();
        
        if(serverConfigStatus !== true){
            console.log("FATAL: Failed to configure server")
            return false;
        }

        await this.mountRoutes();
        
        // start the server
        
        this.startSocketService();
        this.http.timeout = 40000;
        this.http.listen( this.options.port,() =>{
            console.log("INFO: Server Started.");
            console.log("INFO: Listening on "+this.options.port);
        });
        //start the redis queue manager
        const  {PubsubManager} = require('redis-messaging-manager');

        this.messenger = new PubsubManager({
            host: process.env.redis_host || 'localhost',
            port: process.env.redis_port || 6379,
            user: process.env.redis_user || 'redis',
            password : process.env.redis_password || ''
        });
        
        this.messenger.consume('recorded').subscribe((msg) => {
            
            var vector = msg.split(":")
            vector = { channel : vector[0], msg : vector[1] }
            
            this.manager.consume(vector);

        });
        
    }
    
}

module.exports = Server;