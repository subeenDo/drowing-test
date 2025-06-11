import React, { useRef, useEffect, useState } from 'react';
import '../assert/css/LineEditor.css';

const DraggableToolbar = ({ objects, selectedObject, setSelectedObject, activeType }) => {
  const toolbarRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const offset = useRef({ x: 0, y: 0 });

  // objects 배열을 순회하며 각 타입별 개수를 계산 (key는 문자열 혹은 "image"로 처리)
  const typeCounts = objects.reduce((acc, object) => {
    const key =
      typeof object.type === 'string'
        ? object.type
        : typeof object.type === 'object' && typeof object.type.default === 'string' && object.type.default.startsWith('data:image')
        ? object.type.default
        : 'image';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  // 마우스 다운 이벤트 핸들러 (드래그 시작)
  const onMouseDown = (e) => {
    const toolbar = toolbarRef.current;
    // 마우스 위치와 툴바 위치 간 오프셋 계산
    offset.current = {
      x: e.clientX - toolbar.offsetLeft,
      y: e.clientY - toolbar.offsetTop,
    };
    setIsDragging(true);
  };

  // 드래그 상태에 따라 마우스 움직임 처리
  useEffect(() => {
    const onMouseMove = (e) => {
      if (!isDragging) return;
      const toolbar = toolbarRef.current;

      // 새로운 위치 계산 후 툴바 위치 변경
      const newX = e.clientX - offset.current.x;
      const newY = e.clientY - offset.current.y;
      toolbar.style.left = `${newX}px`;
      toolbar.style.top = `${newY}px`;
    };

    // 마우스 업 시 드래그 종료
    const onMouseUp = () => setIsDragging(false);

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [isDragging]);

  // 툴바 외부 클릭 시 선택된 오브젝트 해제 처리
  useEffect(() => {
    const handleClickOutside = (event) => {
      const clickedEl = event.target;

      // 클릭한 요소가 툴바 내부인지 검사
      const isInsideToolbar = toolbarRef.current?.contains(clickedEl); 
      
      // [data-skip-deselect] 속성이 붙은 요소는 제외 처리
      const isSkipElement = clickedEl.closest('[data-skip-deselect]');

      // 툴바 외부 클릭이고, 스킵 요소도 아니면 선택 해제
      if (!isInsideToolbar && !isSkipElement) {
        setTimeout(() => setSelectedObject(null), 0);
      }
    };

    window.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('mousedown', handleClickOutside);
    };
  }, [setSelectedObject]);

  return (
    <div
      className="toolBar"
      ref={toolbarRef}
      onMouseDown={onMouseDown}
      style={{ position: 'absolute', top: '900px', left: '48px' }}
    >
      {objects.length === 0 ? (
        <p>배경을 선택해주세요</p>
      ) : (
        <table border="1" cellPadding="5">
          <thead>
            <tr>
              <th>Index</th>
              <th>Object</th>
              <th>Count</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(typeCounts).map(([type, count], idx) => (
              <tr
                key={type}
                onClick={() => setSelectedObject(type)}
                style={{
                  backgroundColor:
                    selectedObject === type
                      ? '#d0d0d0'
                      : (Array.isArray(activeType) && activeType.includes(type))
                      ? '#848484' 
                      : 'transparent',
                  cursor: 'pointer',
                  transition: 'background-color 0.3s',
                }}
              >

                <td>{idx + 1}</td>
                <td>
                  {type.startsWith('data:image') ? (
                    <img src={type} alt="type" width="40" height="40" />
                  ) : (
                    type
                  )}
                </td>
                <td>{count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default DraggableToolbar;
