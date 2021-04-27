const express = require("express");
const app = express();
const port  = 4000;
var mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
var http= require("http").Server(app);
const io = require("socket.io")(http);


app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}))


app.listen(port,()=>{
    console.log("Chat Application is running at http://localhost:"+port );
});

app.get("/",(req,res)=>{
    res.send("Welcome to the Chat Application");
}) 

mongoose.connect('mongodb://localhost:27017/chat-app', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true
}).then(()=>{
    console.log("DB connected successfully");
}).catch((err)=>{
    console.log(err);
    process.exit();
})

var Message = mongoose.model('Message',{
    name : String,
    message : String,
    createdOn:{
        type:Date,
        default:Date.now
    }
  })

  app.get('/messages',(req,res)=>{
      Message.find((err,messages)=>{
          if(err){
              res.status(500).send({message:err});
          }
          res.send({
              data:messages
          })
      })
  })


  app.post('/messages',(req,res)=>{
      let msg = new Message();
      msg.message = req.body.message;
      msg.name = req.body.name;
      msg.save((err,response)=>{
        if(err){
            res.status(500).send({message:err});
        }
        io.emit('message',response);
        res.send({
            data:response
        })
      }) 
  })

  io.on('connection', () =>{
    console.log('a user is connected')
  })