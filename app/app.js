"use strict";
let user;
let authToken;
const endpoint = 'http://localhost:8080';

function handleLogin() {
  $('.login-form').submit(function(e) {
    e.preventDefault();
    const uname = $('#uname').val();
    const password = $('#password').val();
    $('#uname').val('');
    $('#password').val('');

    attemptLogin(uname,password);
  });
}

function attemptLogin(username,password) {
  let data = {
    username: username,
    password: password
  }

  $.ajax({
    type: 'POST',
    data: JSON.stringify(data),
    contentType: 'application/json',
    url: `${endpoint}/auth/login`,
    success: function(result) {
      user = result.user;
      authToken = result.authToken;
      login(user);
    },
    error: function(error) {
      console.log(error);
      //$('.message').html(error.responseJSON.message);
      // need to come back and figure out login errors
    }
  });
}

function login(user) {
  clearLogin();
  $('.lists').prop('hidden',false);
  $('.your').html('');
  $('.all').html('');
  $('.title').html('');
  $('.detail').html('');
  $('.detailSeen').html('');
  $('.message').html('');
  $('.message').prop('hidden',true);
  $('.seenData').html('');
  $('.seenData').prop('hidden',true);
  $('.sign-up-section').html('');
  $('.sign-up-section').prop('hidden',true);
  getListData(user, displayListData);
  getAllLists();
  updateHeader();
}

function updateHeader() {
  $('.links').html('');
  let html = `<li>Logged in as ${user.username} |</li>
              <li><a href="#" class="profile">View Profile</a> |</li>
              <li><a href="#" class="viewMoviesSeen">View Movies Seen</a> |</li>
              <li><a href="#" class="logout">Logout</a></li>`;
  $('.links').append(html);
}

function getListData(user, callback) {
  let lists = [];
  let completedReqs = 0;

  if(user.lists.length > 0) {
    user.lists.forEach(function(id) {
      $.ajax({
        type: 'GET',
        contentType: 'application/json',
        url: `${endpoint}/lists/${id}`,
        headers: {
          "Authorization": `Bearer ${authToken}`
        },
        success: function(result) {
          lists.push(result);
          completedReqs ++;
          if(completedReqs === user.lists.length) {
            callback(lists);
          }
        },
        error: function(error) {
          console.log(error);
        }
      });
    });
  }
  else {
    $('.your').append('No lists found');
  }
}

function displayListData(data) {
  data.forEach(function(list) {
    $('.your').append(`<li>${list.title} - <div id="${list.id}"><a href="#" class="view">View</a> <a href="#" class="remove">Remove</a></div></li>`);
  });
}

function getAllLists() {
  $.ajax({
    type: 'GET',
    contentType: 'application/json',
    url: `${endpoint}/lists`,
    headers: {
      "Authorization": `Bearer ${authToken}`
    },
    success: function(result) {
      let allLists = result.lists;
      let userLists = user.lists;

      let listsToRemove = [];
      userLists.forEach(function(list) {
        let addedList =
        allLists.find(function(fullList) {
          return fullList.id === list;
        });
        listsToRemove.push(addedList);
      });

      listsToRemove.forEach(function(remove) {
        let index = allLists.indexOf(remove);
        if(index > -1) {
          allLists.splice(index, 1);
        }
      });

      displayAllLists(allLists);
    },
    error: function(error) {
      console.log(error);
    }
  });
}

function displayAllLists(data) {
  if(data.length > 0) {
    $('.available').prop('hidden',false);
    data.forEach(function(list) {
      $('.all').append(`<li>${list.title} - <a href="#" id="${list.id}">Add List</a></li>`);
    });
  }
  else {
    $('.available').prop('hidden',true);
  }
}

function handleAddList() {
  $('.all').on('click', 'a', function() {
    const listId = $(this).attr('id');
    user.lists.push(listId);
    updateUser(user);
    login(user);
  });
}

function updateUser(data) {
  $.ajax({
    type: 'PUT',
    data: JSON.stringify(data),
    contentType: 'application/json',
    url: `${endpoint}/users/${user.id}`,
    headers: {
      "Authorization": `Bearer ${authToken}`
    },
    success: function(result) {
      user = result;
      console.log('Updated user');
    },
    error: function(error) {
      console.log(error);
    }
  });
}

function handleViewList() {
  $('.your').on('click', '.view', function() {
    const listId = $(this).closest('div').attr('id');
    $('.lists').prop('hidden',true);
    $('.list').prop('hidden',false);

    getList(listId);

  });
}

function handleRemoveList() {
  $('.your').on('click','.remove', function() {
    const listId = $(this).closest('div').attr('id');
    let index = user.lists.indexOf(listId);
    user.lists.splice(index, 1);
    updateUser(user);
    login(user);
  });
}

function getList(listId) {
  $.ajax({
    type: 'GET',
    contentType: 'application/json',
    url: `${endpoint}/lists/${listId}`,
    headers: {
      "Authorization": `Bearer ${authToken}`
    },
    success: function(result) {
      generateListDetail(result);
    },
    error: function(error) {
      console.log(error);
    }
  })
}

function generateListDetail(list) {

  let listId = list.id;
  let listTitle = list.title;
  let movies = [];
  let seenMovies = [];

  for(let i = 0;i < list.movies.length;i ++) {
    if(user.moviesSeen.includes(list.movies[i]._id)) {
      seenMovies.push(list.movies[i]);
    }
    else {
      movies.push(list.movies[i]);
    }
  };

  displayListDetail(listTitle,movies,seenMovies,listId);
}

function displayListDetail(title,data,seenData,listId) {

  $('.title').html('');
  $('.title').append(`<h3>${title}</h3>`);
  $('.detail').html('');
  data.forEach(function(movie) {
    $('.detail').append(`<div class="movie" id="${movie._id}">${movie.title} <img src="${movie.image}" alt="${movie.title} poster"><button class="seen" id="${listId}">Seen It</button></div>`);
  });
  $('.detailSeen').html('');
  seenData.forEach(function(movie) {
    $('.detailSeen').append(`<div class="movie" id="${movie._id}"><del>${movie.title}</del> <img src="${movie.image}" alt="${movie.title} poster"></div>`);
  });

}

function handleSeenIt() {
  $('.detail').on('click','.seen',function() {
    let listId = $(this).attr('id');
    let movieId = $(this).closest('div').attr('id');
    user.moviesSeen.push(movieId);
    updateUser(user);
    getList(listId);
  });
}

function clearLogin() {
  $('.intro').prop('hidden',true);
  $('.intro').html('');
  $('.login').prop('hidden',true);
  $('.login-form').prop('hidden',true);
  $('.login-form fieldset').prop('hidden',true);
}

function handleLogout() {
  $('.links').on('click', '.logout', function() {
    logout();
    reloadLogin();
  });
}

function logout() {
  user = false;
  authToken = '';
  $('.your').html('');
  $('.all').html('');
  $('.title').html('');
  $('.detail').html('');
  $('.detailSeen').html('');
  $('.seenData').html('');
  $('.lists').prop('hidden',true);
  $('.list').prop('hidden',true);
  $('.seenData').prop('hidden',true);
}

function reloadLogin() {
  $('.intro').prop('hidden',false);
  $('.intro').html('<p>Seen-O-Phile is an interactive application allowing users to view lists of the best movies ever made, add those lists to their accounts, and check off movies as they watch them. Start your cinematic journey today by logging in below!</p>');
  $('.login').prop('hidden',false);
  $('.login-form').prop('hidden',false);
  $('.login-form fieldset').prop('hidden',false);
  $('.sign-up-section').html('');
  $('.sign-up-section').prop('hidden',true);
}

function handleViewSeen() {
  $('.links').on('click','.viewMoviesSeen',function() {
    $('.lists').prop('hidden',true);
    $('.detailSeen').html('');
    $('.list').prop('hidden',true);
    $('.seenData').prop('hidden',false);
    $('.seenData').html('');
    let html = generateSeenData(user);
    $('.seenData').html(html);
  });
}

function generateSeenData(user) {
  let seenIds = user.moviesSeen;
  let seenMovies = [];
  let completedReqs = 0;

  seenIds.forEach(function(movieId) {
    $.ajax({
      type: 'GET',
      contentType: 'application/json',
      url: `${endpoint}/movies/${movieId}`,
      headers: {
        "Authorization": `Bearer ${authToken}`
      },
      success: function(result) {
        seenMovies.push(result);
        completedReqs ++;
        if(completedReqs === seenIds.length) {
          displaySeenData(seenMovies);
        }
      },
      error: function(error) {
        console.log(error);
      }
    });
  });
}

function displaySeenData(data) {
  data.forEach(function(movie) {
    $('.seenData').append(`<div class="movie" id="${movie.id}">${movie.title} <img src="${movie.image}" alt="${movie.title} poster"></div>`);
  });
}

function handleViewProfile() {
  $('.links').on('click', '.profile', function() {
    login(user);
  });
}

function handleSignUp() {
  $('.sign-up').click(function() {
    clearLogin();
    $('.sign-up-section').html('');
    const html = `<form class="sign-up-form">
                    <fieldset>
                      <legend>Create Account</legend>
                      <label for="uname-su">User Name:
                        <input type="text" id="uname-su" required>
                      </label>
                      <label for="password-su">Password:
                        <input type="password" id="password-su" required>
                      </label>
                      <label for="firstName">First Name:
                        <input type="text" id="firstName">
                      </label>
                      <label for="lastName">Last Name:
                        <input type="text" id="lastName">
                      </label>
                      <input type="submit" class="submit-create-account">
                    </fieldset>
                  </form>`;

    $('.sign-up-section').html(html);
  });
}

function handleCreateAccount() {
  $('.sign-up-section').on('click','.submit-create-account',function(e) {
    e.preventDefault();
    const username = $(this).closest('form').find('#uname-su').val();
    const password = $(this).closest('form').find('#password-su').val();
    const firstName = $(this).closest('form').find('#firstName').val();
    const lastName = $(this).closest('form').find('#lastName').val();

    createNewAccount(username,password,firstName,lastName);
  });
}

function createNewAccount(username, password, firstName, lastName) {
  let data = {
    username: username,
    password: password,
    firstName: firstName,
    lastName: lastName
  };

  $('.message').html('');

  $.ajax({
    type: 'POST',
    data: JSON.stringify(data),
    contentType: 'application/json',
    url: `${endpoint}/users`,
    success: function(result) {
      displayNewUser(result);
    },
    error: function(error) {
      $('.message').html(error.responseJSON.message);
    }
  });
}

function displayNewUser(data) {
  $('.sign-up-section').html('');
  const html = `<div>Congratulations! User "${data.username}" was created successfully!<div>
                <button class="newLogin">Login</button>`;
  $('.sign-up-section').html(html);
}

function handleNewLogin() {
  $('.sign-up-section').on('click','.newLogin',function() {
    reloadLogin();
  });
}






function handleApp() {
  handleLogin();
  handleAddList();
  handleViewList();
  handleSeenIt();
  handleRemoveList();
  handleLogout();
  handleViewSeen();
  handleViewProfile();
  handleSignUp();
  handleCreateAccount();
  handleNewLogin();
}

$(handleApp);
