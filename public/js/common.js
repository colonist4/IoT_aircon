const baseURL = 'http://seongjunpc.cf:3000'
var ajaxRequestCounter = 0;
const alertStack = [];
const alertMargin = 10;
var alertHeight = 60;

// $.ajaxSetup({
//   xhrFields: { withCredentials: true },
//   corssDomain:true,
//   headers: {'Access-Control-Allow-Origin':true}
// })

$(document).ajaxSend(function(e, xhr, opt){
  if(ajaxRequestCounter==0){
    document.getElementById('loader').hidden = false;
    // $('#loader').removeClass('hidden');
  }
  ajaxRequestCounter++;
})

$(document).ajaxComplete(function(){
  ajaxRequestCounter--;
  if(ajaxRequestCounter==0){
    document.getElementById('loader').hidden = true;
  }
})

$(document).ajaxError(function(evt,xhr,options,exc){
  console.log(xhr)
  if(xhr.responseJSON)
    showAlert("danger", "서버에 연결을 실패했습니다.<br/>("+(xhr.responseJSON.message)+")", 1000);
  else if(xhr.responseText)
    showAlert("danger", "서버에 연결을 실패했습니다.<br/>("+(xhr.responseText)+")", 1000);
  else
    showAlert("danger", "서버에 연결을 실패했습니다.", 1000);
})

var Ajax = function(method, url, data,  callbackSuccess, callbackFail){
  $.ajax({
    type: method,
    data: JSON.stringify(data),
    contentType: 'application/json; charset=utf-8',
    url: url,
    success: callbackSuccess,
    error: callbackFail
  });
}

var postAjax = function(url, data,  callbackSuccess, callbackFail){
  $.ajax({
    type: 'POST',
    data: JSON.stringify(data),
    contentType: 'application/json; charset=utf-8',
    url: url,
    success: callbackSuccess,
    error: callbackFail
  });
};

//
// getAjax(url, data, callbackSuccess, callbackFail)
//
var getAjax = function(url, data,  callbackSuccess, callbackFail){
  $.ajax({
    type: 'GET',
    data: JSON.stringify(data),
    contentType: 'application/json; charset=utf-8',
    url: url,
    success: callbackSuccess,
    error: callbackFail
  });
};

function showAlert(type, message, duration){
  var alertTemplate = document.getElementById('alert');
  if(!alertTemplate) return;

  let number = alertStack.push(0);
  var clone = document.importNode(alertTemplate.content, true).querySelector('div');
  clone.innerHTML = "<strong>"+message+"</strong>";
  clone.classList.add('alert-'+type);
  clone.setAttribute('data-id', number-1);
  clone.style.top = alertHeight;
  document.body.appendChild(clone);

  alertHeight = alertHeight+clone.clientHeight+alertMargin;
  alertStack[number-1] = clone.clientHeight+alertMargin;

  setTimeout(function(){closeAlert(clone);}, duration);

  function closeAlert(target){
    let number = target.getAttribute('data-id');
    alertStack[number] = alertStack[number] * -1;
    $(target).remove();
    for(let i=alertStack.length-1; i>=0; i--){
      if(alertStack[i]>0) break;
      alertHeight = alertHeight + alertStack.pop();
    }
  }
}

function login_(e){
  e.preventDefault();
  // var expire = document.forms['login']['expire'].checked;
  // expire = expire==true?"30d":null;
  var id = "admin";
  var pw = document.forms['login']['pw'].value;
  postAjax(baseURL+'/login/auth', {"username":id, "password":pw}, function(data, status, xhr){
    showAlert("success", "로그인 성공", 1000);
    location.reload();
  }, function(){
    showAlert("danger", "로그인 실패", 1000);
  })
}

function logout_(){
  getAjax(baseURL+'/login/logout', {}, function(){
    showAlert("success", "로그아웃에 성공하였습니다.", 1000);
    deleteCookie('IoT-username')
    location.reload();
  }, function(){
    showAlert("danger", "로그아웃에 실패하였습니다.", 1000);
  })
}

function getCookie(name) {
  var value = document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');
  return value? value[2] : null;
};

function deleteCookie(name) {
  document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

window.addEventListener('load', function(){
  //if(location.hash) window.history.back();
  //console.log(getCookie('intranet-username'));
  if(document.forms["login"]){
    document.forms["login"].addEventListener('submit', login_);
    document.getElementById("logoutBtn").addEventListener('click', logout_);

    if(getCookie('IoT-username')){
      document.forms["login"].hidden = true;
      document.getElementById("logoutWrapper").getElementsByTagName('span')[0].innerHTML = getCookie('IoT-username')+"님 반갑습니다!! ";
    } else{
      document.getElementById("logoutWrapper").hidden = true;
    }
  }
});

window.onerror = function (msg, url, lineNo, columnNo, error) {
    var string = msg.toLowerCase();
    var substring = "script error";
    if (string.indexOf(substring) > -1){
        alert('Script Error: See Browser Console for Detail');
    } else {
        var message = [
            'Message: ' + msg,
            'URL: ' + url,
            'Line: ' + lineNo,
            'Column: ' + columnNo,
            'Error object: ' + JSON.stringify(error)
        ].join(' - ');

        alert(message);
    }

    return false;
};
