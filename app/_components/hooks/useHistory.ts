import { element } from "@/app/_components/types/element";
import { useState } from "react";
import { Drawable } from "roughjs/bin/core";



export const useHistory = ()=>{
    const [elements, setElements] = useState<element[]>([]);
    const [history, setHistory] = useState<element[]>([]);
    const [undo,setUndo] = useState(false)
  

    const onundo = ()=>{
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

    const onredo = ()=>{

    
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

    return{
        elements,
        setElements,
        onundo,
        onredo
    }
}