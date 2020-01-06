// function plot(x, y, c) {
//     // plot the pixel at (x, y) with brightness c (where 0 ≤ c ≤ 1)
// }

// integer part of x
function ipart(x) {
    return Math.floor(x);
}

function round(x) {
    return ipart(x + 0.5);
}

// fractional part of x
function fpart(x) {
    return x - Math.floor(x);
}

function rfpart(x) {
    return 1 - fpart(x);
}

export default function drawLine(x0,y0,x1,y1,plot) {
    let steep = Math.abs(y1 - y0) > Math.abs(x1 - x0);

    let temp;
    if (steep) {
        temp = x0;
        x0 = y0;
        y0 = temp;

        temp = x1;
        x1 = y1;
        y1 = temp;
    }
    if (x0 > x1) {
        temp = x0;
        x0 = x1;
        x1 = temp;

        temp = y1;
        y1 = y0;
        y0 = temp;
    }

    const dx = x1 - x0;
    const dy = y1 - y0;
    let gradient = dy / dx;
    if (dx === 0.0) {
        gradient = 1.0;
    }

    // handle first endpoint
    let xend = round(x0);
    let yend = y0 + gradient * (xend - x0);
    let xgap = rfpart(x0 + 0.5);
    const xpxl1 = xend; // th{ will be used in the main loop
    const ypxl1 = ipart(yend);
    if (steep) {
        plot(ypxl1,   xpxl1, rfpart(yend) * xgap);
        plot(ypxl1+1, xpxl1,  fpart(yend) * xgap);
    } else {
        plot(xpxl1, ypxl1  , rfpart(yend) * xgap);
        plot(xpxl1, ypxl1+1,  fpart(yend) * xgap);
    }
    let intery = yend + gradient; // first y-intersection for the main loop

    // handle second endpoint
    xend = round(x1);
    yend = y1 + gradient * (xend - x1);
    xgap = fpart(x1 + 0.5);
    const xpxl2 = xend; //th{ will be used in the main loop
    const ypxl2 = ipart(yend);
    if (steep) {
        plot(ypxl2  , xpxl2, rfpart(yend) * xgap);
        plot(ypxl2+1, xpxl2,  fpart(yend) * xgap);
    } else {
        plot(xpxl2, ypxl2,  rfpart(yend) * xgap);
        plot(xpxl2, ypxl2+1, fpart(yend) * xgap);
    }

    // main loop
    if (steep) {
        for (let x = xpxl1 + 1; x <= xpxl2 - 1; x += 1) {
            plot(ipart(intery)  , x, rfpart(intery));
            plot(ipart(intery)+1, x,  fpart(intery));
            intery = intery + gradient;
        }
    } else {
        for (let x = xpxl1 + 1; x <= xpxl2 - 1; x += 1) {
            plot(x, ipart(intery),  rfpart(intery));
            plot(x, ipart(intery)+1, fpart(intery));
            intery = intery + gradient;
        }
    }
}
