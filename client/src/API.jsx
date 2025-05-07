import dayjs from 'dayjs';

const URL = 'https://esame1-cmsmall-busso00-github.onrender.com:8080/api';

"use strict";

//*****************************************Data Structures*************************************************************/
function Page(id, title, authorId, authorName, creationDate, publishDate = undefined, blocks) {
  this.id = id;
  this.title = title;
  this.authorId = authorId;
  this.authorName = authorName;
  this.creationDate = dayjs(creationDate);
  this.publishDate = dayjs(publishDate);
  this.blocks = blocks;
}

function Block(type, data) {
  this.type = type;
  this.data = data;
}

/************************************* session API  ***************************************************************/
async function logIn(credentials) {

  let response = await fetch(URL + '/sessions', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials)
  });
  
  if (response.ok) {
    const user = await response.json();
    return user;
  } else {
    const errDetail = await response.json();
    throw errDetail.message;
  }
}

async function logOut() {
  await fetch(URL + '/sessions/current', {
    method: 'DELETE',
    credentials: 'include'
  });
}

async function getUserInfo() {
  const response = await fetch(URL + '/sessions/current', {
    credentials: 'include'
  });
  const userInfo = await response.json();
  if (response.ok) {
    return userInfo;
  } else {
    throw userInfo;  // an object with the error coming from the server
  }
}

/****************************** image URLs retriving API (call) ************************************************/
async function getImages() {
  console.log("GET images");
  const response = await fetch(URL + '/images', {
    credentials: 'include'
  });
  const URLs = await response.json();

  if (response.ok) {
    return URLs;
  } else {
    throw URLs;  // an object with the error coming from the server
  }
}


/****************************** name of site retriving API *****************************************************/
async function getSiteName() {
  console.log("GET Site Name");
  const response = await fetch(URL + '/sitename');
  const name = await response.json();

  if (response.ok) {
    return name;
  } else {
    throw name;  // an object with the error coming from the server
  }
}

/****************************** name of site modifying API *****************************************************/
async function updateSiteName(newName) {
  console.log("PUT Site Name");

  const response = await fetch(URL + '/sitename', {
    method: 'PUT',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(
      {
        'sitename': newName
      })
  });

  const okName = await response.json();
  if (response.ok) {
    return okName;
  } else {
    throw okName;  // an object with the error coming from the server
  }
}

/****************************** page retriving API *************************************************************/
async function getAllPages() {
  console.log("GET Pages");
  const response = await fetch(URL + '/pages');
  const pagesList = await response.json();

  if (response.ok) {
    const newPagesList = pagesList.map((page) => {
      return new Page(
        page.id,
        page.title,
        page.authorId,
        page.authorName,
        page.creationDate,
        page.publishDate,
        page.blocks.map(block => new Block(block.type, block.data)));
    });
    return newPagesList;
  } else {
    throw pagesList;
  }
}

async function getAllPagesLogin() {
  console.log("GET Pages Login");
  const response = await fetch(URL + '/pages/login',
  {
    credentials: 'include'
  });
  const pagesList = await response.json();

  if (response.ok) {
    const newPagesList = pagesList.map((page) => {
      return new Page(
        page.id,
        page.title,
        page.authorId,
        page.authorName,
        page.creationDate,
        page.publishDate,
        page.blocks.map(block => new Block(block.type, block.data)));
    });
    return newPagesList;
  } else {
    throw pagesList;
  }
}

/****************************** page updating API **************************************************************/
async function updatePage(newPage) {
  console.log("Update Page");
  return new Promise((resolve, reject) => {
    fetch(URL + `/pages/${newPage.id}`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(
        {
          title: newPage.title,
          authorId: newPage.authorId,
          publishDate: newPage.publishDate ? (newPage.publishDate.isValid()? dayjs(newPage.publishDate).format('YYYY-MM-DD') :null ): null,
          blocks: newPage.blocks
        })
    })
      .then((response) => {
        if (response.ok) {
          resolve(null);
        } else {
          // analyze the cause of error
          response.json()
            .then((message) => { reject(message); }) // error message in the response body
            .catch(() => { reject({ error: "Cannot parse server response" }) }); // something else
        }
      }).catch(() => { reject({ error: "Cannot communicate with the server" }) }); // connection errors
  });
}

/*******************************************************update author utility API  ********************************************/
async function getAllUsers() {
  console.log("GET Users");
  const response = await fetch(URL + '/users',
  {
    credentials: 'include'
  });

  const usersList = await response.json();

  if (response.ok) {
    const newUsersList = usersList.map((user) => {
      return {
        id: user.id,
        name: user.name
      };
    });
    return newUsersList;
  } else {
    throw usersList;
  }
}

/****************************** page uploading API *************************************************************/
async function addPage(newPage) {
  console.log("POST Page");
  return new Promise((resolve, reject) => {

    fetch(URL + '/pages', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(
        {
          title: newPage.title,
          publishDate: newPage.publishDate ? (newPage.publishDate.isValid()? dayjs(newPage.publishDate).format('YYYY-MM-DD') :null ): null,
          blocks: newPage.blocks
        })
    })
      .then((response) => {
        if (response.ok) {
          resolve(null);
        } else {
          // analyze the cause of error
          response.json()
            .then((message) => { reject(message); }) // error message in the response body
            .catch(() => { reject({ error: "Cannot parse server response" }) }); // something else
        }
      }).catch(() => { reject({ error: "Cannot communicate with the server" }) }); // connection errors
  });
}

/****************************** page deleting API **************************************************************/
function deletePage(id) {
  console.log("DELETE Page");
  return new Promise((resolve, reject) => {
    fetch(URL + `/pages/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    }).then((response) => {
      if (response.ok) {
        resolve(null);
      } else {
        // analyze the cause of error
        response.json()
          .then((message) => { reject(message); }) // error message in the response body
          .catch(() => { reject({ error: "Cannot parse server response" }) }); // something else
      }
    }).catch(() => { reject({ error: "Cannot communicate with the server" }) }); // connection errors
  });
}

const API = { logIn, logOut, getUserInfo, getSiteName, updateSiteName, getAllUsers, getAllPages, getAllPagesLogin, addPage, updatePage, deletePage, getImages};
export default API;