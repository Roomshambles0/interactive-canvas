


import { RoughGenerator } from "roughjs/bin/generator";

interface point{
    x:number;
    y:number;
}


export class Circle{
    
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
 
        const a = (this.StartPoint.x + this.CurrentPoint.x)
        const h = a / 2
        const b = (this.StartPoint.y + this.CurrentPoint.y)
        const k = b / 2;
        const diameter = Math.sqrt((this.StartPoint.x - this.CurrentPoint.x) ** 2 + (this.StartPoint.y  - this.CurrentPoint.y) ** 2);
        

        const drawable = this.gen.circle(h, k, diameter);
        const element = {x1:this.StartPoint.x,y1:this.StartPoint.y,x2:this.CurrentPoint.x,y2:this.CurrentPoint.y,drawable,tool:"circle"};
        return element;
    }

    updateElement(start?:point,current?:point){
      if(!start || !current) return
       const element = this.createElement(start,current);
       
       if(!element) return;

       return element;
    }

}