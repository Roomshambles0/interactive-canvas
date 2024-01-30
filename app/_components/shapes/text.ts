


import { element } from "@/app/_components/types/element";
import { tool } from "../types/tools";

interface point{
    x:number;
    y:number;
}


interface elementText{
    x:number;
    y:number;
    text:string;
    tool:tool
}

export class Text{
    
    ctx:CanvasRenderingContext2D;

    constructor(ctx:CanvasRenderingContext2D){
      this.ctx = ctx;  
    }

    createElement(location:point){
        if(!location) return 
        console.log("location")
        const element = {x1:location.x,y1:location.y,text:"",tool:"text"};

        return element;
    }

    updateElement(element?:element,text?:string){
        if(!element || !text) return;
        
        element.text = text;
        return element;
    }

    drawEle(element:element,scale:number){
       if(!element) return
       this.ctx.textBaseline = "top";
       this.ctx.font = `${24 + scale}px sans-serif`
       

       this.ctx.fillText(element.text as string, element.x1, element.y1);
      
    }
}