import React from "react";
import "./List.css";
import tutor from "../../images/tutor.png";
import tutor2 from "../../images/tutor2.png";

const tutors = [tutor, tutor2];
const getTutor = () => tutors[Math.floor(Math.random() * tutors.length)];


export const List = ({ items, currentItem, onSelect, onRemove }) => {
  const getItem = (lesson) => {
    const isCurrent = lesson.url === currentItem?.url;
    let classList = "list-item";
    if (onRemove) classList += " list-item-remove";
    if (isCurrent) classList += " active";

    const handleRemove = (e) => {
      e.stopPropagation();
      onRemove(lesson);
    };

    const handleSelect = () => {
      onSelect(lesson)
    };

    return (
      <div
        key={lesson.url}
        className={classList}
      >
        <button disabled={isCurrent} onClick={handleSelect}>
          <span className="item-title" title={lesson.title}>
            {lesson.title}
          </span>
        </button>
        {
          onRemove && (
            <button className="btn-delete-item" title="Delete" onClick={handleRemove}>
              <span className="delete-icon"></span>
            </button>
          )
        }
      </div >
    );
  };

  return (
    <div className="list-container">
      {items.length > 0 ? (
        <div className="list-inner-container">
          {items.map((lesson) => getItem(lesson))}
        </div>
      ) : (
        <div className="empty-container">
          <img
            className="empty"
            src={getTutor()}
          />
        </div>
      )}
    </div>
  );
};
