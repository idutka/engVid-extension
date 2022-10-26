const STORAGE_LESSONS_KEY = "lessons";
const STORAGE_FAVORITES_KEY = "favorites";
const STORAGE_VIEW_KEY = "view";

const SETTINGS = {
  homePage: "https://www.engvid.com/",
  title: "EngVid.com",
  logo: "./images/engvid.png",
  url: "https://*.engvid.com/*",
  urlRegexp: "https://.*.engvid.com/.*",
};

class Storage {
  constructor(key) {
    this.key = key || "storage";
  }

  async getItem() {
    const result = await chrome.storage.sync.get([this.key]);
    return result[this.key];
  }

  async setItem(item) {
    await chrome.storage.sync.set({ [this.key]: item });
    return item;
  }

  async getItems() {
    const items = await this.getItem();
    return items || [];
  }

  async setItems(items) {
    return this.setItem(items);
  }

  async addItem({ url, title = "" }) {
    const items = await this.getItems();
    const newItems = [{ url: url, title: title, date: Date.now() }, ...items];
    return this.setItems(newItems);
  }

  async removeItem(url) {
    const items = await this.getItems();
    const newItems = items.filter((lesson) => lesson.url !== url);
    return this.setItems(newItems);
  }
}

const lessonsStorage = new Storage(STORAGE_LESSONS_KEY);
const favoritesStorage = new Storage(STORAGE_FAVORITES_KEY);
const viewStorage = new Storage(STORAGE_VIEW_KEY);

const updatePages = (message) => {
  chrome.tabs.query({ url: SETTINGS.url }, (tabs) => {
    tabs.forEach((tab) =>
      chrome.tabs.sendMessage(tab.id, message, () => {
        if (chrome.runtime.lastError) {
          console.log("updatePages failed", chrome.runtime.lastError);
        }
      })
    );
  });
};

const GET_SETTINGS = "getSettings";

const GET_LESSONS = "getLessons";
const ADD_LESSON = "addLesson";
const REMOVE_LESSON = "removeLesson";

const GET_FAVORITES = "getFavorites";
const ADD_FAVORITE = "addFavorite";
const REMOVE_FAVORITE = "removeFavorite";

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.action) {
    case GET_SETTINGS: {
      sendResponse({ SETTINGS });
      return false;
    }
    case GET_LESSONS: {
      lessonsStorage.getItems().then((lessons) => sendResponse({ lessons }));
      return true;
    }
    case ADD_LESSON: {
      lessonsStorage.addItem(message.data).then((lessons) => {
        sendResponse({ lessons });
        updatePages(message);
      });
      return true;
    }
    case REMOVE_LESSON: {
      lessonsStorage.removeItem(message.data.url).then((lessons) => {
        sendResponse({ lessons });
        updatePages(message);
      });
      return true;
    }

    case GET_FAVORITES: {
      favoritesStorage
        .getItems()
        .then((favorites) => sendResponse({ favorites }));
      return true;
    }
    case ADD_FAVORITE: {
      favoritesStorage.addItem(message.data).then((favorites) => {
        sendResponse({ favorites });
        updatePages(message);
      });
      return true;
    }
    case REMOVE_FAVORITE: {
      favoritesStorage.removeItem(message.data.url).then((favorites) => {
        sendResponse({ favorites });
        updatePages(message);
      });
      return true;
    }
  }
});
