
const Server = require('./src/Server');

const options ={
    port : process.env.PORT || 3000,
    db   : {
        host     : process.env.host     ||'localhost',
        user     : process.env.user     ||'root',
        password : process.env.password ||'root',
        db       : process.env.database ||'ray',
        port     : process.env.port     || 5432
    },
    signature    : process.env.TOKEN || '^ma8rw.a2n004p.6ty7uh.gh07st.al4p3.&tybn$'
}

if(process.env['PRODUCTION'] === undefined){
    console.log("DEVELOPMENT ENVIRONMENT")
    require('dotenv').config();
}

app = new Server(options);

app.startServer();
