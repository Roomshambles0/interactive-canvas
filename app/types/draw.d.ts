type Draw = {
    ctx: CanvasRenderingContext2D
    currentPoint: Point
    prevPoint: Point | null
    rectstart: Point  | undefined
    width: number 
    height: number 
  }
  
  type Point = { x: number; y: number }