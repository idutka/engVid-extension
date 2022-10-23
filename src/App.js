import React, { useEffect, useState, useMemo } from "react";
import logo from "./images/engvid.png";
import "./App.css";
import { List } from "./components";

const chrome = window.chrome;
const t = chrome.i18n.getMessage;

const GET_SETTINGS = "getSettings";
const GET_CURRENT_LESSONS = "getCurrentLessons";

const GET_LESSONS = "getLessons";
const ADD_LESSON = "addLesson";

const GET_FAVORITES = "getFavorites";
const ADD_FAVORITE = "addFavorite";
const REMOVE_FAVORITE = "removeFavorite";

const App = () => {
  const [settings, setSettings] = useState({});
  const [completedPageView, setCompletedPageView] = useState(false);

  const [lessons, setLessons] = useState([]);
  const [favorites, setFavorites] = useState([]);

  const [currentTab, setCurrentTab] = useState();
  const [currentLesson, setCurrentLesson] = useState();

  const isFavorite = useMemo(
    () =>
      !!currentLesson?.url &&
      favorites.some((item) => item.url === currentLesson.url),
    [favorites, currentLesson]
  );

  const isCompleted = useMemo(
    () =>
      !!currentLesson?.url &&
      lessons.some((item) => item.url === currentLesson.url),
    [lessons, currentLesson]
  );

  const addFavorite = async () => {
    try {
      const response = await chrome.runtime.sendMessage({
        action: ADD_FAVORITE,
        data: currentLesson,
      });
      setFavorites(response.favorites);
    } catch (e) {
      console.log("ADD_FAVORITE failed", e);
    }
  };

  const addCompleted = async () => {
    try {
      const response = await chrome.runtime.sendMessage({
        action: ADD_LESSON,
        data: currentLesson,
      });
      setLessons(response.lessons);
    } catch (e) {
      console.log("ADD_LESSON failed", e);
    }
  };

  const removeFavorite = async (url) => {
    try {
      const response = await chrome.runtime.sendMessage({
        action: REMOVE_FAVORITE,
        data: { url },
      });
      setFavorites(response.favorites);
    } catch (e) {
      console.log("REMOVE_FAVORITE failed", e);
    }
  };

  const openEngVid = (url = settings.homePage) => {
    chrome.tabs.create({ url });
  };

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      var activeTab = tabs[0];
      setCurrentTab(activeTab);

      chrome.tabs.sendMessage(
        activeTab.id,
        { action: GET_CURRENT_LESSONS },
        (response) => {
          console.log(response);
          if (!chrome.runtime.lastError) {
            setCurrentLesson(response);
          } else {
            console.log("GET_CURRENT_LESSONS failed", chrome.runtime.lastError);
          }
        }
      );
    });

    chrome.runtime.sendMessage({ action: GET_SETTINGS }, (response) => {
      setSettings(response.SETTINGS);
    });

    chrome.runtime.sendMessage({ action: GET_LESSONS }, (response) => {
      setLessons(response.lessons);
    });

    chrome.runtime.sendMessage({ action: GET_FAVORITES }, (response) => {
      setFavorites(response.favorites);
    });
  }, []);

  return (
    <div>
      <img
        className="logo"
        onClick={() => openEngVid()}
        title={settings.title}
        src={logo}
        alt={settings.title}
      />

      <div className="actions">
        <button
          className={`btn view-btn ${!completedPageView ? "active" : ""}`}
          onClick={() => setCompletedPageView(false)}
        >
          <span className="btn-icon favorites-icon"></span>
          {t("favorites")}
        </button>
        <button
          className={`btn view-btn ${completedPageView ? "active" : ""}`}
          onClick={() => setCompletedPageView(true)}
        >
          <span className="btn-icon completed-icon"></span>
          {t("completed")}
        </button>
      </div>

      {completedPageView ? (
        <div>
          <button
            className="btn add-btn"
            onClick={() => addCompleted()}
            disabled={!currentLesson || isCompleted}
          >
            <span className="name">{t("addToCompleted")}</span>
            <span className="sub-name">
              "{currentLesson?.title || currentTab?.title}"
            </span>
          </button>
          <List
            items={lessons}
            currentItem={currentLesson}
            onSelect={(lesson) => openEngVid(lesson.url)}
          />
        </div>
      ) : (
        <div>
          <button
            className="btn add-btn"
            onClick={() => addFavorite()}
            disabled={!currentLesson || isFavorite}
          >
            <span className="name">{t("addToFavorites")}</span>
            <span className="sub-name">
              "{currentLesson?.title || currentTab?.title}"
            </span>
          </button>
          <List
            items={favorites}
            currentItem={currentLesson}
            onSelect={(lesson) => openEngVid(lesson.url)}
            onRemove={(lesson) => removeFavorite(lesson.url)}
          />
        </div>
      )}
    </div>
  );
};

export default App;
