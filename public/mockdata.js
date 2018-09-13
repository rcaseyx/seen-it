const MOCK_DEFAULT_LISTS = {
  "defaultLists": [
    {
      "id": "111",
      "title": "IMdB Top Fake Movies",
      "link": "/lists/111",
      "movies": ["1","3","6","9"]
    },
    {
      "id": "222",
      "title": "All MCU Movies",
      "link": "/lists/222",
      "movies": ["2","5","6","8"]
    },
    {
      "id": "333",
      "title": "All Best Picture Winners",
      "link": "/lists/333",
      "movies": ["3","8","10"]
    },
    {
      "id": "444",
      "title": "2018 Oscar Winners",
      "link": "/lists/444",
      "movies": ["2","3","4","5","7"]
    }
  ]
};

const MOCK_MOVIES = {
  "movies": [
    {
      "id": "1",
      "title": "Movie 1",
      "posterImage": "http://cdn1.alloy.com/wp-content/uploads/2014/12/Home-Alone.png",
      "lists": ["111"]
    },
    {
      "id": "2",
      "title": "Movie 2",
      "posterImage": "http://cdn1.alloy.com/wp-content/uploads/2014/12/Home-Alone.png",
      "lists": ["222","444"]
    },
    {
      "id": "3",
      "title": "Movie 3",
      "posterImage": "http://cdn1.alloy.com/wp-content/uploads/2014/12/Home-Alone.png",
      "lists": ["111","333","444"]
    },
    {
      "id": "4",
      "title": "Movie 4",
      "posterImage": "http://cdn1.alloy.com/wp-content/uploads/2014/12/Home-Alone.png",
      "lists": ["444"]
    },
    {
      "id": "5",
      "title": "Movie 5",
      "posterImage": "http://cdn1.alloy.com/wp-content/uploads/2014/12/Home-Alone.png",
      "lists": ["222","444"]
    },
    {
      "id": "6",
      "title": "Movie 6",
      "posterImage": "http://cdn1.alloy.com/wp-content/uploads/2014/12/Home-Alone.png",
      "lists": ["111","222"]
    },
    {
      "id": "7",
      "title": "Movie 7",
      "posterImage": "http://cdn1.alloy.com/wp-content/uploads/2014/12/Home-Alone.png",
      "lists": ["444"]
    },
    {
      "id": "8",
      "title": "Movie 8",
      "posterImage": "http://cdn1.alloy.com/wp-content/uploads/2014/12/Home-Alone.png",
      "lists": ["222","333"]
    },
    {
      "id": "9",
      "title": "Movie 9",
      "posterImage": "http://cdn1.alloy.com/wp-content/uploads/2014/12/Home-Alone.png",
      "lists": ["111","444"]
    },
    {
      "id": "10",
      "title": "Movie 10",
      "posterImage": "http://cdn1.alloy.com/wp-content/uploads/2014/12/Home-Alone.png",
      "lists": ["333"]
    }
  ]
};

const MOCK_USERS = {
  "users": [
    {
      "id": "1u",
      "userName": "demo.user",
      "password": "demo123",
      "firstName": "Demo",
      "lastName": "User",
      "lists": ["111","222"],
      "moviesSeen": ["1","2","3"]
    },
    {
      "id": "2u",
      "userName": "demo2",
      "password": "demo123",
      "firstName": "Second",
      "lastName": "Demo",
      "lists": ["111","222","333","444"],
      "moviesSeen": ["10"]
    },
    {
      "id": "3u",
      "userName": "3demo",
      "password": "demo123",
      "firstName": "Third",
      "lastName": "Demo",
      "lists": ["333","444"],
      "moviesSeen": ["5","6","9"]
    },
    {
      "id": "4u",
      "userName": "last.demo",
      "password": "demo123",
      "firstName": "Last",
      "lastName": "Demo",
      "lists": [],
      "moviesSeen": []
    }
  ]
}
