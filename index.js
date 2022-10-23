"use strict";

import nodeFetch from 'node-fetch';
import fetchCookie from 'fetch-cookie';

const randomSixDigitNumber = () => Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;

/**
* Login to copymethat and get a logged in session
* username:     CMT username
* password:     CMT password
* returns:      CMT session.
*/
const authenticate = async (username, password) => {
  if (!username) throw new Error("No username specified")
  if(!password) throw new Error("No password specified");

  const cookieJar = new fetchCookie.toughCookie.CookieJar();
  const fetchWithCookies = fetchCookie(nodeFetch, cookieJar);

  const CMT_HOME_URL = "https://www.copymethat.com/";
  const CMT_LOGIN_URL = "https://www.copymethat.com/login/";
  const homePage = await fetchWithCookies(CMT_HOME_URL);
  const cookies = await cookieJar.getCookies('https://www.copymethat.com/');
  const csrftokenCookie = cookies.find(element => element.key === 'csrftoken');
  if (!csrftokenCookie) throw new Error("Could not fetch CSRF token from www.copymethat.com");
  const csrftoken = csrftokenCookie.value;

  const postdata =
    `username=${username}&password=${password}&remember_me_checkbox=on&csrfmiddlewaretoken=${csrftoken}&random=${randomSixDigitNumber()}`;
  const response = await fetchWithCookies(CMT_LOGIN_URL, {
    headers: {
      "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
      "referer": "https://www.copymethat.com/",
      "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36",
      "x-requested-with": "XMLHttpRequest",
    },
    method: "post",
    body: postdata,
  });
  if (!response.ok) {
    throw new Error(`HTTP Error Response: ${response.status} ${response.statusText}`);
  }
  const session = {
    csrftoken: csrftoken,
    cookieJar: cookieJar,
  }
  return session;
};

const shoppingListId = async (session) => {
  const fetchWithCookies = fetchCookie(nodeFetch, session.cookieJar);

  const CMT_SHOPPING_LIST_URL = "https://www.copymethat.com/shopping_list";
  const response = await fetchWithCookies(CMT_SHOPPING_LIST_URL);
  const html = await response.text();
  // <input type = "hidden" name = "sl_id" value = "517535"
  const regex = /sl_id\"\s+value\s+=\s+\"(.+?)\"/gm;
  const match = regex.exec(html);
  if (match.length != 2) throw new Error("Could not parse shopping list ID");
  return match[1];
}

const addItem = async (session, shoppingListId, itemText) => {
  const fetchWithCookies = fetchCookie(nodeFetch, session.cookieJar);

  const CMT_ADD_ITEM_URL = "https://www.copymethat.com/shopping_list/add_new_item/";
  const postdata =
    `sl_id_current=all_sl_cat&is_edit_mode_current=0&csrfmiddlewaretoken=${session.csrftoken}&random=${randomSixDigitNumber()}&line=${itemText}&sl_id=${shoppingListId}`;
  console.log(postdata);
  const response = await fetchWithCookies(CMT_ADD_ITEM_URL, {
    headers: {
      "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
      "referer": "https://www.copymethat.com/shopping_list/",
      "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36",
      "x-requested-with": "XMLHttpRequest",
    },
    method: "post",
    body: postdata,
  });
  if (!response.ok) {
    throw new Error(`HTTP Error Response: ${response.status} ${response.statusText}`);
  }
}

export {
  authenticate,
  shoppingListId,
  addItem,
};

/*
For testing
const session = await authenticate(process.env.CMT_USER, process.env.CMT_PASS);
const slId = await shoppingListId(session);
console.log(slId);
await addItem(session, slId, "test4");
*/
