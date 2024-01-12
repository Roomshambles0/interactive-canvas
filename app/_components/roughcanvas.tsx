"use client";
import { useEffect, useLayoutEffect,useRef, useState } from 'react';
import rough from 'roughjs'
import { Drawable } from 'roughjs/bin/core';

interface Element{
    x1:number;
    y1:number;
    x2:number;
    y2:number;
    roughobject:Drawable
}

const gen = rough.generator()
const createElement =(x1:number,y1:number,x2:number,y2:number)=>{
   const roughobject = gen.rectangle(x1,y1,x2-x1,y2-y1);
   return {x1,y1,x2,y2,roughobject}
}

const Rough = ()=>{
    const [elements,setElements] = useState<Element[]>([]);
    const [drawing, setDrawing] =useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const canvas = canvasRef.current
    
    useEffect(()=>{    
        if(!canvas) return 
        const rc = rough.canvas(canvas)
        const ctx = canvas.getContext("2d")
       
        ctx?.clearRect(0,0,canvas.width,canvas.height)
      
        elements.forEach(element=> rc.draw(element.roughobject));
         
    },[elements])
    
    const mousedown = (e:React.MouseEvent<HTMLCanvasElement>)=>{
       setDrawing(true);

       const {clientX,clientY} = e
       const element = createElement(clientX,clientY,clientX,clientY);
             
       setElements(prevState =>[...prevState,element])
         
    }

    const mousemove =(e:React.MouseEvent<HTMLCanvasElement>)=>{
        if(!drawing) return

        const {clientX,clientY} = e
        
        const index = elements.length-1;
        const updated = createElement(elements[index].x1,elements[index].y1,clientX,clientY);
        const elementscopy = [...elements];
        elementscopy[index] = updated;
        setElements(elementscopy);
        console.log(elements)
    }


   const mouseup = (e: React.MouseEvent<HTMLCanvasElement>)=>{
    setDrawing(false);
   }

    return ( <>
        <canvas 
        ref={canvasRef}
        height={window.innerHeight}
        width={window.innerWidth}
         onMouseDown={mousedown}
         onMouseMove={mousemove}
          onMouseUp={mouseup}
     
        >Canvas</canvas>
        </>
    )
    }


export default Rough;