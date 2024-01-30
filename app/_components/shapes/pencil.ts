
import { getSvgPathFromStroke } from "../../utils/getsvgpath";
import getStroke from "perfect-freehand";
import { element } from "@/app/_components/types/element";


interface point{
    x:number;
    y:number;
}


interface pencilpoint{
    x: number;
    y: number;
    points: point[];
}

export class Pencil{
    
    ctx:CanvasRenderingContext2D;
    CurrentPoint:point;
    StartPoint:point;

    constructor(ctx:CanvasRenderingContext2D){
      this.ctx = ctx;
      this.StartPoint = {x:0,y:0};  
      this.CurrentPoint = {x:0,y:0};  
    }

    createElement(start:point,current:point){
        if( !current) return 
      
        this.StartPoint = start;
        this.CurrentPoint = current;

        const element = {x1:this.StartPoint.x,y1:this.StartPoint.y,x2:this.CurrentPoint.x,y2:this.CurrentPoint.y,points:[{x:this.CurrentPoint.x,y:this.CurrentPoint.y}],tool:"pencil"};

        return element;
    }

    updateElement(element?:element,current?:point){
      if(!element || !current) return;

      const newpoints = [...element.points,current];
      console.log(newpoints)

      element.points = newpoints;
       
      return element;
    }

    drawEle(element:element){
       if(!element) return
       if (!element.points) return
       const stroke = getSvgPathFromStroke(getStroke(element.points));
       this.ctx.fill(new Path2D(stroke));
    }
}