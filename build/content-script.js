(function () {
  console.info("engVid Extensions loaded");

  const GET_CURRENT_LESSONS = "getCurrentLessons";
  const GET_LESSONS = "getLessons";
  const ADD_LESSON = "addLesson";
  const REMOVE_LESSON = "removeLesson";
  const GET_FAVORITES = "getFavorites";
  const ADD_FAVORITE = "addFavorite";
  const REMOVE_FAVORITE = "removeFavorite";

  const target = document.getElementById("lessonlinks_all_content");
  if (target) {
    const getElements = (items) => {
      const selector = items
        .map(
          (lesson) =>
            `.lessonlinks_all_row[onclick="top.location.href = '${lesson.url}'"], .lessonlinks_all_row[onclick="window.location.href = '${lesson.url}'"]`
        )
        .join(", ");

      return document.querySelectorAll(selector);
    };

    const markItems = (items, iconClass) => {
      const elements = getElements(items);

      elements.forEach((item) => {
        item
          .querySelector(".lessonlinks_all_category_list")
          .insertAdjacentHTML(
            "afterbegin",
            `<span class="lessonlinks_all_category_item ex-icon-container"><span class="ex-icon ${iconClass}"></span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>`
          );
      });
    };

    const removeMark = (items, iconClass) => {
      const elements = getElements(items);

      elements.forEach((item) => {
        item.querySelector(`.ex-icon-container:has(.${iconClass})`).remove();
      });
    };

    const markCompleted = () => {
      chrome.runtime.sendMessage({ action: GET_LESSONS }, (response) => {
        markItems(response.lessons, "ex-icon-completed");
      });
    };

    const markFavorite = () => {
      chrome.runtime.sendMessage({ action: GET_FAVORITES }, (response) => {
        markItems(response.favorites, "ex-icon-favorite");
      });
    };

    markCompleted();
    markFavorite();
    new MutationObserver(() => {
      markCompleted();
      markFavorite();
    }).observe(target, { childList: true });

    chrome.runtime.onMessage.addListener((message) => {
      switch (message.action) {
        case ADD_LESSON: {
          markItems([message.data], "ex-icon-completed");
          break;
        }
        case REMOVE_LESSON: {
          removeMark([message.data], "ex-icon-completed");
          break;
        }

        case ADD_FAVORITE: {
          markItems([message.data], "ex-icon-favorite");
          break;
        }
        case REMOVE_FAVORITE: {
          removeMark([message.data], "ex-icon-favorite");
          break;
        }
      }
    });
  }

  const container = document.querySelector(".featured_bottom_right");
  const title =
    document.querySelector("h1.posttitle a") ||
    document.querySelector("h1.resource_title a");

  if (title && container) {
    const currentUrl = title.href;
    const data = {
      url: currentUrl,
      title: title.title,
    };

    container.insertAdjacentHTML(
      "afterbegin",
      `<div id="ex-actions" >
        <label class="ex-container">
          <input id="ex-btn-favorite" type="checkbox">
          <span class="ex-checkmark"></span>
        </label>
        <label class="ex-container">
          <input id="ex-btn-completed" type="checkbox">
          <span class="ex-checkmark"></span>
        </label>
      </div>`
    );

    const completed = document.getElementById("ex-btn-completed");
    const favorite = document.getElementById("ex-btn-favorite");

    completed.addEventListener("change", (e) => {
      const isCompleted = e.target.checked;

      chrome.runtime.sendMessage({
        action: isCompleted ? "addLesson" : "removeLesson",
        data,
      });
    });

    favorite.addEventListener("change", (e) => {
      const isFavorite = e.target.checked;

      chrome.runtime.sendMessage({
        action: isFavorite ? "addFavorite" : "removeFavorite",
        data,
      });
    });

    chrome.runtime.sendMessage({ action: "getLessons" }, (response) => {
      const isCompleted = response.lessons.some(
        (lesson) => lesson.url === currentUrl
      );
      completed.checked = isCompleted;
    });

    chrome.runtime.sendMessage({ action: "getFavorites" }, (response) => {
      const isFavorite = response.favorites.some(
        (lesson) => lesson.url === currentUrl
      );
      favorite.checked = isFavorite;
    });

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message?.data?.url === currentUrl) {
        switch (message.action) {
          case ADD_LESSON: {
            completed.checked = true;
            break;
          }
          case REMOVE_LESSON: {
            completed.checked = false;
            break;
          }

          case ADD_FAVORITE: {
            favorite.checked = true;
            break;
          }
          case REMOVE_FAVORITE: {
            favorite.checked = false;
            break;
          }
        }
      }
      if (message.action === GET_CURRENT_LESSONS) {
        sendResponse(data);
      }
    });
  } else {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.action === GET_CURRENT_LESSONS) {
        sendResponse();
      }
    });
  }
})();
