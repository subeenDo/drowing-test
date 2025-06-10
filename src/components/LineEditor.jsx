import React, { useState, useRef, useEffect } from 'react';
import '../assert/css/LineEditor.css';
import LineJune from './dataSample/LineJune';
import LineMay from './dataSample/LineMay';
import bgJune from '../assert/img/imgJune.png';
import bgMay from '../assert/img/imgMay.png';

const bgMap = {
  bgJune: {
    image: bgJune,
    lines: LineJune,
  },
  bgMay: {
    image: bgMay,
    lines: LineMay,
  },
};

const LineEditor = ({lines, setLines, bgSelect}) => {

  const [selectedLineId, setSelectedLineId] = useState(null);
  
  const svgRef = useRef(null);
  const draggingRef = useRef(null);

  const getSvgPoint = (clientX, clientY) => {
    const svg = svgRef.current;
    if (!svg || !svg.getScreenCTM()) return { x: clientX, y: clientY };
    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const svgP = pt.matrixTransform(svg.getScreenCTM().inverse());
    return { x: svgP.x, y: svgP.y };
  };

  const moveLineToCenter = (cx, cy, x1, y1, x2, y2) => {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);
    const halfLen = length / 2;

    const newX1 = cx - halfLen * Math.cos(angle);
    const newY1 = cy - halfLen * Math.sin(angle);
    const newX2 = cx + halfLen * Math.cos(angle);
    const newY2 = cy + halfLen * Math.sin(angle);

    return { x1: newX1, y1: newY1, x2: newX2, y2: newY2 };
  };

  const handleMouseDown = (lineId, pointType) => (e) => {
    e.preventDefault();
    setSelectedLineId(lineId);
    draggingRef.current = { lineId, pointType };

    setLines((prev) => {
      const clicked = prev.find((line) => line.id === lineId);
      const rest = prev.filter((line) => line.id !== lineId);
      return [...rest, clicked];
    });

  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!draggingRef.current) return;

      const { lineId, pointType } = draggingRef.current;
      const { x, y } = getSvgPoint(e.clientX, e.clientY);

      setLines((prevLines) =>
        prevLines.map((line) => {
          if (line.id !== lineId) return line;

          if (pointType === 'start') {
            return { ...line, x1: x, y1: y };
          } else if (pointType === 'end') {
            return { ...line, x2: x, y2: y };
          } else if (pointType === 'line') {
            const moved = moveLineToCenter(x, y, line.x1, line.y1, line.x2, line.y2);
            return { ...line, ...moved };
          }

          return line;
        })
      );
    };

    const handleMouseUp = () => {
      draggingRef.current = null;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);



  const handleSvgClick = (e) => {
    // 선(line), 원(circle), 그룹(g)을 클릭한 경우 무시
    const tagName = e.target.tagName.toLowerCase();

    if (['line', 'circle', 'g'].includes(tagName)) return;

    // 빈 공간 클릭 시 선택 해제
    setSelectedLineId(null);
  };

  return (
    <div
      className="editor-container"
      style={{
        backgroundImage: bgSelect ? `url(${bgMap[bgSelect]?.image})` : 'none',
      }}
    >

      <svg
        ref={svgRef}
        className="editor-svg"
        onMouseDown={handleSvgClick}
        style={{ width: '100%', height: '100%', pointerEvents: 'all', border: '1px solid #ccc' }}
      >
      {lines.map((line) => {
        const isSelected = line.id === selectedLineId;

        return (
          <g key={line.id}>
            <line
              x1={line.x1}
              y1={line.y1}
              x2={line.x2}
              y2={line.y2}
              stroke={line.color || 'blue'}
              strokeWidth={10}
              onMouseDown={handleMouseDown(line.id, 'line')}
              style={{ cursor: 'move', pointerEvents: 'all' }}
            />

            {isSelected && (
              <>
                <circle
                  cx={line.x1}
                  cy={line.y1}
                  r={6}
                  fill="white"                
                  stroke="black"
                  strokeWidth={2} 
                  onMouseDown={handleMouseDown(line.id, 'start')}
                  style={{ cursor: 'pointer' }}
                />
                <circle
                  cx={line.x2}
                  cy={line.y2}
                  r={6}
                  fill="white"
                  stroke="black"
                  strokeWidth={2}
                  onMouseDown={handleMouseDown(line.id, 'end')}
                  style={{ cursor: 'pointer' }}
                />
              </>

            )}
          </g>
        );
      })}

      </svg>

      <div style={{ marginTop: 10 }}>
        {lines.map((line) => (
          <div key={line.id}>
            {line.id} → x1: {line.x1.toFixed(2)}, y1: {line.y1.toFixed(2)}, x2: {line.x2.toFixed(2)}, y2: {line.y2.toFixed(2)}
          </div>
        ))}
      </div>

    </div>
  );
};

export default LineEditor;
