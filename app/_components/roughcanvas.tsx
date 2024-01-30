"use client";

import { ALargeSmall, Circle, Hand, Minus, MousePointer, Pencil, Plus, RectangleHorizontal, Redo2, Slash, Undo2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import rough from "roughjs";

import { drawfunction } from "@/app/utils/draw";
import { getMouseCoordinates } from "../utils/getMousecoordinates";
import { Generator } from "./shapes/generator";

import { useHistory } from "./hooks/useHistory";

import { tool } from "./types/tools";
import { genratortype } from "./types/gen";


export enum actions{
    "drawing",
    "panning",
    "writing",
    "no Action"
}


const Rough = () => {

const {elements,setElements,onundo,onredo} = useHistory();
const [draw,setDraw] = useState(false);
const [action, setAction] = useState<actions>(actions["no Action"]);
const [panOffset, setPanOffset] = useState({ x: 0, y: 0 })
const [startingpanoffset, setStartingPanoffset] = useState({ x: 0, y: 0 })
const [scale, setScale] = useState(1)
const [scaleoffset, setScaleoffset] = useState({ x: 0, y: 0 })
    
const [iswindow , setIswindow] = useState(false);

const [tool, setTool] = useState<tool>("selection");
const [genr, setGenr] = useState<genratortype>();
const [cursorstyle, setCursorStyle] = useState<string>("default");

const canvasRef = useRef<HTMLCanvasElement>(null);
const canvas = canvasRef.current;

  
const textarea = useRef<HTMLTextAreaElement>(null);




useEffect(()=>{

if(tool == "text"){
  setCursorStyle("text")
}else if(tool == "pan"){
    setCursorStyle("grab")
}else{
    setCursorStyle("default");
}

},[tool])


useEffect(() => {
    if(typeof window != "undefined"){
        setIswindow(true)
    }
    if (!canvas) return
    const genrator = rough.generator()
    const rc = rough.canvas(canvas)
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    if(!canvas) return

    
    const generator = new Generator(genrator,rc,ctx as CanvasRenderingContext2D);
    setGenr(generator)


    ctx?.clearRect(0, 0, canvas.width, canvas.height)

    const scaledwidth = canvas.width * scale
    const scaledheight = canvas.height * scale

    const scaledoffsetx = (scaledwidth - canvas.width) / 2;
    const scaledoffsety = (scaledheight - canvas.height) / 2;
    setScaleoffset({ x: scaledoffsetx, y: scaledoffsety })



    ctx.save()


    ctx.translate(panOffset.x * scale - scaledoffsetx, panOffset.y * scale - scaledoffsety)
    ctx.scale(scale, scale)

        

    drawfunction(elements,genr,scale)

    ctx.restore();

}, [elements, panOffset, scale,tool])
    

    const mousedown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (tool == "selection" || tool == "text") return
        
        setDraw(true);

        const { clientx, clienty } = getMouseCoordinates(e,panOffset,scale,scaleoffset);
        
        if(tool == "pan"){
            setAction(actions.panning)
            setCursorStyle("grabbing")
            const { clientx, clienty } = getMouseCoordinates(e,panOffset,scale,scaleoffset)
            setStartingPanoffset({ x: clientx, y: clienty })
            return
        }
        else
        {
        const element = genr?.createElement(tool,{x:clientx,y:clienty},{x:clientx,y:clienty});
        if(!element) return 
        setElements(prevState =>[...prevState,element])
        } 

    }


    const mousemove = (e: React.MouseEvent<HTMLCanvasElement>) => {
     if(!draw) return
     
     if(tool == "text" || tool == "selection") return

     const { clientx, clienty } = getMouseCoordinates(e,panOffset,scale,scaleoffset);

     if(tool == "pan"){
        if (action != actions.panning) return
        const { clientx, clienty } = getMouseCoordinates(e,panOffset,scale,scaleoffset)
        const deltaX = clientx - startingpanoffset.x
        const deltaY = clienty - startingpanoffset.y
        setPanOffset(prevstate =>
        ({
            x: prevstate.x + deltaX,
            y: prevstate.y + deltaY
        }

        )
        )
        console.log(panOffset)
        return
     }else
     {
        const index = elements.length - 1;
        const last = elements[index];
        if(!last) return
        const updated = genr?.updateElement(tool,{x:last.x1,y:last.y1},{x:clientx,y:clienty},undefined,last,undefined)
        if (!updated) return
        const elementscopy = [...elements];
        elementscopy[index] = updated;
        setElements(elementscopy);
     }
 
    }


    const mouseup = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (tool == "text") return
        setDraw(false);
        if (tool == "pan") {
            setAction(actions["no Action"])
            setCursorStyle("grab")
            return
        }

        if (tool != "pencil") {
            setTool("selection")
        }

        setCursorStyle("default")

    }

    const blurhandler = () => {
        if (tool != "text") return
        const text = textarea.current?.value;
 
        const index = elements.length - 1;
        const elementText = elements[index]
 
        const updated = genr?.updateElement(tool,undefined,undefined,elementText,undefined,text)
        if (!updated) return

        const elementscopy = [...elements];
        elementscopy[index] = updated;
        setElements(elementscopy);
        setAction(actions.drawing)
        setTool("selection")

    }

    const onClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if(tool != "text") return
    if (action == actions.writing) return
    
   
    setAction(actions.writing)

    const { clientx, clienty } = getMouseCoordinates(e,panOffset,scale,scaleoffset);
    console.log(clientx, clienty);
    
    const element = genr?.createElement(tool,{x:clientx,y:clienty},{x:clientx,y:clienty},{x:clientx,y:clienty});
    if (!element) return
    setElements(prevState => [...prevState, element])
       
    }

    const plusclick = () => {
        setScale(prevstate => Math.min(prevstate + 0.1, 10))
    }

    const minusclick = () => {
        setScale(prevstate => Math.max(prevstate - 0.1, 0.1))
    }

    return (<div>
        <div className='z-3 fixed w-full flex justify-center  '>
            <div className='border-2 mt-2 bg-slate-200 border-stone-600 rounded-lg p-2 flex '>
            <input className="hidden peer/select" type="radio" id='Select' checked={tool == "selection"} value={"selection"} onChange={(e) => {
                setTool("selection")} } />
            <label className='p-2 mx-2 hover:cursor-pointer hover:bg-slate-300  peer-checked/select:text-stone-100  peer-checked/select:bg-slate-500 rounded-lg' htmlFor='Select'><MousePointer/></label>

            <input className="hidden peer/pan" type="radio" id='pan' checked={tool == "pan"} value={"pan"} onChange={e => setTool("pan")} onClick={() => setCursorStyle("grab")} />
            <label className='p-2 mx-2 hover:cursor-pointer hover:bg-slate-300  peer-checked/pan:text-stone-100  peer-checked/pan:bg-slate-500 rounded-lg' htmlFor='pan'><Hand/></label>

            <input className="hidden peer/line" type="radio" id='line' checked={tool == "line"} value={"line"} onChange={(e) => {
                setTool("line") 
                }} />
            <label className='p-2 mx-2 hover:cursor-pointer hover:bg-slate-300  peer-checked/line:text-stone-100  peer-checked/line:bg-slate-500 rounded-lg' htmlFor='line'><Slash/></label>

            <input className="hidden peer/rect" type="radio" id='rectangle' checked={tool == "rectangle"} value={"rectangle"}  onChange={(e) => {
                setTool("rectangle") 
                }} />
            <label className='p-2 mx-2 hover:cursor-pointer hover:bg-slate-300  peer-checked/rect:text-stone-100  peer-checked/rect:bg-slate-500 rounded-lg' htmlFor='rectangle'><RectangleHorizontal/></label>

            <input className="hidden peer/circle" type="radio" id='circle' checked={tool == "circle"} value={"circle"}  onChange={(e) => {
                setTool("circle") 
               }} />
            <label className='p-2 mx-2 hover:cursor-pointer hover:bg-slate-300  peer-checked/circle:text-stone-100  peer-checked/circle:bg-slate-500 rounded-lg' htmlFor='circle'><Circle/></label>

            <input className="hidden peer/pencil" type="radio" id='pencil' checked={tool == "pencil"} value={"pencil"}  onChange={(e) => {
                setTool("pencil") 
                }} />
            <label className='p-2 mx-2 hover:cursor-pointer hover:bg-slate-300  peer-checked/pencil:text-stone-100  peer-checked/pencil:bg-slate-500 rounded-lg' htmlFor='pencil'><Pencil/></label>

            <input className="hidden peer/text" type="radio" id='text' checked={tool == "text"} value={"text"}  onChange={(e) => {
                setTool("text") 
                }} />
            <label className='p-2 mx-2 hover:cursor-pointer hover:bg-slate-300  peer-checked/text:text-stone-100  peer-checked/text:bg-slate-500 rounded-lg' htmlFor='text'><ALargeSmall/></label>
            </div>
        </div>
        <div className='flex'>
            <div className='z-3 bottom-0 left-0 absolute bg-slate-200  m-6 flex justify-between border-2 rounded-lg border-stone-900'>
                <button className='px-4 py-2 rounded-lg mr-2 hover:bg-slate-300 ' onClick={minusclick}><Minus/></button>
                <button onClick={() => setScale(1)}>{new Intl.NumberFormat('en-GB', { style: "percent" }).format(scale)}</button>
                <button className='px-4 py-2 rounded-lg ml-2 hover:bg-slate-300' onClick={plusclick}><Plus/></button>
            </div>
            <div className='bottom-0 left-0 absolute bg-slate-200 m-6 ml-60 flex justify-between border-2 rounded-lg border-stone-900'>
                <button className='px-4 py-2 hover:bg-slate-300 rounded-lg' onClick={onundo}><Undo2/></button>
                <button className='px-4 py-2 hover:bg-slate-300 rounded-lg' onClick={onredo}><Redo2/></button>
            </div>
        </div>

        {(action === actions.writing) ? <textarea
            ref={textarea}
            onBlur={blurhandler}
            autoFocus={true}
            style={
                {

                    position: "fixed",
                    top: (elements[elements.length - 1].y1 * scale + panOffset.y * scale - scaleoffset.y),
                    left: (elements[elements.length - 1].x1 * scale + panOffset.x * scale - scaleoffset.x),
                    overflow: 'auto',
                    font: `${24 * scale}px sans-serif`,
                    margin: 0,
                    padding: 0,
                    border: "transparent",
                    outline: 0,
                    whiteSpace: "pre",
                    background: "transparent",
                    zIndex: 3,
                }
            } /> : null}

      {iswindow && <canvas
            ref={canvasRef}
            style={{ cursor: cursorstyle }}
            height={window.innerHeight}
            width={window.innerWidth}
            onMouseDown={mousedown}
            onMouseMove={mousemove}
            onMouseUp={mouseup}
            onClick={onClick}
            className='z-1 bg-white'
        >Canvas</canvas>}
    </div>
      

    )

}


export default Rough;