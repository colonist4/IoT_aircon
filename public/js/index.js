var temperatureProgress = new ProgressBar.Circle('#temperature-progressbar',
{
    strokeWidth:5,
    trailWidth:5,
    svgStyle:{
    },
    text:{
        value:"<strong>30</strong>",
        className:"text-primary text-center m-0 p-0",
        style:{
            position:"absolute",
            transform:"translate(-50%, -50%)",
            left:"50%",
            top:"50%",
            "font-size":"2rem"
        }
    },
    easing:'easeOut',
    from:{
        color:'#00ff00'
    },
    to:{
        color:'#ff0000'
    },
    step:function(state, circle, attachment){
        circle.path.setAttribute('stroke', state.color);
        if(circle.text){
            circle.text.innerHTML = `<strong style="color:${state.color}"> ${(circle.value()*50).toFixed(0)} </strong>`
        }
    }

})

var humidityProgress = new ProgressBar.Circle('#humidity-progressbar',
{
    strokeWidth:5,
    trailWidth:5,
    svgStyle:{
    },
    text:{
        value:"<strong>30</strong>",
        className:"text-primary text-center m-0 p-0",
        style:{
            position:"absolute",
            transform:"translate(-50%, -50%)",
            left:"50%",
            top:"50%",
            "font-size":"2rem"
        }
    },
    easing:'easeOut',
    from:{
        color:'#81DAF5'
    },
    to:{
        color:'#0080FF'
    },
    step:function(state, circle, attachment){
        circle.path.setAttribute('stroke', state.color);
        if(circle.text){
            circle.text.innerHTML = `<strong style="color:${state.color}"> ${(circle.value()*100).toFixed(0)} </strong>`
//                "<strong>"+(circle.value()*100).toFixed(0)+"</strong>";
//            circle.text.setAttribute('color', state.color);
        }
    }

})



var graphCtx = document.getElementById('graph').getContext("2d");
var graph = new Chart(graphCtx, {
    type:'line',
    data :{
        datasets:[{
            label:"최근 실내 온도",
            data:[],
            lineTension:0,
//            backgroundColor:"transparent",
            borderColor:"#FE2E2E",
            // borderWidth:1,
            fill:false,
            yAxisID:"temperature",
            pointRadius:0
        }, {
            label:"최근 실내 습도",
            data:[],
            lineTension:0,
//            backgroundColor:"transparent",
            borderColor:"#007bff",
            fill:false,
            yAxisID:"humidity",
            pointRadius:0
        }]
    },
    options:{
        maintainAspectRatio:false,
        legend:{
            display:false
        },
        tooltips:{

        },
        scales:{
            yAxes:[{
                id:'temperature',
                type:'linear',
                offset:true,
                ticks:{
                    // beginAtZero:true,
//                    callback:function(value, index, values){
//                        return value+"C";
//                    },
                    padding:0,
                    fontColor:"#FE2E2E",
                },
                scaleLabel:{
                    display:true,
                    labelString:"온도(C)",
                    padding:0,
                    lineHeight:1
                }
            },{
                id:'humidity',
                type:'linear',
                offset:true,
                ticks:{
                    // beginAtZero:true,
//                    callback:function(value, index, values){
//                        return value+"C";
//                    },
                    padding:0,
                    fontColor:"#007bff",
                },
                scaleLabel:{
                    display:true,
                    labelString:"습도(%)",
                    padding:0,
                    lineHeight:1
                },
                position:'right'
            }],
            xAxes:[{
                type:'time',
                ticks:{
                    // beginAtZero:true,
//                    callback:function(value, index, values){
//                        return value+"hr";
//                    },
                    autoSkip:true
                },
                scaleLabel:{
                    display:false,
                    labelString:"시간"
                },
                time:{
                    unit:'hour'
                }
            }]
        }
    }
})

function updateGraph(){
  var from = new Date(), to = new Date();
  from.setDate(from.getDate()-1);
  postAjax('/api/data', {from:from, to:to}, (data, status, xhr)=>{
    if(data.success){
      // console.log(data);
      graph.data.datasets[0].data = [];
      graph.data.datasets[1].data = [];
      for(var i=0; i<data.message.length; i++){
        graph.data.datasets[0].data.push({t:data.message[i].time, y:data.message[i].temperature});
        graph.data.datasets[1].data.push({t:data.message[i].time, y:data.message[i].humidity});
      }
      graph.update();

      let currentTemperature = data.message[i-1].temperature;
      let currentHumidity = data.message[i-1].humidity;
      temperatureProgress.set(0);
      temperatureProgress.animate(currentTemperature/50, {
          duration:2000,
          easing: 'easeOut'
      })

      humidityProgress.set(0);
      humidityProgress.animate(currentHumidity/100, {
          duration:2000,
          easing: 'easeOut'
      })
    }
  })
}

window.addEventListener('load', (e)=>{
  if(getCookie('IoT-username')){
    updateGraph();
    setInterval(updateGraph, 60000);

    var ws = new WebSocket('ws://seongjunpc.cf:3001')
    ws.onopen = function(){
      console.log("OPEN")
    }
    ws.onmessage = function(ev){
      console.log(ev);
      document.getElementById('image').src = URL.createObjectURL(ev.data);
    }
    document.getElementById('image').addEventListener('load', function(evt){
      URL.revokeObjectURL(evt.target.src);
    })
  }
})

function remoteControl(operation, options){
  const operators = {
    "changeTemperature":function(options){
      var temperature = document.getElementById('temperature').innerHTML;
      temperature = Number(temperature) + (options.change=='up'?1:-1)
      if(temperature >= 17 && temperature <= 30){
        document.getElementById('temperature').innerHTML = temperature;
      }
    },
    "changeMode":function(element){
      $(element).siblings().removeClass('active');
      $(element).addClass('active');
    },
    "changeSpeed":function(element){
      $(element).siblings().removeClass('active');
      $(element).addClass('active');
    },
    "submit":function(){
      var data = {
        temperature:Number(document.getElementById('temperature').innerHTML),
        mode:$('div#mode>.active')[0].value.trim(),
        speed:$('div#speed>.active')[0].value.trim(),
      }
      // console.log(data);
      postAjax(baseURL+'/api/controller/', data, (data, status, xhr)=>{
        if(data.success){
          showAlert('success','성공적으로 신호를 전송했습니다.', 1000);
        }
      })
    },
    "power":function(state){
      postAjax(baseURL+'/api/controller/power', {state:state},(data, status, xhr)=>{
        if(data.success){
          showAlert('success','성공적으로 신호를 전송했습니다.', 1000);
        }
      })
    }
  }

  operators[operation](options);
}
