import { Point } from "@/app/_components/types/point";

export const getMouseCoordinates = (event: MouseEvent | React.MouseEvent<HTMLCanvasElement>,panOffset:Point,scale:number,scaleoffset:Point) => {
    const clientx = (event.clientX - panOffset.x * scale + scaleoffset.x) / scale;
    const clienty = (event.clientY - panOffset.y * scale + scaleoffset.y) / scale;
    return { clientx, clienty };
};

