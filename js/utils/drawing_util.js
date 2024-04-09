export function DrawingUtil(context, interactionContext, interfaceContext) {
    let ctx = context;
    let intCtx = interactionContext;
    let intfCtx = interfaceContext;

    let mMeasureCanvas = document.createElement('canvas');
    let measureContext = mMeasureCanvas.getContext('2d');

    let mScale = 1;
    let mXTranslate = 0;
    let mYTranslate = 0;

    function reset(zoomTransform) {
        ctx.reset();
        ctx.translate(zoomTransform.x, zoomTransform.y)
        ctx.scale(zoomTransform.k, zoomTransform.k)

        intCtx.reset();
        intCtx.translate(zoomTransform.x, zoomTransform.y)
        intCtx.scale(zoomTransform.k, zoomTransform.k)
        intCtx.imageSmoothingEnabled = false;

        intfCtx.reset();
        intfCtx.translate(zoomTransform.x, zoomTransform.y)
        intfCtx.scale(zoomTransform.k, zoomTransform.k)

        mXTranslate = zoomTransform.x;
        mYTranslate = zoomTransform.y;
        mScale = zoomTransform.k;
    }

    function highlightBoundingBox(box) {
        intfCtx.save();
        intfCtx.lineWidth = 2 / mScale;
        intfCtx.setLineDash([5 / mScale, 10 / mScale]);
        intfCtx.strokeStyle = "grey";
        intfCtx.beginPath();
        intfCtx.rect(box.x, box.y, box.width, box.height);
        intfCtx.stroke();
        intfCtx.restore();
    }

    function drawInterfaceSelectionBubble(path, color) {
        intfCtx.save();
        intfCtx.setLineDash([5 / mScale, 10 / mScale]);
        intfCtx.lineWidth = 2 / mScale;
        intfCtx.globalCompositeOperation = "destination-over"
        intfCtx.fillStyle = color;
        intfCtx.beginPath();
        path.forEach(p => {
            intfCtx.lineTo(p.x, p.y)
        });
        intfCtx.lineTo(path[0].x, path[0].y)
        intfCtx.stroke();
        intfCtx.fill();
        intfCtx.restore();
    }

    function drawRect({ x, y, height, width, color, shadow = false, code = null, outline = null }) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(x, y, width, height);

        if (outline) {
            ctx.strokeStyle = outline;
            ctx.stroke()
        }

        if (shadow) {
            ctx.shadowColor = "black";
            ctx.shadowOffsetX = 1;
            ctx.shadowOffsetY = 1;
            ctx.shadowBlur = 3;
        }
        ctx.fillStyle = color;
        ctx.fill();
        ctx.restore();

        if (code) {
            intCtx.save();
            intCtx.fillStyle = code;
            intCtx.beginPath();
            intCtx.rect(x, y, width, height);
            intCtx.fill();
            intCtx.restore();
        }
    }

    function drawText({ x, y, size, font, text, color = "black", code = null }) {
        ctx.save();
        ctx.fillStyle = 'black';
        ctx.textBaseline = 'top';
        ctx.textAlign = 'left'
        ctx.fillStyle = color
        ctx.font = Math.round(size) + "px " + font;
        ctx.fillText(text, x, y);
        ctx.restore();

        if (code) {
            intCtx.save();
            intCtx.fillStyle = code;
            intCtx.beginPath();
            intCtx.rect(x, y, getTextWidth({ size, font, text }), size);
            intCtx.fill();
            intCtx.restore();
        }
    }

    function getTextWidth({ size, font, text }) {
        measureContext.font = Math.round(size) + "px " + font;;
        return measureContext.measureText(text).width;
    };

    function measureStringNode(text, height) {
        ctx.save();
        ctx.font = Math.round(height * TEXT_SHRINK) + TEXT_FONT_STRING;
        let width = ctx.measureText(text).width + TEXT_HORIZONTAL_PADDING * 2;
        ctx.restore();
        return width;
    }

    function drawImage({ x, y, height, width, shadow = false, url }) {
        if (!ImageHelper[url]) { console.error("Image not preloaded"); return; }
        ctx.save();
        try {

            if (shadow) {
                ctx.shadowColor = "black";
                ctx.shadowOffsetX = 1;
                ctx.shadowOffsetY = 1;
                ctx.shadowBlur = 3;
            }
            ctx.drawImage(ImageHelper[url], x, y, width, height);

        } catch (e) {
            console.error("Failed to draw " + url);
        }
        ctx.restore();
    }

    return {
        reset,
        highlightBoundingBox,
        drawInterfaceSelectionBubble,
        drawRect,
        measureStringNode,
        drawText,
        getTextWidth,
        drawImage,
    }
}