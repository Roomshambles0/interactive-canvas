import { useEffect, useRef, useState } from 'react'

export const useDraw = (onDraw: ({ ctx, currentPoint, prevPoint }: Draw) => void) => {
const [mouseDown, setMouseDown] = useState(false)
const [rectstart, setRectStart] = useState<Point>()

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const prevPoint = useRef<null | Point>(null)


 

  const onMouseDown = (event:React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    setMouseDown(true)
         
    event.preventDefault();
    event.stopPropagation();
    const boundingRect = event.currentTarget.getBoundingClientRect();
    const startx = event.clientX - boundingRect.left;
    const starty = event.clientY - boundingRect.top;
    setRectStart({x:startx,y:starty})
  }

  const clear = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return 

    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }

  useEffect(() => {

    const handler = (e: MouseEvent) => {
      if (!mouseDown) return
      const currentPoint = computePointInCanvas(e) 
      if (!currentPoint && !rectstart) return 
      
      e.preventDefault();
      e.stopPropagation();
  
    if(currentPoint  && rectstart){
     const height = currentPoint?.y - rectstart.y
     const width = currentPoint?.x - rectstart.x
    
      const ctx = canvasRef.current?.getContext('2d')
      if (!ctx || !currentPoint) return

      onDraw({ ctx, currentPoint, prevPoint: prevPoint.current,rectstart,width,height})
      //  prevPoint.current = currentPoint
  
    } 

  }
    const computePointInCanvas = (e: MouseEvent) => {
      const canvas = canvasRef.current
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      console.log({x,y})
      return { x, y }
    }

    const mouseUpHandler = (e:MouseEvent) => {
           
      e.preventDefault();
      e.stopPropagation();
      setMouseDown(false)
      prevPoint.current = null
    }

    // Add event listeners
   
    canvasRef.current?.addEventListener('mousemove', handler)
    window.addEventListener('mouseup', mouseUpHandler)

    // Remove event listeners

    return () => {

      canvasRef.current?.removeEventListener('mousemove', handler)
      window.removeEventListener('mouseup', mouseUpHandler)
      
    }
  }, [onDraw])

  return { canvasRef, onMouseDown, clear }
}