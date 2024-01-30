import { element } from "@/app/_components/types/element";
import { genratortype } from "@/app/_components/types/gen";

export const drawfunction = (elements:element[],genrator?:genratortype,scale?:number)=>{
 elements.map((element)=>{
    try{
      genrator?.drawElement(element,scale);
    }catch(e){
        console.log("draw function error")
    }
 })
}