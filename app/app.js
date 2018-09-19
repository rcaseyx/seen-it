"use strict";
let user;

function handleLogin() {
  $('.login-form').submit(function(e) {
    e.preventDefault();
    const uname = $('#uname').val();
    const password = $('#password').val();
    $('#uname').val('');
    $('#password').val('');
    const checkUser = MOCK_USERS.users.find(function(obj) {
      if(obj.userName === uname) {
        return obj;
      }
      else {
        return false;
      }
    });
    if(checkUser) {
      if(checkUser.password === password) {
        console.log('success');
        user = checkUser;
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
  clearLogin();
  $('.logout').prop('hidden',false);
  $('.logoutButton').prop('hidden',false);
  $('.lists').prop('hidden',false);
  $('.your').html('');
  $('.all').html('');
  getListData(user, displayListData);
  let data = getAllLists();
  displayAllLists(data);
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
  $('.logoutButton').click(function() {
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
  $('.lists').prop('hidden',true);
  $('.list').prop('hidden',true);
  $('.logout').prop('hidden',true);
  $('.logoutButton').prop('hidden',true);
}

function reloadLogin() {
  $('.intro').prop('hidden',false);
  $('.intro').html('<p>Seen-O-Phile is an interactive application allowing users to view lists of the best movies ever made, add those lists to their accounts, and check off movies as they watch them. Start your cinematic journey today by logging in below!</p>');
  $('.login').prop('hidden',false);
  $('.login-form').prop('hidden',false);
  $('.login-form fieldset').prop('hidden',false);
}







function handleApp() {
  handleLogin();
  handleAddList();
  handleViewList();
  handleSeenIt();
  handleRemoveList();
  handleLogout();
}

$(handleApp);
