import React from "react";
import "./List.css";

export const List = ({ items, currentItem, onSelect, onRemove }) => {
  const getItem = (lesson) => {
    let classList = "item-list";
    if (onRemove) classList += " item-list-remove";
    if (lesson.url === currentItem?.url) classList += " active";
    const handleRemove = (e) => {
      e.stopPropagation();
      onRemove(lesson);
    };

    return (
      <div
        key={lesson.url}
        className={classList}
        onClick={() => onSelect(lesson)}
      >
        <span className="item-title" title={lesson.title}>
          {lesson.title}
        </span>
        {onRemove && (
          <button className="btn-delete-item" onClick={handleRemove}>
            <span className="delete-icon"></span>
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="list-container">
      <div className="list-inner-container">
        {items.map((lesson) => getItem(lesson))}
      </div>
    </div>
  );
};
