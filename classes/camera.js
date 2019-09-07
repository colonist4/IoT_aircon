const fs = require('fs');
const ws = require('ws');
const {exec, spawn} = require('child_process');
const jwt = require('jsonwebtoken');
const secret = require('../config/jwt_secret.js').secret;


// const Args = "-w 680 -h 480 -t 0 -o /var/www/IoT/img/camera.jpg -n -tl 100";
const imagePath = '/var/www/IoT/img/camera.jpg';
const Args_ = ["-w","680","-h","480","-t","0","-o","/var/www/IoT/img/camera.jpg","-n", "-tl", "1000", "-q", "10"];

const wss = new ws.Server({
  port:8080
})
wss.on('connection', function(ws, request){
  if(camera.ws != undefined) {
    camera.ws.close(1000)
    camera.ws = undefined
  }
  jwt.verify(request.headers.cookie.match(/IoT-token=.+;*/)[0].slice(10), secret, (err, decoded) =>{
    if(err) {
      console.log("[Camera] Has no previllige");
      ws.close(1008);
    } else{
      if(decoded.username == 'seongJun'){
        console.log("[Camera] Websocket connection");
        camera.ws = ws;
        ws.onclose = function(){
          camera.ws = undefined;
        }
      } else{
        console.log("[Camera] Has no previllige");
        ws.close(1008);
      }
    }
  });
  // console.log(ws);
  // var arr = new Int32Array(4);
  // for(var i=0; i<4; i++)
  //   arr[i] = i;
  // ws.binaryType = "arraybuffer";
  // ws.send(arr, {binary:true})
})

var camera;

class Camera{
  constructor(){
    if(camera != undefined){
      return camera;
    }
    this.watcher = undefined;
    this.process = undefined;
    process.on('exit', (code)=>{
      if(camera.ws != undefined){
        camera.ws.close(1000);
      }
      wss.close();
      if(camera != undefined){
        camera.stopStream();
        console.log("[Camera] Stop Stream before process exit");
      }
    })
    process.on('SIGINT', (code)=>{
      process.exit();
    })
    camera = this;
  }

  startStream(){
    if(this.process == undefined){
      if(this.watcher == undefined){
        this.watcher = fs.watchFile(imagePath, {interval:200}, (current, previous)=>{
          // console.log(current.ctime, previous.ctime);
          if(camera.ws != undefined && camera.ws.readyState == 1){
            var data = fs.readFile(imagePath, (err, data)=>{
              if(!err){
                camera.ws.send(data, {binary:true});
                console.log("[Camera] Send image data");
              } else{
                console.log("[Camera] Error in sending image : "+err.message)
              }
            });
          }
        });
      }

      this.process = spawn('raspistill', Args_);
      this.process.on('error', (err)=>{
        console.log('[Camera] Error in child process. Stop stream : '+err.message);
        camera.stopStream();
      })
      this.process.on('exit', (code, signal)=>{
        console.log('[Camera] Exit child process. Stop stream');
        camera.stopStream();
      })
    }
  }

  stopStream(){
    if(this.process != undefined){
      if(this.watcher != undefined){
        fs.unwatchFile(imagePath)
        this.watcher = undefined;
      }
      this.process.kill('SIGKILL');
    }
  }
}

module.exports = Camera;
