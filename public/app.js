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
        login(user);
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

function login(user) {
  //window.location.href = "defaultLists.html";
  getListData(user, displayListData);
}

function getListData(user, callback) {
  let lists = [];

  if(user.lists.length > 0) {
    user.lists.forEach(function(id) {
      let userList = MOCK_DEFAULT_LISTS.lists.find(function(list) {
        return list.id === id;
      });
      lists.push(userList);
    });
    callback(lists);
  }
  else {
    $('.lists').append('No lists found');
  }
}

function displayListData(data) {
  data.forEach(function(list) {
    $('.lists').append(`<li>${list.title}</li>`);
  });
}







function handleApp() {
  handleLogin();
}

$(handleApp);
