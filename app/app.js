"use strict";
let user;

function handleLogin() {
  $('.login-form').submit(function(e) {
    e.preventDefault();
    const uname = $('#uname').val();
    const password = $('#password').val();
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
  //window.location.href = "defaultLists.html";
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
    $('.lists').append('No lists found');
  }
}

function displayListData(data) {
  data.forEach(function(list) {
    $('.lists').append(`<li>${list.title} - <a href="#" id="${list.id}">View</a></li>`);
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
    data.forEach(function(list) {
      $('.allLists').append(`<li>${list.title} - <a href="#" id="${list.id}">Add List</a></li>`);
    });
  }
  else {
    $('.availableLists').html('');
  }
}

function handleAddList() {
  $('.allLists').on('click', 'a', function() {
    const listId = $(this).attr('id');
    user.lists.push(listId);
    $('.lists').html('');
    $('.allLists').html('');
    login(user);
  });
}

function handleViewList() {
  $('.lists').on('click', 'a', function() {
    const listId = $(this).attr('id');
    console.log(user.moviesSeen);

    generateListDetail(listId);

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
  $('.listTitle').html('');
  $('.listTitle').append(`<h3>${title}</h3>`);
  $('.listDetail').html('');
  data.forEach(function(movie) {
    $('.listDetail').append(`<div class="movie" id="${movie.id}">${movie.title} <img src="${movie.posterImage}" alt="${movie.title} poster"><button class="seen" id="${listId}">Seen It</button></div>`);
  });
  $('.listDetailSeen').html('');
  seenData.forEach(function(movie) {
    $('.listDetailSeen').append(`<div class="movie" id="${movie.id}"><del>${movie.title}</del> <img src="${movie.posterImage}" alt="${movie.title} poster"></div>`);
  });
}

function handleSeenIt() {
  $('.listDetail').on('click','.seen',function() {
    let listId = $(this).attr('id');
    let movieId = $(this).closest('div').attr('id');
    user.moviesSeen.push(movieId);

    generateListDetail(listId);
  });
}







function handleApp() {
  handleLogin();
  handleAddList();
  handleViewList();
  handleSeenIt();
}

$(handleApp);
