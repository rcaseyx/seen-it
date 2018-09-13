"use strict";

function handleLogin() {
  $('.login-form').submit(function(e) {
    e.preventDefault();
    const uname = $('#uname').val();
    const password = $('#password').val();
    const user = MOCK_USERS.users.find(function(obj) {
      if(obj.userName === uname) {
        return obj;
      }
      else {
        return false;
      }
    });
    if(user) {
      if(user.password === password) {
        console.log('success');
      }
      else {
        console.log('wrong password');
        $('.message').html('Incorrect username or password.');
      };
    }
    else {
      console.log('username not found');
      $('.message').html('Incorrect username or password.');
    }
  });
}







function handleApp() {
  handleLogin();
}

$(handleApp);
