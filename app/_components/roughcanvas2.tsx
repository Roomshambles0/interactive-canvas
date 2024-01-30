"use client";

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import rough from 'roughjs'
import { Drawable } from 'roughjs/bin/core';
import getStroke, { getStrokePoints } from 'perfect-freehand';
import { RoughCanvas } from 'roughjs/bin/canvas';
import { Plus,Minus,Undo2,Redo2, MousePointer, Hand, Slash, RectangleHorizontal, Circle, Pencil, Text, ALargeSmall } from 'lucide-react';


type point = { x: number, y: number, pressure?: number | undefined }[]
type inputbox = { x: number, y: number }

interface Element {
    id?: number
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    roughobject?: Drawable | undefined
    tool: tools
    points?: point
    text?: string
}

enum actions {
    "drawing",
    "text"
}

enum tools {
    "line",
    "rectangle",
    "circle",
    "pencil",
    "text",
    "select",
    "pan"
}

const gen = rough.generator()

const createElement = (x1: number, y1: number, x2: number, y2: number, tool: tools, text?: string) => {
    let roughobject;
    if (tool == tools.line) {
        roughobject = gen.line(x1, y1, x2, y2);
        return { x1, y1, x2, y2, roughobject, tool }
    }
    else if (tool == tools.circle) {
        const a = (x1 + x2)
        const h = a / 2
        const b = (y1 + y2)
        const k = b / 2;
        const diameter = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
        roughobject = gen.circle(h, k, diameter);
        return { x1, y1, x2, y2, roughobject, tool }
    }
    else if (tool == tools.rectangle) {
        roughobject = gen.rectangle(x1, y1, x2 - x1, y2 - y1)
        return { x1, y1, x2, y2, roughobject, tool }
    }
    else if (tool == tools.pencil) {
        return { x1, y1, x2, y2, tool, points: [{ x: x2, y: y2 }] }
    }
    else if (tool == tools.text) {
        if (!text) return { x1, y1, x2, y2, tool, text: "" }
        return { x1, y1, x2, y2, tool, text: text }
    }
    else {
        console.log("no input");
    }
}

const updateelements = (elements: Element[], clientX: number, clientY: number, tool: tools, text?: string) => {
    if (tool == tools.pencil) {
        const index = elements.length - 1;
        const points = elements[index].points as point
        if(!points) return
        const pointcopy = [...points]
        const updated = { x1: elements[index].x1, y1: elements[index].y1, x2: clientX, y2: clientY, tool, points: [...pointcopy, { x: clientX, y: clientY }] }
        if (!updated) return
        const elementscopy = [...elements];
        elementscopy[index] = updated;
        return elementscopy
    }

    if (tool == tools.text) {
        const index = elements.length - 1;
        const updated = createElement(elements[index].x1, elements[index].y1, clientX, clientY, tool, text);
        if (!updated) return
        const elementscopy = [...elements];
        elementscopy[index] = updated;
        return elementscopy
    }

    const index = elements.length - 1;
    const updated = createElement(elements[index].x1, elements[index].y1, clientX, clientY, tool);
    if (!updated) return
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

const Draw = (elements: Element[], ctx: CanvasRenderingContext2D, rc: RoughCanvas, scale: number) => {
    if (!elements) return
    elements.map((element: Element) => {
        if (element.tool == tools.text) {
            if (element.text != "") {
                ctx.textBaseline = "top";
                ctx.font = `${24 + scale}px sans-serif`
                console.log(element.x1, element.y1)

                ctx.fillText(element.text as string, element.x1, element.y1);

            }
        }
        else if (element.tool == tools.pencil) {
            if (!element.points) return
            const stroke = getSvgPathFromStroke(getStroke(element.points));
            ctx.fill(new Path2D(stroke));
        }
        else {
            rc.draw(element.roughobject as Drawable)
        }
    })
}

const Rough2 = () => {

    const [elements, setElements] = useState<Element[]>([]);
    const [drawing, setDrawing] = useState(false);
    const [tool, setTool] = useState<tools>(tools.select);
    const [action, setAction] = useState<string>()
    const [cursorstyle, setCursorStyle] = useState("pointer")
    const [panOffset, setPanOffset] = useState({ x: 0, y: 0 })
    const [startingpanoffset, setStartingPanoffset] = useState({ x: 0, y: 0 })
    const [scale, setScale] = useState(1)
    const [scaleoffset, setScaleoffset] = useState({ x: 0, y: 0 })
    const [history, setHistory] = useState<Element[]>([])
    const [undo, setUndo] = useState(false)
    const [iswindow , setIswindow] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const canvas = canvasRef.current
    const textarea = useRef<HTMLTextAreaElement>(null)





    useLayoutEffect(() => {
        if(typeof window != "undefined"){
            setIswindow(true)
        }
        if (!canvas) return
        const rc = rough.canvas(canvas)
        const ctx = canvas.getContext("2d")
        if (!ctx) return
        ctx?.clearRect(0, 0, canvas.width, canvas.height)

        const scaledwidth = canvas.width * scale
        const scaledheight = canvas.height * scale

        const scaledoffsetx = (scaledwidth - canvas.width) / 2;
        const scaledoffsety = (scaledheight - canvas.height) / 2;
        setScaleoffset({ x: scaledoffsetx, y: scaledoffsety })



        ctx.save()


        ctx.translate(panOffset.x * scale - scaledoffsetx, panOffset.y * scale - scaledoffsety)
        ctx.scale(scale, scale)

        //  ctx.translate(-scaleoffset.x,-scaleoffset.y)     

        Draw(elements, ctx, rc, scale)
        ctx.restore();

    }, [elements, panOffset, scale])

    const getMouseCoordinates = (event: MouseEvent | React.MouseEvent<HTMLCanvasElement>) => {
        const clientx = (event.clientX - panOffset.x * scale + scaleoffset.x) / scale;
        const clienty = (event.clientY - panOffset.y * scale + scaleoffset.y) / scale;
        return { clientx, clienty };
    };


    const mousedown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        setDrawing(true);
        if (tool == tools.pan) {
            setAction("panning")
            setCursorStyle("grabbing")
            const { clientx, clienty } = getMouseCoordinates(e)
            setStartingPanoffset({ x: clientx, y: clienty })
            return

        }
        if (tool == tools.select || tool == tools.text) return


        setAction("draw")
        setCursorStyle("default")
        const { clientx, clienty } = getMouseCoordinates(e)
        const element = createElement(clientx, clienty, clientx, clienty, tool);
        if (!element) return
        setElements(prevState => [...prevState, element])
        setAction("draw")


    }

    const mousemove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!drawing) return
        if (tool == tools.text || tool == tools.select) return
        if (action == "text") return

        const { clientx, clienty } = getMouseCoordinates(e)
        if (tool == tools.pan) {
            if (action != "panning") return
            const { clientx, clienty } = getMouseCoordinates(e)
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

        }
        const elementscopy = updateelements(elements, clientx, clienty, tool)
        if (!elementscopy) return
        setElements(elementscopy);
        console.log(elements)

    }


    const mouseup = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (tool == tools.text) return

        setDrawing(false);
        if (tool == tools.pan) {

            setAction("none")
            setCursorStyle("grab")
            return
        }
        if (tool != tools.pencil) {
            setTool(tools.select)

        }

        setCursorStyle("default")

    }

    const blurhandler = () => {
        if (tool != tools.text) return
        const text = textarea.current?.value;

        const updated = updateelements(elements, 0, 0, tools.text, text)
        if (!updated) return
        setElements(updated)
        setAction("draw")
        setTool(tools.select)
    }

    const onClick = (e: React.MouseEvent<HTMLCanvasElement>) => {

        if (action == "text") return
        if (tool != tools.text) return

        setAction("text")
        const { clientx, clienty } = getMouseCoordinates(e)
        console.log(clientx, clienty);
        const element = createElement(clientx, clienty, clientx, clienty, tools.text)
        if (!element) return
        setElements(prevState => [...prevState, element])
    }

    const plusclick = () => {
        setScale(prevstate => Math.min(prevstate + 0.1, 10))
    }

    const minusclick = () => {

        setScale(prevstate => Math.max(prevstate - 0.1, 0.1))
    }


    const onundo = () => {
        if (undo && elements.length >= history.length) {
            const copy = [...elements]
            setHistory([...copy]);
        }

        if (!undo) {
            setUndo(true);
            const copy = [...elements]
            setHistory([...copy]);
        }

        const copy = [...elements]
        copy.pop()
        setElements([...copy]);
    }

    const onredo = () => {

        if (elements.length >= history.length) {
            console.log(elements.length)
            console.log(history.length)
            setHistory([])
            setUndo(false)
            return
        }

        const index = elements.length - 1
        if (elements[index] != history[index]) {
            setHistory([])
            setUndo(false)
            return;
        }
        setElements(prevState => [...prevState, history[index + 1]])
    }

    return (<div>
        <div className='z-3 fixed w-full flex justify-center  '>
            <div className='border-2 mt-2 bg-slate-200 border-stone-600 rounded-lg p-2 flex '>
            <input className="hidden peer/select" type="radio" id='Select' checked={tool == tools.select} value={tools.select} onChange={(e) => {
                setTool(tools.select) 
                setCursorStyle("default")}} />
            <label className='p-2 mx-2 hover:cursor-pointer hover:bg-slate-300  peer-checked/select:text-stone-100  peer-checked/select:bg-slate-500 rounded-lg' htmlFor='Select'><MousePointer/></label>

            <input className="hidden peer/pan" type="radio" id='pan' checked={tool == tools.pan} value={tools.pan} onChange={e => setTool(tools.pan)} onClick={() => setCursorStyle("grab")} />
            <label className='p-2 mx-2 hover:cursor-pointer hover:bg-slate-300  peer-checked/pan:text-stone-100  peer-checked/pan:bg-slate-500 rounded-lg' htmlFor='pan'><Hand/></label>

            <input className="hidden peer/line" type="radio" id='line' checked={tool == tools.line} value={tools.line} onChange={(e) => {
                setTool(tools.line) 
                setCursorStyle("default")}} />
            <label className='p-2 mx-2 hover:cursor-pointer hover:bg-slate-300  peer-checked/line:text-stone-100  peer-checked/line:bg-slate-500 rounded-lg' htmlFor='line'><Slash/></label>

            <input className="hidden peer/rect" type="radio" id='rectangle' checked={tool == tools.rectangle} value={tools.rectangle}  onChange={(e) => {
                setTool(tools.rectangle) 
                setCursorStyle("default")}} />
            <label className='p-2 mx-2 hover:cursor-pointer hover:bg-slate-300  peer-checked/rect:text-stone-100  peer-checked/rect:bg-slate-500 rounded-lg' htmlFor='rectangle'><RectangleHorizontal/></label>

            <input className="hidden peer/circle" type="radio" id='circle' checked={tool == tools.circle} value={tools.circle}  onChange={(e) => {
                setTool(tools.circle) 
                setCursorStyle("default")}} />
            <label className='p-2 mx-2 hover:cursor-pointer hover:bg-slate-300  peer-checked/circle:text-stone-100  peer-checked/circle:bg-slate-500 rounded-lg' htmlFor='circle'><Circle/></label>

            <input className="hidden peer/pencil" type="radio" id='pencil' checked={tool == tools.pencil} value={tools.pencil}  onChange={(e) => {
                setTool(tools.pencil) 
                setCursorStyle("crosshair")}} />
            <label className='p-2 mx-2 hover:cursor-pointer hover:bg-slate-300  peer-checked/pencil:text-stone-100  peer-checked/pencil:bg-slate-500 rounded-lg' htmlFor='pencil'><Pencil/></label>

            <input className="hidden peer/text" type="radio" id='text' checked={tool == tools.text} value={tools.text}  onChange={(e) => {
                setTool(tools.text) 
                setCursorStyle("text")}} />
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

        {(action === "text") ? <textarea
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


export default Rough2;