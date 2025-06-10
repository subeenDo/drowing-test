import React, { useState, useEffect } from 'react';
import './App.css';
import LineEditor from './components/LineEditor';
import DraggableToolbar from './components/draggableToolbar';
import LineJune from './components/dataSample/LineJune';
import LineMay from './components/dataSample/LineMay';

const bgMap = {
  bgJune: {

    lines: LineJune,
  },
  bgMay: {

    lines: LineMay,
  },
};

function App() {
  const [bgSelect, setBgSelect] = useState("");
  const [selectedColor, setSelectedColor] = useState(null);
  const [lines, setLines] = useState([]);
  const handleChange = (e) => {
    setBgSelect(e.target.value);
  };

 const handleAdd = () => {
  if (!selectedColor) return;
  const nextId = lines.length + 1;
  const newLine = {
    id: nextId,
    x1: 100,
    y1: 100,
    x2: 200,
    y2: 200,
    color: selectedColor,
  };
  setLines((prev) => [...prev, newLine]);
};


  const handleSave = () => {
    console.log('현재 선들:', lines);
  };

  const handleReset = () => {
    setLines([]);
  };

  useEffect(() => {
  if (bgSelect && bgMap[bgSelect]) {
    setLines(bgMap[bgSelect].lines || []);
  } else {
    setLines([]); 
  }
}, [bgSelect]);

  return (
    <div className="app-container">
      <div className="header">
        <div className="left">
          <h1>선 편집기</h1>
          <select className="bg-select" value={bgSelect} onChange={handleChange}>
            <option value="">배경 선택</option>
            <option value="bgJune">망곰 6월</option>
            <option value="bgMay">망곰 5월</option>
          </select>
        </div>

        <div className="right">
          <button onClick={(e) => { e.stopPropagation(); handleAdd(); }} className="add-btn">
            추가
          </button>
          <button onClick={(e) => { e.stopPropagation(); handleSave(); }} className="save-btn">
            저장
          </button>
          <button onClick={(e) => { e.stopPropagation(); handleReset(); }} className="reset-btn">
            초기화
          </button>
        </div>
      </div>

      <LineEditor bgSelect={bgSelect} lines={lines} setLines={setLines } selectedColor={selectedColor}
        setSelectedColor={setSelectedColor}/>
      <DraggableToolbar
        lines={lines}
        selectedColor={selectedColor}
        setSelectedColor={setSelectedColor}
      />
    </div>
  );

}

export default App;
