import React from "react";
import "./componentscss/E2.css"

function Page2() {
  return (
    <div className="page-2-container">
      <div className="page-2-in">
        <h2>Select Verse</h2>
        <div className="dropdown-container">
          <div className="book-dropdown dropdown">
            <span>BOOK</span>
            <select name="book" id="book">
              <option value="exodus">Exodus</option>
              <option value="exodus">Exodus</option>
              <option value="exodus">Exodus</option>
              <option value="exodus">Exodus</option>
            </select>
          </div>
          <div className="chapter-dropdown dropdown">
          <span>CHAPTER</span>
            <select name="chapter" id="chapter">
              <option value="chapter">Chapter</option>
              <option value="chapter">Chapter</option>
              <option value="chapter">Chapter</option>
              <option value="chapter">Chapter</option>
            </select>
          </div>
          <div className="verse-dropdown dropdown">
          <span>VERSE</span>
            <select name="book" id="book">
              <option value="verse">Verse</option>
              <option value="verse">Verse</option>
              <option value="verse">Verse</option>
              <option value="verse">Verse</option>
            </select>
          </div>
        </div>
        <div className="quote-container">

        </div>
        <div className="quote-button-container">
            <button className="quote-btn kjv-btn">KJV</button>
            <button className="quote-btn esv-btn">ESV</button>
            <button className="quote-btn niv-btn">NIV</button>
            <button className="quote-btn gnb-btn">GNB</button>
        </div>
        <button className="create-btn">Create</button>

      </div>
    </div>
  );
}

export default Page2;
