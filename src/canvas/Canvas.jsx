import React, { useEffect, useRef, useState } from "react";
import cl from './Canvas.module.css';

const Canvas = (props) => {

  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const [coordinatesStart, setCoordinates] = useState({});
  const [isDrawing, setDrawing] = useState(false);
  const [lines, setLines] = useState([]);
  const [circles, setCircles] = useState([]);
  
  function calculateIntersection(p1, p2, p3, p4) {
    let c2x = p3.x - p4.x;
  	let c3x = p1.x - p2.x;
  	let c2y = p3.y - p4.y;
  	let c3y = p1.y - p2.y;
  	let d  = c3x * c2y - c3y * c2x;
  	if (d == 0) {
    	throw new Error('Number of intersection points is zero or infinity.');
      return;
    }
  	let u1 = p1.x * p2.y - p1.y * p2.x;
  	let u4 = p3.x * p4.y - p3.y * p4.x;
  	let px = (u1 * c2x - c3x * u4) / d;
  	let py = (u1 * c2y - c3y * u4) / d;
  	let p = { x: px, y: py };
    console.log('coords', px, py)
    setCircles(circles => [...circles, {x: px, y: py}])
  	return p;
  }

  const printAllLines = () => {
    contextRef.current.reset();
    lines.map(coordinates => {
      contextRef.current.beginPath();
      contextRef.current.lineTo(coordinates.first.x, coordinates.first.y);
      contextRef.current.lineTo(coordinates.second.x, coordinates.second.y);
      contextRef.current.stroke();
      contextRef.current.closePath();
    })

    circles.map(circle => {
      contextRef.current.moveTo(circle.x, circle.y);
      contextRef.current.ellipse(circle.x, circle.y, 6, 6, Math.PI / 4, 0, 2 * Math.PI);
      contextRef.current.stroke();
    })
  }

  const startDraw = ({nativeEvent}) => {
    const {offsetX, offsetY} = nativeEvent;
    setCoordinates({x: offsetX, y: offsetY});
    contextRef.current.beginPath();
    contextRef.current.lineTo(offsetX, offsetY);
    contextRef.current.stroke();
    setDrawing(true);
    nativeEvent.preventDefault();
  }

  const draw = ({nativeEvent}) => {
    if(!isDrawing) {
        return;
    }
    else {
        const {offsetX, offsetY} = nativeEvent;
        printAllLines();
        contextRef.current.beginPath();
        contextRef.current.lineTo(coordinatesStart.x, coordinatesStart.y);
        contextRef.current.lineTo(offsetX, offsetY);
        contextRef.current.stroke();
        contextRef.current.closePath();
        nativeEvent.preventDefault();
    }
  }

  const stopDraw = ({nativeEvent}) => {
    const {offsetX, offsetY} = nativeEvent;
    contextRef.current.lineTo(offsetX, offsetY);
    contextRef.current.stroke();
    nativeEvent.preventDefault();
    contextRef.current.closePath();
    setDrawing(false);
    setLines(lines => {
      return [...lines, {first: coordinatesStart, second: {x: offsetX, y: offsetY}}]
    })
  }

  const reset = () => {
    contextRef.current.closePath();
    setDrawing(false);
  }

  const resetAll = () => {
    setLines([]);
    setCircles([]);
    contextRef.current.reset()
  }

  useEffect (() => {
    circles.map(circle => {
      contextRef.current.moveTo(circle.x, circle.y);
      contextRef.current.ellipse(circle.x, circle.y, 6, 6, Math.PI / 4, 0, 2 * Math.PI);
      contextRef.current.stroke();
    })
  }, [lines, circles])
  useEffect (() => {
    lines.map((line, index, arr) => {
      arr.map((l, ind) => {
        if(index < ind) {
          calculateIntersection(line.first, line.second, l.first, l.second);
        }
      })
    })
  }, [lines])
  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')
    canvas.width = 1000;
    canvas.height = 400;
    context.fill();
    contextRef.current = context;
  }, [])

  return (
    <div className={cl.canvasComponent}>
      <canvas onClick={(e) => {!isDrawing ? startDraw(e) : stopDraw(e)}} onMouseMove={(e) => {
        printAllLines();
        draw(e)
      }} onMouseLeave={reset} onContextMenu={() => false} onAuxClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        reset()}} className={cl.canvas} ref={canvasRef} {...props}/>
      <button onClick={resetAll} className={cl.btn}>Collapse lines</button>
    </div>
  )
}

export default Canvas