import React, { useRef, useEffect, useState } from 'react';
import '../assert/css/LineEditor.css';

const DraggableToolbar = ({lines, selectedColor, setSelectedColor }) => {
    const toolbarRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const offset = useRef({ x: 0, y: 0 });
  
    const colorCounts = lines.reduce((acc, line) => {
    acc[line.color] = (acc[line.color] || 0) + 1;
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

return (
  <div
    className="toolBar"
    ref={toolbarRef}
    onMouseDown={onMouseDown}
    style={{ position: 'absolute', top: '154px', left: '48px' }}
  >

    {lines.length === 0 ? (
      <p>배경을 선택해주세요</p>
    ) : (
      <table border="1" cellPadding="5">
        <thead>
          <tr>
            <th>Index</th>
            <th>Color</th>
            <th>Count</th>
          </tr>
        </thead>
        <tbody>
        {Object.entries(colorCounts).map(([color, count], idx) => (
          <tr
            key={color}
            onClick={() => setSelectedColor(color)}
            style={{
              backgroundColor: selectedColor === color ? '#d0d0d0' : 'transparent',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
            }}
          >
            <td>{idx + 1}</td>
            <td>{color.charAt(0).toUpperCase() + color.slice(1)}</td>
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
