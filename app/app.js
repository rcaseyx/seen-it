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
      fakeLogin(result);
    },
    error: function(error) {
      $('.message').html(error.responseJSON.message);
    }
  });
}

function fakeLogin(data) {
  console.log(data);
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
  getListData(user, displayListData);
  let data = getAllLists();
  displayAllLists(data);
  $('.seen').html(`<button>View Seen Data</button>`);
  $('.userProfile').html('');
  $('.userProfile').html(`Logged in as ${user.firstName} |  <a href="#" class="profile">View Profile</a>  |   <a href="#" class="logout">Logout</a>`);
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
    $('.your').append('No lists found');
  }
}

function displayListData(data) {
  data.forEach(function(list) {
    $('.your').append(`<li>${list.title} - <div id="${list.id}"><a href="#" class="view">View</a> <a href="#" class="remove">Remove</a></div></li>`);
  });
}

function getAllLists() {
  let allLists = [];
  let userLists = user.lists;

  MOCK_DEFAULT_LISTS.lists.forEach(function(list) {
    allLists.push(list);
  });

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

  return allLists;
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
    login(user);
  });
}

function handleViewList() {
  $('.your').on('click', '.view', function() {
    const listId = $(this).closest('div').attr('id');
    $('.lists').prop('hidden',true);
    $('.list').prop('hidden',false);

    generateListDetail(listId);

  });
}

function handleRemoveList() {
  $('.your').on('click','.remove', function() {
    const listId = $(this).closest('div').attr('id');
    let index = user.lists.indexOf(listId);
    user.lists.splice(index, 1);
    login(user);
  });
}

function generateListDetail(listId) {
  const list = MOCK_DEFAULT_LISTS.lists.find(function(list) {
    return list.id === listId;
  });

  let listTitle = list.title;
  let movieIds = [];
  let seenMovieIds = [];

  for(let i = 0;i < list.movies.length;i ++) {
    if(user.moviesSeen.includes(list.movies[i])) {
      seenMovieIds.push(list.movies[i]);
    }
    else {
      movieIds.push(list.movies[i]);
    }
  }

  let movies = [];
  let seenMovies = [];

  movieIds.forEach(function(movieId) {
    let movie = MOCK_MOVIES.movies.find(function(movie) {
      return movie.id === movieId;
    });
    movies.push(movie);
  });

  seenMovieIds.forEach(function(movieId) {
    let movie = MOCK_MOVIES.movies.find(function(movie) {
      return movie.id === movieId;
    });
    seenMovies.push(movie);
  });

  displayListDetail(listTitle,movies,seenMovies,listId);
}

function displayListDetail(title,data,seenData,listId) {
  $('.title').html('');
  $('.title').append(`<h3>${title}</h3>`);
  $('.detail').html('');
  data.forEach(function(movie) {
    $('.detail').append(`<div class="movie" id="${movie.id}">${movie.title} <img src="${movie.posterImage}" alt="${movie.title} poster"><button class="seen" id="${listId}">Seen It</button></div>`);
  });
  $('.detailSeen').html('');
  seenData.forEach(function(movie) {
    $('.detailSeen').append(`<div class="movie" id="${movie.id}"><del>${movie.title}</del> <img src="${movie.posterImage}" alt="${movie.title} poster"></div>`);
  });
}

function handleSeenIt() {
  $('.detail').on('click','.seen',function() {
    let listId = $(this).attr('id');
    let movieId = $(this).closest('div').attr('id');
    user.moviesSeen.push(movieId);

    generateListDetail(listId);
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
  $('.userProfile').on('click', '.logout', function() {
    logout();
    reloadLogin();
  });
}

function logout() {
  user = false;
  $('.your').html('');
  $('.all').html('');
  $('.title').html('');
  $('.detail').html('');
  $('.detailSeen').html('');
  $('.seenData').html('');
  $('.lists').prop('hidden',true);
  $('.list').prop('hidden',true);
  $('.userProfile').html('');
  $('.userProfile').prop('hidden',true);
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
  $('.seen').on('click','button', function() {
    $('.lists').prop('hidden',true);
    $('.seenData').prop('hidden',false);
    $('.seenData').html('');
    let html = generateSeenData(user);
    $('.seenData').html(html);
  });
}

function generateSeenData(user) {
  let seenIds = user.moviesSeen;
  let seenMovies = [];

  seenIds.forEach(function(movieId) {
    let movie = MOCK_MOVIES.movies.find(function(movie) {
      return movie.id === movieId;
    });
    seenMovies.push(movie);
  });

  seenMovies.forEach(function(movie) {
    $('.seenData').append(`<div class="movie" id="${movie.id}">${movie.title} <img src="${movie.posterImage}" alt="${movie.title} poster"></div>`);
  });
}

function handleViewProfile() {
  $('.userProfile').on('click', '.profile', function() {
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
