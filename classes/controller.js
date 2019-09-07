// const raspi = require('raspi-io');
// const five = require('johnny-five');
const sensor = require('node-dht-sensor');
const exec = require('child_process').exec;

const greyCode = ['0000', '0001', '0011', "0010", '0110', '0111', '0101', '0100', '1100', '1101', '1001', '1000', '1010', '1011']
const modeCode = {냉방:"00", 제습:"01", 자동:"10", 송풍:"11100100"};
const speedCode = {강:"001", 중:"010", 약:"100", 없음:"101", 특수:"000"};

const superSpeed = "0x4ab50af55da2";

const power = {
  off:"0x4db2847b1fe0",
  on:"0x4db240bfff00"
}

var controller;

class Controller{
  constructor(){
    if(controller != undefined){
      return controller;
    }
    controller = this;
  }

  _fromHEXtoBIN(hex){
    hex = Number(hex).toString(2);
    if(hex.length < 48){
      var zero = "";
      for(var i=0; i<48-hex.length; i++)
        zero += "0";
      hex = zero+hex;
    }
    return hex;
  }

  _sendCode(code){
    if(code.length != 48) {
      console.log("[Controller] Error in sendCode : Length of code is too short")
      return;
    }
    exec('/var/www/IoT/external/main '+code, (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return;
      } else{
        console.log("[Controller] Successfully send Code");
      }
    });
  }

  powerOff(){
    console.log("[Controller] Send Power On Signal!!")
    this._sendCode(this._fromHEXtoBIN(power.off));
  }

  powerOn(){
    console.log("[Controller] Send Power On Signal!!")
    this._sendCode(this._fromHEXtoBIN(power.on));
  }

  send(temperature, speed, mode){
    if(mode == "제습" || mode == "자동") speed = "특수";
    if(speedCode[speed] == undefined ||
      modeCode[mode] == undefined ||
      greyCode[temperature-17] == undefined)
      return;

    var signal = "0100110110110010";
    var signal_speed = speedCode[speed];

    signal_speed += "11111";


    var signal_temp_mode;
    if(mode == '송풍'){
      signal_temp_mode = modeCode[mode];
    } else{
      signal_temp_mode = greyCode[temperature-17];
      signal_temp_mode += modeCode[mode] + "00";
    }


    for(var i=0; i<8; i++){
      if(signal_speed[i] == '0')  signal += '1';
      else signal += '0';
    }
    signal += signal_speed;

    for(var i=0; i<8; i++){
      if(signal_temp_mode[i] == '0')  signal += '1';
      else signal += '0';
    }
    signal += signal_temp_mode;
    this._sendCode(signal);
  }

}


module.exports = Controller;
