"use client";

import { useEffect, useLayoutEffect,useRef, useState } from 'react';
import rough from 'roughjs'
import { Drawable } from 'roughjs/bin/core';
import getStroke, { getStrokePoints } from 'perfect-freehand';
import { RoughCanvas } from 'roughjs/bin/canvas';

type point = {x:number,y:number,pressure?: number | undefined}[]
type inputbox = {x:number,y:number}

interface Element{
    x1:number;
    y1:number;
    x2:number;
    y2:number;
    roughobject?: Drawable | undefined
    tool:tools
    points?: point
}
 
enum actions{
   "drawing",
    "text"
}

enum tools{
    "line",
    "rectangle",
    "circle",
    "pencil",
    "text"
}

const gen = rough.generator()

const createElement =(x1:number,y1:number,x2:number,y2:number,tool:tools)=>{
    let roughobject;
    if(tool == tools.line) 
    {
        roughobject= gen.line(x1,y1,x2,y2);
        return {x1,y1,x2,y2,roughobject,tool}
    }
    else if(tool == tools.circle){
        const a = (x1+x2)
        const h = a/2
        const b = (y1+y2)
        const k = b/2;
        const diameter = Math.sqrt((x2-x1)**2+(y2-y1)**2);
       roughobject = gen.circle(h,k,diameter);
       return {x1,y1,x2,y2,roughobject,tool}
    }
    else if(tool == tools.rectangle){
        roughobject = gen.rectangle(x1,y1,x2-x1,y2-y1)
        return {x1,y1,x2,y2,roughobject,tool}
    }
    else if(tool == tools.pencil){
         return {x1,y1,x2,y2,tool,points:[{x:x2,y:y2}]}
    }
   
    else{
        console.log("no input");
    }
    }

     const updateelements = (elements:Element[],clientX:number,clientY:number,tool:tools)=>{
        if(tool==tools.pencil){
            const index = elements.length-1;
            const points = elements[index].points as point
            const pointcopy = [...points]
            const updated = {x1:elements[index].x1,y1:elements[index].y1,x2:clientX,y2:clientY,tool,points:[...pointcopy,{x:clientX,y:clientY}]}
            if(!updated) return
        const elementscopy = [...elements];
        elementscopy[index] = updated;
        return elementscopy
        }     
        const index = elements.length-1;
        const updated = createElement(elements[index].x1,elements[index].y1,clientX,clientY,tool);
        if(!updated) return
        const elementscopy = [...elements];
        elementscopy[index] = updated;
        return elementscopy
     }

     const getSvgPathFromStroke = (stroke: any[]) => {
        if (!stroke.length) return "";
      
        const d = stroke.reduce(
          (acc, [x0, y0], i, arr) => {
            const [x1, y1] = arr[(i + 1) % arr.length];
            acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
            return acc;
          },
          ["M", ...stroke[0], "Q"]
        );
      
        d.push("Z");
        return d.join(" ");
      };

     const Draw = (elements:Element[],ctx:CanvasRenderingContext2D,rc:RoughCanvas)=>{
        if(!elements) return 
        elements.map((element:Element)=>{
            if(element.tool==tools.pencil){
                if(!element.points) return
                const stroke = getSvgPathFromStroke(getStroke(element.points));
                ctx.fill(new Path2D(stroke));
            }
            else{
                rc.draw(element.roughobject as Drawable)
            }
        })
     }

const Rough2 = ()=>{
    
    const [elements,setElements] = useState<Element[]>([]);
    const [drawing, setDrawing] =useState(false);
    const [tool,setTool] = useState<tools>(tools.line);
    const [action,setAction] =useState<string>()
    const [inptl,setInptl] =useState<inputbox>()
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const canvas = canvasRef.current
    const textarea = useRef<HTMLTextAreaElement>(null)



   

    useEffect(()=>{    
        if(!canvas) return 
        const rc = rough.canvas(canvas)
        const ctx = canvas.getContext("2d")
       if(!ctx) return
        ctx?.clearRect(0,0,canvas.width,canvas.height)
      
        Draw(elements,ctx,rc)
         
    },[elements])


    
    const mousedown = (e:React.MouseEvent<HTMLCanvasElement>)=>{
        setDrawing(true);
       const {clientX,clientY} = e
       const element = createElement(clientX,clientY,clientX,clientY,tool);
      if(!element) return
       setElements(prevState =>[...prevState,element])
       
    }

    const mousemove =(e:React.MouseEvent<HTMLCanvasElement>)=>{
        if(!drawing) return
        // if(tool==tools.text) return

        const {clientX,clientY} = e
       
        const elementscopy =updateelements(elements,clientX,clientY,tool)
        if(!elementscopy) return
        setElements(elementscopy);
        console.log(elements)
        
    }


   const mouseup = (e: React.MouseEvent<HTMLCanvasElement>)=>{

    setDrawing(false);
    // if(tool==tools.text)
    // {
    //          setAction("text")
    // }
    // setAction("drawing")
   }

  

    return ( <div>
    <div className='z-2 fixed'>
        <input type="radio" id='line' checked={tool==tools.line} value={tools.line} onChange={e=>setTool(tools.line)}/>
        <label htmlFor='line'>Line</label>
        <input type="radio" id='rectangle' checked={tool==tools.rectangle} value={tools.rectangle} onChange={e=>setTool(tools.rectangle)}/>
        <label htmlFor='rectangle'>Rectangle</label>
        <input type="radio" id='circle' checked={tool==tools.circle} value={tools.circle} onChange={e=>setTool(tools.circle)}/>
        <label htmlFor='circle'>Circle</label>
        <input type="radio" id='pencil' checked={tool==tools.pencil} value={tools.pencil} onChange={()=>{
            setTool(tools.pencil) 
         }
            }/>
        <label htmlFor='pencil'>Pencil</label>
        <input type="radio" id='text' checked={tool==tools.text} value={tools.text} onChange={(e)=>{
            setTool(tools.text)
            
        }
            }/>
        <label htmlFor='text'>Text</label>
    </div>
    {/* {(action==="text") ? <textarea 
    ref={textarea}
    style={
        {   position:"fixed",
            top:inptl?.y-2 + 0,
            left:inptl?.x + 0 ,
            overflow:'auto',
            font: "24px sans-serif",
            margin: 0,
            padding: 0,
            border: "5px solid black",
            outline: 0,
            whiteSpace: "pre",
            background: "transparent",
            zIndex: 3,
        }
    }/>:null} */}
        <canvas 
        ref={canvasRef}
        height={window.innerHeight}
        width={window.innerWidth}
        onMouseDown={mousedown}
        onMouseMove={mousemove}
        onMouseUp={mouseup}
        className='z-1'
        >Canvas</canvas>
        </div>
    )
    }


export default Rough2;