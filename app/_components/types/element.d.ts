export interface element {
    x1: number;
    y1: number;
    x2?: number;
    y2?: number;
    drawable?: Drawable | undefined
    tool: tools
    points?: point
    text?: string
}