// const raspi = require('raspi-io');
// const five = require('johnny-five');
const sensor = require('node-dht-sensor');
const database = new (require('./database.js'))();

class DHT11{
  constructor(){
    if(dht11 != undefined){
      return dht11;
    }
    this.temperature = 0;
    this.humidity = 0;
    this.time = new Date();
    this.startRead();
    dht11 = this;
  }

  stopRead(){
    if(this.intervalID)
      clearInterval(this.intervalID)
  }

  startRead(){
    if(!this.intervalID)
      this.intervalID = setInterval(this._read, 100000);
  }

  getRecentData(from, to){
    var p = new Promise((resolve, reject)=>{
      database.getDB()
      .then((db)=>{
        var coll = db.collection('DHT11');
        // console.log(from ,to);
        coll.find({"time":{"$gt":new Date(from), "$lte":new Date(to)}}, {"_id":0}).toArray(function(err, docs){
          database.closeDB(db);
          if(!err){
            console.log("[DHT11] Successfully load data");
            resolve(docs);
          }
          else{
            console.log("[DHT11] Fail to load data : ");
            console.log(err);
          }
        })
      }, ()=>{
        console.log("[DHT11] Fail to load recent data : Cannot connect to DB");
      })
    })

    return p;
  }

  _read(){
    sensor.read(11, 4, function(err, temperature, humidity){
      if(!err){
        dht11.temperature = temperature;
        dht11.humidity = humidity;
        dht11.time = new Date();
        console.log("[DHT11 Data] ", dht11.temperature, dht11.humidity, dht11.time);
        dht11._saveData(dht11.temperature, dht11.humidity, dht11.time);
      } else{
        console.log(err);
      }
    })
  }

  _saveData(temperature, humidity, time){
    database.getDB()
    .then((db)=>{
      var coll = db.collection('DHT11');
      coll.insertOne({
        temperature:temperature,
        humidity:humidity,
        time:time
      }, function(err, result){
        database.closeDB(db);
        if(!err)
          console.log("[DHT11] Successfully save data");
        else{
          console.log("[DHT11] Fail to save data : ");
          console.log(err);
        }
      })
    }, ()=>{
      console.log("[DHT11] Fail to save data : Cannot connect to DB");
    })
  }
}

var dht11;

module.exports = DHT11;
