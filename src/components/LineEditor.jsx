import React, { useState, useRef, useEffect } from 'react';
import '../assert/css/LineEditor.css';
import ObjectJune from './dataSample/ObjectJune';
import ObjectMay from './dataSample/ObjectMay';
import bgJune from '../assert/img/imgJune.png';
import bgMay from '../assert/img/imgMay.png';

const bgMap = {
  bgJune: {
    image: bgJune,
    objects: ObjectJune,
  },
  bgMay: {
    image: bgMay,
    objects: ObjectMay,
  },
};

const LineEditor = ({bgSelect, objects, setObjects, selectedObject, activeType, }) => {

  const [selectedObjectId, setSelectedObjectId] = useState(null);

  const svgRef = useRef(null);
  const draggingRef = useRef(null);

  /**
   * 클라이언트 좌표를 SVG 내부 좌표로 변환
   */
  const getSvgPoint = (clientX, clientY) => {
    const svg = svgRef.current;
    if (!svg || !svg.getScreenCTM()) return { x: clientX, y: clientY };
    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const svgP = pt.matrixTransform(svg.getScreenCTM().inverse());
    return { x: svgP.x, y: svgP.y };
  };

  /**
   * 선을 중심 좌표로 이동 (x1, y1) ~ (x2, y2)를 중심(cx, cy)으로 이동
   */
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

  /**
   * 이미지 객체를 중심 좌표로 이동
  */
  const moveImageToCenter = (cx, cy, x1, y1, x2, y2) => {
    const width = x2 - x1;
    const height = y2 - y1;

    const newX1 = cx - width / 2;
    const newY1 = cy - height / 2;
    const newX2 = cx + width / 2;
    const newY2 = cy + height / 2;

    return { x1: newX1, y1: newY1, x2: newX2, y2: newY2 };
  };

  /**
   * 개별 오브젝트에 대한 마우스 클릭 시작 처리
   * → 드래그 시작 준비 (draggingRef에 저장)
   */
  const handleMouseDown = (objectId, pointType) => (e) => {
    e.preventDefault();
    setSelectedObjectId(objectId);

    const { x, y } = getSvgPoint(e.clientX, e.clientY);

    setObjects((prev) => {
      const clicked = prev.find((object) => object.id === objectId);
      const rest = prev.filter((object) => object.id !== objectId);

      let centerX = (clicked.x1 + clicked.x2) / 2;
      let centerY = (clicked.y1 + clicked.y2) / 2;

      draggingRef.current = {
        objectId,
        pointType,
        offsetX: x - centerX,
        offsetY: y - centerY
      };

      return [...rest, clicked]; // 클릭된 객체를 맨 뒤로 이동
    });
  };

  /**
   * 전역 mousemove / mouseup 핸들러 등록
   * → 오브젝트 이동 / 리사이징 처리
   */
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!draggingRef.current) return;

      const { objectId, pointType, offsetX = 0, offsetY = 0 } = draggingRef.current;
      const { x, y } = getSvgPoint(e.clientX, e.clientY);

      setObjects((prevObjects) =>
        prevObjects.map((object) => {
          if (object.id !== objectId) return object;

          const newObj = { ...object };

          // 이미지 객체에 대한 리사이즈 처리
          if (object.type && typeof object.type === 'string' && object.type.startsWith('data:image')) {
            switch (pointType) {
              case 'resize-tl':
                newObj.x1 = x;
                newObj.y1 = y;
                break;
              case 'resize-tr':
                newObj.x2 = x;
                newObj.y1 = y;
                break;
              case 'resize-bl':
                newObj.x1 = x;
                newObj.y2 = y;
                break;
              case 'resize-br':
                newObj.x2 = x;
                newObj.y2 = y;
                break;
              case 'line': {
                const moved = moveImageToCenter(x - offsetX, y - offsetY, object.x1, object.y1, object.x2, object.y2);
                return { ...object, ...moved };
              }
            }

            return newObj;
          }

          // 선 객체 처리
          if (pointType === 'start') {
            return { ...object, x1: x, y1: y };
          } else if (pointType === 'end') {
            return { ...object, x2: x, y2: y };
          } else if (pointType === 'line') {
            const moved = moveLineToCenter(x, y, object.x1, object.y1, object.x2, object.y2);
            return { ...object, ...moved };
          }

          return object;
        })
      );
    };


    const handleMouseUp = () => {
      draggingRef.current = null; // 드래그 종료
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);


  /**
   * SVG 영역 클릭 시 아무 것도 선택되지 않도록
   */
  const handleSvgClick = (e) => {
    const tagName = e.target.tagName.toLowerCase();
    if (['line', 'circle', 'g', 'image'].includes(tagName)) return;
    setSelectedObjectId(null);
  };


  return (
    <div
      className="editor-container"
      style={{
        backgroundImage: bgSelect ? `url(${bgMap[bgSelect]?.image})` : 'none',
      }}
    >
      {/* SVG 영역: 선 / 이미지 오브젝트 표시 */}
      <svg
        ref={svgRef}
        className="editor-svg"
        onMouseDown={handleSvgClick}
        style={{ width: '100%', height: '100%', pointerEvents: 'all', border: '1px solid #ccc' }}
      >
        {objects.map((object) => {
          const isSelected = object.id === selectedObjectId;
          const isActive = () => {
            if (activeType && Array.isArray(activeType)) {
              if (activeType.length === 0) return true; 
              return activeType.includes(object.type);
            } else {
              return selectedObject == null || selectedObject === object.type;
            }
          };

          if (object.type && typeof object.type === 'string' && object.type.startsWith('data:image')) {
            const width = object.x2 - object.x1;
            const height = object.y2 - object.y1;

            return (
              <g  
                key={object.id}
                className={isActive() ? 'line-object active' : 'line-object inactive'}
              >
                <image
                  href={object.type}
                  x={object.x1}
                  y={object.y1}
                  width={width}
                  height={height}
                  onMouseDown={handleMouseDown(object.id, 'line')}
                  style={{ cursor: 'move', pointerEvents: 'all' }}
                />
                {isSelected && (
                    <>
                      {/* 좌상 */}
                      <circle
                        cx={object.x1}
                        cy={object.y1}
                        r={6}
                        fill="white"
                        stroke="black"
                        strokeWidth={2}
                        onMouseDown={handleMouseDown(object.id, 'resize-tl')}
                        style={{ cursor: 'nwse-resize' }}
                      />
                      {/* 우상 */}
                      <circle
                        cx={object.x2}
                        cy={object.y1}
                        r={6}
                        fill="white"
                        stroke="black"
                        strokeWidth={2}
                        onMouseDown={handleMouseDown(object.id, 'resize-tr')}
                        style={{ cursor: 'nesw-resize' }}
                      />
                      {/* 좌하 */}
                      <circle
                        cx={object.x1}
                        cy={object.y2}
                        r={6}
                        fill="white"
                        stroke="black"
                        strokeWidth={2}
                        onMouseDown={handleMouseDown(object.id, 'resize-bl')}
                        style={{ cursor: 'nesw-resize' }}
                      />
                      {/* 우하 */}
                      <circle
                        cx={object.x2}
                        cy={object.y2}
                        r={6}
                        fill="white"
                        stroke="black"
                        strokeWidth={2}
                        onMouseDown={handleMouseDown(object.id, 'resize-br')}
                        style={{ cursor: 'nwse-resize' }}
                      />
                    </>
                  )}
              </g>
            );
          }

          // 선 렌더링
          return (
              <g  
                key={object.id}
                className={isActive() ? 'line-object active' : 'line-object inactive'}
              >
              <line
                x1={object.x1}
                y1={object.y1}
                x2={object.x2}
                y2={object.y2}
                stroke={object.type || 'blue'}
                strokeWidth={10}
                onMouseDown={handleMouseDown(object.id, 'line')}
                style={{ cursor: 'move', pointerEvents: 'all' }}
              />

              {isSelected && (
                <>
                  <circle
                    cx={object.x1}
                    cy={object.y1}
                    r={6}
                    fill="white"                
                    stroke="black"
                    strokeWidth={2} 
                    onMouseDown={handleMouseDown(object.id, 'start')}
                    style={{ cursor: 'pointer' }}
                  />
                  <circle
                    cx={object.x2}
                    cy={object.y2}
                    r={6}
                    fill="white"
                    stroke="black"
                    strokeWidth={2}
                    onMouseDown={handleMouseDown(object.id, 'end')}
                    style={{ cursor: 'pointer' }}
                  />
                </>
              )}
            </g>
          );
        })}


      </svg>

      <div style={{ marginTop: 10 }}>
        {objects.map((object) => (
          <div key={object.id}>
            {object.id} → x1: {object.x1.toFixed(2)}, y1: {object.y1.toFixed(2)}, x2: {object.x2.toFixed(2)}, y2: {object.y2.toFixed(2)}
          </div>
        ))}
      </div>

    </div>
  );
};

export default LineEditor;

