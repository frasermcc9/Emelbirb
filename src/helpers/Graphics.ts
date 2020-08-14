import { createCanvas } from "canvas";

export function expProgress(percentage: number): string {
    const canvas = createCanvas(425, 40);
    const ctx = canvas.getContext("2d");

    ctx.strokeStyle = "rgba(100,100,100,1)";
    ctx.lineWidth = 4;
    ctx.rect(0, 0, 425, 40);
    ctx.fillStyle = "rgba(255,255,255,1)";
    ctx.fillRect(1, 1, 420, 36);
    ctx.stroke();

    const progress = percentage * 420;
    ctx.fillStyle = "rgba(181,166,237,1)";
    ctx.fillRect(3, 3, progress - 3, 34);

    return canvas.toDataURL();
}
