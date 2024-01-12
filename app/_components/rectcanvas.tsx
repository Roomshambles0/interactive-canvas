"use client";

import { useEffect, useRef, useState } from "react";
import { ChromePicker } from "react-color";

const Rect = ()=>{
    const [color, setColor] = useState<string>('#000')
    const [mousedown, setMousedown] = useState<boolean>(false)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const contextRef = useRef<CanvasRenderingContext2D | null>(null)
    
    
    const canvasOffSetX = useRef<number | null>(null);
    const canvasOffSetY = useRef<number | null>(null);
    const startX = useRef<number | null>(null);
    const startY = useRef<number | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;

        const context = canvas?.getContext("2d");
        if (!context) return 
        context.lineCap = "round";
        context.strokeStyle = "black";
        context.lineWidth = 5;
        contextRef.current = context;

        const canvasOffSet = canvas?.getBoundingClientRect();
        if (!canvasOffSet) return 
        canvasOffSetX.current = canvasOffSet.top;
        canvasOffSetY.current = canvasOffSet.left;
    }, []);

    const clear = () =>
    {
        const canvas = canvasRef.current
        if (!canvas) return
    
        const ctx = canvas.getContext('2d')
        if (!ctx) return 
    
        ctx.clearRect(0, 0, canvas.width, canvas.height)
    }
    
    
    const onMousedown = (event:React.MouseEvent<HTMLCanvasElement, MouseEvent>)=>{
      setMousedown(true)
     
      if(!startX.current || !startY.current ) return
      if(!canvasOffSetX.current || !canvasOffSetY.current) return 
      startX.current = event.clientX - canvasOffSetX.current;
      startY.current = event.clientY - canvasOffSetY.current;
    }

    const onMousemove =(event:React.MouseEvent<HTMLCanvasElement, MouseEvent>)=>{
      if(!mousedown) return 
      
      event.preventDefault();
      event.stopPropagation();

      if(!canvasOffSetX.current || !canvasOffSetY.current) return 
      if(!startX.current || !startY.current ) return 
      if(!contextRef.current) return

      const mousex = event.clientX - canvasOffSetX.current;
      const mousey = event.clientY - canvasOffSetY.current;

      const width = mousex - startX.current;
      const height = mousey - startY.current;
      console.log(contextRef.current);
      contextRef.current.strokeRect(startX.current, startY.current, width, height);
    }

    const onMouseup = ()=>{
      setMousedown(false);
    }
    
    return( <div className='w-screen h-screen bg-white flex justify-center items-center'>
    <div className='flex flex-col gap-10 pr-10'>
      <ChromePicker color={color} onChange={(e) => setColor(e.hex)} />
      <button type='button' className='p-2 rounded-md border border-black' onClick={clear}>
        Clear canvas
      </button>
    </div>
    <canvas
      ref={canvasRef}
      onMouseDown={onMousedown}
      onMouseUp={onMouseup}
      onMouseMove={onMousemove}
      width={750}
      height={750}
      className='border border-black rounded-md'
    />
  </div>)
}

export default Rect;