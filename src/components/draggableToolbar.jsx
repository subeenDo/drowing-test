import React, { useRef, useEffect, useState } from 'react';
import '../assert/css/LineEditor.css';

const DraggableToolbar = ({ objects, selectedObject, setSelectedObject, activeType }) => {
  const toolbarRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const offset = useRef({ x: 0, y: 0 });

  // key로 문자열 혹은 "image"만 사용
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

  const onMouseDown = (e) => {
    const toolbar = toolbarRef.current;
    offset.current = {
      x: e.clientX - toolbar.offsetLeft,
      y: e.clientY - toolbar.offsetTop,
    };
    setIsDragging(true);
  };

  useEffect(() => {
    const onMouseMove = (e) => {
      if (!isDragging) return;
      const toolbar = toolbarRef.current;
      const newX = e.clientX - offset.current.x;
      const newY = e.clientY - offset.current.y;
      toolbar.style.left = `${newX}px`;
      toolbar.style.top = `${newY}px`;
    };

    const onMouseUp = () => setIsDragging(false);

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [isDragging]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const clickedEl = event.target;
      const isInsideToolbar = toolbarRef.current?.contains(clickedEl);
      const isSkipElement = clickedEl.closest('[data-skip-deselect]');

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
