const mongoClient = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017/IoT';
var singleton;

class database{
  constructor(){
    if(singleton != undefined)
      return singleton;

    this.count = 0;
    singleton = this;
  }

  getDB(){
    var p = new Promise((resolve, reject)=>{
      mongoClient.connect(url, function(err, db){
      	if(!err){
          console.log(`[Database] ${singleton.count++}th connection established`);
          resolve(db);
        }
      	else{
          console.log('[Database] Error!!')
          console.log(err);
          reject();
        }
      })
    });
    return p;
  }

  closeDB(db){
    db.close();
    this.count--;
  }
}

module.exports = database;
