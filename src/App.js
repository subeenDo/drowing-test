import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import imgObject from "./assert/img/imgObject.jpg";
import LineEditor from './components/LineEditor';
import DraggableToolbar from './components/draggableToolbar';
import ObjectJune from './components/dataSample/ObjectJune';
import ObjectMay from './components/dataSample/ObjectMay';
import { playGroups } from './components/dataSample/PlayGroups';


const bgMap = {
  bgJune: {

    objects: ObjectJune,
  },
  bgMay: {

    objects: ObjectMay,
  },
};

function App() {
  const [bgSelect, setBgSelect] = useState("");
  const [selectedObject, setSelectedObject] = useState(null);
  const [activeType, setActiveType] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);


  const playIntervalRef = useRef(null);

  const [objects, setObjects] = useState([]);
  const handleChange = (e) => {
    setBgSelect(e.target.value);
  };

// 전체를 하나씩 재생
// const handlePlay = () => {
//   if (isPlaying) {
//     clearInterval(playIntervalRef.current);
//     playIntervalRef.current = null;
//     setIsPlaying(false);
//     setActiveType(null);
//     return;
//   }

//   const uniqueTypes = Array.from(
//     new Set(objects.map(obj => typeof obj.type === 'string' ? obj.type : 'image'))
//   );

//   let index = 0;
//   setIsPlaying(true);

//   playIntervalRef.current = setInterval(() => {
//     setActiveType(uniqueTypes[index]);
//     index = (index + 1) % uniqueTypes.length; // 순환
//   }, 1000);
// };


//그룹별 재생 + 마지막엔 전체 보여주기
const handlePlay = () => {
  if (isPlaying) {
    clearInterval(playIntervalRef.current);
    playIntervalRef.current = null;
    setIsPlaying(false);
    setActiveType([]);
    return;
  }

  let index = 0;
  setIsPlaying(true);

  playIntervalRef.current = setInterval(() => {
    if (index < playGroups.length) {
      setActiveType(playGroups[index]);
    } else {
      const allTypes = Array.from(
        new Set(objects.map(obj => typeof obj.type === 'string' ? obj.type : imgObject))
      );
      setActiveType(allTypes);
    }

    index = (index + 1) % (playGroups.length + 1);
  }, 1000);
};


 const handleAdd = () => {
  if (!selectedObject) return ;
  const nextId = objects.length + 1;
  const newObject = {
    id: nextId,
    x1: 100,
    y1: 100,
    x2: 200,
    y2: 200,
    type: selectedObject,
  };
  setObjects((prev) => [...prev, newObject]);
};


  const handleSave = () => {
    console.log('현재 선들:', objects);
  };

  const handleReset = () => {
    if (bgSelect && bgMap[bgSelect]) {
      setObjects(bgMap[bgSelect].objects || []);
    } else {
      setObjects([]); 
    }
  };

  useEffect(() => {
  if (bgSelect && bgMap[bgSelect]) {
    setObjects(bgMap[bgSelect].objects || []);
  } else {
    setObjects([]); 
  }
}, [bgSelect]);

useEffect(() => {
  return () => {
    if (playIntervalRef.current) {
      clearInterval(playIntervalRef.current);
    }
  };
}, []);


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
          <button onClick={(e) => { e.stopPropagation(); handlePlay(); }} className="play-btn" data-skip-deselect>
            {isPlaying ? '멈춤' : '재생'}
          </button>
          <button onClick={(e) => { e.stopPropagation(); handleAdd(); }} className="add-btn" data-skip-deselect>
            추가
          </button>
          <button onClick={(e) => { e.stopPropagation(); handleSave(); }} className="save-btn" data-skip-deselect>
            저장
          </button>
          <button onClick={(e) => { e.stopPropagation(); handleReset(); }} className="reset-btn" data-skip-deselect>
            초기화
          </button>
        </div>
      </div>

      <LineEditor 
        bgSelect={bgSelect} 
        objects={objects} 
        setObjects={setObjects} 
        selectedObject={selectedObject}
        activeType={activeType}
      />
      <DraggableToolbar
        objects={objects}
        selectedObject={selectedObject}
        setSelectedObject={setSelectedObject}
        activeType={activeType}
      />
    </div>
  );

}

export default App;
