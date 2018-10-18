"use strict";
let user;
//let authToken;

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
    url: `/auth/login`,
    success: function(result) {
      user = result.user;
      localStorage.setItem("jwt",result.authToken);
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
  clearPage();
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
              <li><a href="#" class="createList">Create New List</a> |</li>
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
        url: `/lists/${id}`,
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("jwt")}`
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
    if(list.createdBy._id === user.id) {
      $('.your').append(`<li>${list.title}  <div id="${list.id}"><a href="#" class="view">View</a></li>`);
    }
    else {
      $('.your').append(`<li>${list.title}  <div id="${list.id}"><a href="#" class="view">View</a> <a href="#" class="remove">Remove</a></div></li>`);
    }
  });
}

function getAllLists() {
  $.ajax({
    type: 'GET',
    contentType: 'application/json',
    url: `/lists`,
    headers: {
      "Authorization": `Bearer ${localStorage.getItem("jwt")}`
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
      if(!(list.private)) {
        $('.all').append(`<li>${list.title}  <div><a href="#" id="${list.id}">Add List</a></li><div>`);
      }
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
    url: `/users/${user.id}`,
    headers: {
      "Authorization": `Bearer ${localStorage.getItem("jwt")}`
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
    url: `/lists/${listId}`,
    headers: {
      "Authorization": `Bearer ${localStorage.getItem("jwt")}`
    },
    success: function(result) {
      generateListDetail(result);
    },
    error: function(error) {
      console.log(error);
    }
  });
}

function generateListDetail(list) {

  let listId = list.id;
  let listTitle = list.title;
  let createdBy = list.createdBy._id;
  let createdByName = list.createdBy.username;
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

  displayListDetail(listTitle,movies,seenMovies,listId,createdBy,createdByName);
}

function displayListDetail(title,data,seenData,listId,createdBy,createdByName) {

  $('.title').prop('hidden',false);
  $('.detail').prop('hidden',false);
  $('.detailSeen').prop('hidden',false);
  $('.title').html('');
  if(!(createdBy === user.id)) {
    $('.title').append(`<div class="titleAndAuthor">
                          <h3>${title}</h3>
                          <span>List created by ${createdByName}</span>
                        </div>`);
  }
  else {
    $('.title').append(`<div class="titleAndAuthor">
                          <h3>${title}</h3>
                          <span>List created by you</span>
                        </div>`);
  }
  $('.detail').html('');
  data.forEach(function(movie) {
    $('.detail').append(`<div class="movie" id="${movie._id}">${movie.title} <img src="${movie.image}" alt="${movie.title} poster"><button class="seen" id="${listId}">Seen It</button></div>`);
  });
  $('.detailSeen').html('');
  seenData.forEach(function(movie) {
    $('.detailSeen').append(`<div class="movie" id="${movie._id}"><del>${movie.title}</del> <img src="${movie.image}" alt="${movie.title} poster">You've seen it!</div>`);
  });
  if(createdBy === user.id) {
    $('.title').append(`<button class="deleteList">Delete List</button>`);
  }
}

function handleDeleteList() {
  $('.show').on('click','.deleteList',function() {
    let listId = $(this).closest('.show').find('.seen').attr('id');
    clearPage();
    $('.detail').prop('hidden', false);
    $('.detail').html(`<div id="${listId}">Are you sure you want to delete this list? This action cannot be undone.
                    <button class="confirmDelete">Delete List</button> <button class="cancelDelete">Cancel</button></div>`);
  });
}

function handleConfirmDeleteList() {
  $('.detail').on('click','.confirmDelete',function() {
    let listId = $(this).closest('div').attr('id');
    $.ajax({
      type: 'DELETE',
      contentType: 'application/json',
      url: `/lists/${listId}`,
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("jwt")}`
      },
      success: function(result) {
        let index = user.lists.indexOf(listId);
        user.lists.splice(index,1);
        updateUser(user);
        login(user);
      },
      error: function(error) {
        console.log(error);
      }
    });
  });
}

function handleCancelDeleteList() {
  $('.detail').on('click','.cancelDelete',function() {
    let listId = $(this).closest('div').attr('id');
    $('.detail').html('');
    updateHeader();
    getList(listId);
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
  localStorage.removeItem('jwt');
  clearPage();
}

function clearPage() {
  $('.your').html('');
  $('.all').html('');
  $('.title').html('');
  $('.detail').html('');
  $('.detailSeen').html('');
  $('.seenData').html('');
  $('.links').html('');
  $('.createListForm').html('');
  $('.message').html('');
  $('.message').prop('hidden',true);
  $('.createListForm').prop('hidden',true);
  $('.lists').prop('hidden',true);
  $('.list').prop('hidden',true);
  $('.seenData').prop('hidden',true);
}

function reloadLogin() {
  $('.intro').prop('hidden',false);
  $('.intro').html('<p>Seen It? is an interactive application allowing users to view lists of the best movies ever made, add those lists to their accounts, and check off movies as they watch them. Start your cinematic journey today by logging in below!</p>');
  $('.login').prop('hidden',false);
  $('.login-form').prop('hidden',false);
  $('.login-form fieldset').prop('hidden',false);
  $('.sign-up-section').html(`<div>Don't have an account? Sign up below!</div>
  <button class="sign-up">Sign Up</button>`);
  $('.sign-up-section').prop('hidden',false);
}

function handleViewSeen() {
  $('.links').on('click','.viewMoviesSeen',function() {
    clearPage();
    updateHeader();
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
      url: `/movies/${movieId}`,
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("jwt")}`
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
  $('.sign-up-section').on('click','.sign-up',function() {
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
    url: `/users`,
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

function handleCreateList() {
  $('.links').on('click','.createList',function() {
    $.ajax({
      type: 'GET',
      contentType: 'application/json',
      url: `/movies`,
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("jwt")}`
      },
      success: function(result) {
        const movieArr = result.movies;
        clearPage();
        updateHeader();
        let html = `<form class="create-list-form">
                        <fieldset>
                          <legend>Create List</legend>
                          <label for="listTitle">List Title:
                            <input type="text" id="listTitle" required>
                          </label>
                          <label for="movieChoices">Movies to Add:
                            <select id="movieChoices" multiple>
                              ${generateAllMovies(movieArr)}
                            </select>
                          </label>
                          <span>Would you like to make this list private?</span>
                          <span>(Private lists can only be seen by you)</span>
                          <div class="selectPrivate">
                            <label for="yesPublic" required>Yes<input type="radio" id="yesPublic" value="true"></label>
                            <label for="noPublic" required>No<input type="radio" id="noPublic" value="false"></label>
                          </div>
                          <input type="submit" class="submit-create-list">
                        </fieldset>
                      </form>`
        $('.createListForm').prop('hidden',false);
        $('.createListForm').html(html);
      },
      error: function(error) {
        console.log(error);
      }
    });
  });
}

function handleSubmitNewList() {
  $('.createListForm').on('click','.submit-create-list',function() {
    let listTitle = $(this).closest('form').find('#listTitle').val();
    let movies = $(this).closest('form').find('#movieChoices').val();
    let isPrivate;
    let yesOrNo = $(this).closest('form').find('input[type=radio]:checked').attr('value');
    if(yesOrNo === 'true') {
      isPrivate = true;
    }
    else if(yesOrNo === 'false') {
      isPrivate = false;
    }

    let data = {
      title: listTitle,
      movies: movies,
      createdBy: user.id,
      private: isPrivate
    };

    $.ajax({
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify(data),
      url: `/lists`,
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("jwt")}`
      },
      success: function(result) {
        clearPage();
        updateHeader();
        user.lists.push(result.id);
        updateUser(user);
        getList(result.id);
      },
      error: function(error) {
        console.log(error);
      }
    });
  });
}

function generateAllMovies(data) {
  let returnHtml;
  data.forEach(function(movie) {
    returnHtml += `<option value="${movie.id}" required>${movie.title} (${movie.releaseYear})</option>`;
  });
  return returnHtml;
}

function handleMultipleOptions() {
  $('.createListForm').on('mousedown','option',function(e) {
    e.preventDefault();
    let originalScrollTop = $(this).parent().scrollTop();
    $(this).prop('selected', $(this).prop('selected') ? false : true);
    let self = this;
    $(this).parent().focus();
    setTimeout(function() {
        $(self).parent().scrollTop(originalScrollTop);
    }, 0);

    return false;
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
  handleCreateList();
  handleSubmitNewList();
  handleMultipleOptions();
  handleDeleteList();
  handleConfirmDeleteList();
  handleCancelDeleteList();
}

$(handleApp);
