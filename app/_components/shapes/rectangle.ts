

import { RoughGenerator } from "roughjs/bin/generator";


interface point{
    x:number;
    y:number;
}


export class Rectangle {
    
    StartPoint:point;
    CurrentPoint:point;
    gen:RoughGenerator;
 

    constructor(gen:RoughGenerator){
      this.StartPoint = {x:0,y:0};
      this.CurrentPoint = {x:0,y:0};  
      this.gen = gen
   
    }

    createElement(start:point,current:point){
        if(!start || !current) return 

        this.StartPoint = start;
        this.CurrentPoint = current;
        const width = this.CurrentPoint.x - this.StartPoint.x;
        const height = this.CurrentPoint.y - this.StartPoint.y;

        const drawable = this.gen.rectangle(this.StartPoint.x,this.StartPoint.y,width,height)
 
        const element = {x1:this.StartPoint.x,y1:this.StartPoint.y,x2:this.CurrentPoint.x,y2:this.CurrentPoint.y,drawable,tool:"rectangle"};
        return element;
    }

    updateElement(start?:point,current?:point){
      if(!start || !current) return
       const element = this.createElement(start,current);
       
       if(!element) return;

       return element;
    }



}