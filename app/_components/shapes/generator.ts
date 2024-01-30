
import { RoughCanvas } from "roughjs/bin/canvas";
import { RoughGenerator } from "roughjs/bin/generator";
import { Circle } from "./circle";
import { Rectangle } from "./rectangle";
import { Line } from "./line";
import { Pencil } from "./pencil";
import { Text } from "./text";
import { Point } from "@/app/_components/types/point";
import { tool } from "../types/tools";
import { element } from "@/app/_components/types/element";



interface elementText{
    x:number;
    y:number;
    text:string;
}

export class Generator{
    circle: Circle;
    rectangle: Rectangle;
    line: Line;
    text: Text;
    pencil: Pencil;
    rc: RoughCanvas;

    constructor(gen:RoughGenerator,rc:RoughCanvas,ctx:CanvasRenderingContext2D){
      this.rc = rc;

      this.circle =new Circle(gen);
      this.rectangle = new Rectangle(gen);
      this.line = new Line(gen);

      this.pencil = new Pencil(ctx);
      this.text = new Text(ctx);
    }


    createElement(tool:tool,start?:Point,current?:Point,location?:Point){
          if(tool ==  "circle"){
            if(!start || !current) return
           const element =  this.circle.createElement(start,current);
           return element;
          }

          if(tool =="rectangle"){
            if(!start || !current) return
            const element =  this.rectangle.createElement(start,current);
            return element;
          }

          if(tool == "line"){
            if(!start || !current) return
            const element = this.line.createElement(start,current);
            return element;
          }

          if(tool ==  "pencil"){
            if(!start || !current) return
            const element = this.pencil.createElement(start,current);
            return element;
          }

          if(tool ==  "text"){
            if(!location) return
            const element = this.text.createElement(location);
            return element;
          }
          
    }

    updateElement(tool?:tool,start?:Point,current?:Point,elementText?:element,elementd?:element,text?:string){
      
      
        if(tool ==  "circle"){
            if(!start || !current) return
           const element =  this.circle.createElement(start,current);
           return element;
          }

          if(tool ==  "rectangle"){
            if(!start || !current) return
            const element =  this.rectangle.createElement(start,current);
            return element;
          }

          if(tool ==  "line"){
            if(!start || !current) return
            const element = this.line.createElement(start,current);
            return element;
          }

          if(tool ==  "pencil"){
            if(!elementd || !current) return
            const element = this.pencil.updateElement(elementd,current);
            return element;
          }

          if(tool ==  "text"){
            if(!location) return
           const element = this.text.updateElement(elementText,text);
            return element;
          }


      
    }


    drawElement(element:element,scale?:number){
        if(element.tool ==  "text"){
              if(!scale) return
            this.text.drawEle(element,scale)
            
    }else if(element.tool == "pencil"){
       this.pencil.drawEle(element)
     }else{
     this.rc.draw(element.drawable)
     } 

}

}