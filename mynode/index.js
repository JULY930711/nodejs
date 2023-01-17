if(process.argv[2]&&process.argv[2]=="dev"){
  require('dotenv').config({path:'./dev.env'})
}else{
  require('dotenv').config({path:'./production.env'})
}



const express = require('express');
const server = express();
const upload = require('./modules/upload-imgs');
const session = require('express-session');
const mysqlStore = require('express-mysql-session')(session);
const moment = require('moment-timezone');
const db = require('./modules/db-connection');
const sessionStore = new mysqlStore({},db);
const corsOptions = {
  credentials: true,
  origin: function(origin, cb){
    console.log({origin});
    cb(null, true);
  }
};
server.use(cors(corsOptions));
server.set("view engine","ejs");
server.use(cors());
server.use(session({
  saveUninitialized:false,
  resave:false,
  secret:'qwertyuiop1234567890',
  store:sessionStore,
  cookie:{maxAge:1200000}
}))
server.use(express.urlencoded({extend:false}));
server.use(express.json());
server.use((req,res,next)=>{
  res.locals.title='客户资料表';
  res.locals.myToDateString = d => moment(d).format('YYYY-MM-DD');
  res.locals.myToDatetimeString = d => moment(d).format('YYYY-MM-DD HH:mm:ss');

  next();
})


server.use('/address-book', require('./router/address-book'));


server.get('/try-db',async (req,res)=>{
const [result]=await db.query("SELECT * FROM `address_book`LIMIT 5" );
res.json(result)
})
server.get('/try-time',(req,res)=>{
  const fm = 'YYYY-MM-DD HH:mm:ss';
  const mo1=moment(new Date());
  res.json({
    londonm1:mo1.tz('Europe/London').format(fm)
  })
})
server.get('/try-session',(req,res)=>{
  req.session.my_var = req.session.my_var ||0;
  req.session.my_var++;
  res.json(req.session)
})

server.get('/',function(req,res){
  res.render('main',{name:'july'})
});
server.get('/sales-json',function(req,res){
const data = require(__dirname+'/data/sales')
  res.render('sales-json',{data,name:'业务员资料'})
});
server.get('/test-qs',function(req,res){
  res.json(req.query)
});

server.post(['/test-post','/test-post1'],function(req,res){
  res.json({
    query:req.query,
    body:req.body
  })
});
server.get('/post-form',function(req,res){
  res.render('form')
});
server.post('/post-form',function(req,res){
  
  res.render('form',req.body)
});

server.post('/try-insert',upload.array('photos', 5),function(req,res){
  
  res.json({body:req.body,files:req.files});
});

server.get('/p1',function(req,res){
  
  res.json(req.query);
});
server.use('/admin',require(__dirname+'/router/myrouter'))

server.use(express.static('public'));
server.use(express.static('node_modules/bootstrap/dist'));
server.use(function(req,res){
  // res.type('text/plain')
  res.status(404).send(`<h1>sorry,we can not find this page</h1><h1>404</h1><img src="/images/柯南.jpg">`);
})
server.use(function(err,req,res){
  // res.type('text/plain')

  res.status(500).json(err);
})
const port = process.env.PORT||3000;
server.listen(port,function(){
  console.log(`伺服器启动:${port}`)
})