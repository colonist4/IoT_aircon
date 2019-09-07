function login(){
  var id = "admin";
  var pw = document.getElementById('pw').value;
  postAjax(baseURL+'/login/auth', {"username":id, "password":pw}, function(data, status, xhr){
    showAlert("success", "로그인 성공", 1000);
    location.reload();
  }, function(){
    showAlert("danger", "로그인 실패", 1000);
  })
}
