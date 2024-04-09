import { Buttons, PLACEHOLDER_TEXT } from "../constants.js";
import { DataModel } from "../data_model.js";
import { CodeUtil } from "../utils/code_util.js";
import { DataUtil } from "../utils/data_util.js";
import { DrawingUtil } from "../utils/drawing_util.js";
import { VectorUtil } from "../utils/vector_util.js";

export function CanvasController(mColorMap) {
    const TEXT = 'text';
    const LASSO = 'lasso';
    const PANNING = 'panning';
    const ZOOMING = 'zooming';
    const DRAGGING = 'dragging';

    const SELECTION_BUBBLE_COLOR = "#55555555";

    let mCanvas = d3.select('#canvas-view-container').select('.canvas-container').append('canvas')
        .classed('view-canvas', true);
    let mInterfaceCanvas = d3.select("#canvas-view-container").select('.canvas-container').append('canvas')
        .classed('interface-canvas', true);
    let mInteractionCanvas = d3.select("#canvas-view-container").select('.canvas-container').append('canvas')
        .style("opacity", 0)
        .classed('interaction-canvas', true);

    let mDrawingUtil = new DrawingUtil(
        mCanvas.node().getContext("2d"),
        mInteractionCanvas.node().getContext("2d"),
        mInterfaceCanvas.node().getContext("2d"),
    );

    let mCodeUtil = new CodeUtil();

    let mSelectionCallback = () => { };
    let mNewTextCallback = () => { };
    let mTranslateCallback = () => { };

    let mZoomTransform = d3.zoomIdentity.translate(200, 200);
    let mBrushActivePosition = false;

    let mSelection = [];
    let mHighlightIds = []

    let mModel = new DataModel();
    let mInteraction = null;

    function onModelUpdate(model) {
        mModel = model;
        mSelection = mSelection.filter(id => mModel.getItem(id));
        onSelection(mSelection);
        draw();
    }

    function onSelection(selectedIds) {
        mSelection = selectedIds;
        draw();
    }

    function onPointerDown(screenCoords, systemState) {
        if (outOfBounds(screenCoords, mInteractionCanvas.node().getBoundingClientRect())) return;
        let target = mCodeUtil.getTarget(screenCoords, mInteractionCanvas);

        if (systemState.getToolState() == Buttons.PANNING_BUTTON ||
            (!target && !systemState.isShift() && !systemState.isCtrl() && systemState.getToolState() == Buttons.CURSOR_BUTTON)) {
            mInteraction = {
                type: PANNING,
                x: mZoomTransform.x,
                y: mZoomTransform.y,
                scale: mZoomTransform.k,
                start: screenCoords,
            };
        } else if (systemState.getToolState() == Buttons.ZOOM_BUTTON) {
            let zoomCenter = screenToModelCoords(screenCoords);
            mInteraction = {
                type: ZOOMING,
                pointerX: zoomCenter.x,
                pointerY: zoomCenter.y,
                transformX: mZoomTransform.x,
                transformY: mZoomTransform.y,
                scale: mZoomTransform.k,
                start: screenCoords,
            };
        } else if ((target && systemState.getToolState() == Buttons.TEXT_BUTTON) ||
            systemState.getToolState() == Buttons.SELECTION_BUTTON ||
            systemState.getToolState() == Buttons.CURSOR_BUTTON ||
            ((systemState.isShift() || systemState.isCtrl()))) {
            if (target) {
                if (systemState.isShift()) {
                    mSelection.push(target.id);
                    mSelection = DataUtil.unique(mSelection);
                    mSelectionCallback(mSelection);
                } else if (systemState.isCtrl()) {
                    if (mSelection.includes(target.id)) {
                        mSelection.splice(mSelection.indexOf(target.id), 1);
                        mSelectionCallback(mSelection);
                    }
                } else if (!mSelection.includes(target.id)) {
                    mSelection = [target.id];
                    mSelectionCallback(mSelection);
                }
                mInteraction = {
                    type: DRAGGING,
                    start: screenCoords,
                    startTarget: target,
                    translation: { x: 0, y: 0 }
                };
            } else {
                // we didn't mouse down on anything start a lasso. 
                // Cursor panning is handled above
                mInteraction = {
                    type: LASSO,
                    line: [screenToModelCoords(screenCoords)]
                };
            }
            return true;
        } else if (systemState.getToolState() == Buttons.TEXT_BUTTON && !systemState.isShift() && !systemState.isCtrl()) {
            mInteraction = { type: TEXT };
        } else {
            console.error('State not handled', systemState.getToolState())
        }

        draw();
    }

    function onDblClick(screenCoords, systemState) {

    }

    function onPointerMove(screenCoords, systemState) {
        if (mInteraction && mInteraction.type == PANNING) {
            let mouseDist = VectorUtil.subtract(screenCoords, mInteraction.start);
            let translate = VectorUtil.add(mInteraction, mouseDist);
            mZoomTransform = d3.zoomIdentity.translate(translate.x, translate.y).scale(mInteraction.scale);
        } else if (mInteraction && mInteraction.type == ZOOMING) {
            let mouseDist = screenCoords.y - mInteraction.start.y;
            let scale = mInteraction.scale * (1 + (mouseDist / mInterfaceCanvas.attr('height')));
            let zoomChange = scale - mInteraction.scale;
            let transformX = -(mInteraction.pointerX * zoomChange) + mInteraction.transformX;
            let transformY = -(mInteraction.pointerY * zoomChange) + mInteraction.transformY;
            mZoomTransform = d3.zoomIdentity.translate(transformX, transformY).scale(scale);
        } else if (mInteraction && mInteraction.type == LASSO) {
            mInteraction.line.push(screenToModelCoords(screenCoords));
        } else if (mInteraction && mInteraction.type == DRAGGING) {
            mInteraction.translation = VectorUtil.subtract(screenToModelCoords(screenCoords), screenToModelCoords(mInteraction.start));
        } else if (mInteraction && mInteraction.type == TEXT) {
            // Nothing doing, it's fine.
        } else if (mInteraction) {
            console.error("Not Handled!", mInteraction);
        } else if (systemState.getToolState() == Buttons.TEXT_BUTTON) {
            mBrushActivePosition = [screenToModelCoords(screenCoords)];
        }

        let target = mCodeUtil.getTarget(screenCoords, mInteractionCanvas);
        if (!mInteraction || mInteraction.type != TEXT) {
            if (target) {
                mHighlightIds = [target.id]
            } else {
                mHighlightIds = [];
            }
        }

        if (mBrushActivePosition && systemState.getToolState() != Buttons.TEXT_BUTTON) {
            mBrushActivePosition = false;
        }

        draw();
    }

    function onPointerUp(screenCoords, systemState) {
        let interaction = mInteraction;
        mInteraction = null;

        if (interaction && interaction.type == TEXT) {
            let localCoords = screenToModelCoords(screenCoords);
            mNewTextCallback(localCoords);
        } else if (interaction && interaction.type == LASSO) {
            if (!systemState.isShift() && !systemState.isCtrl()) {
                mSelection = [];
            }
            mModel.getTexts().forEach(text => {
                let textWidth = mDrawingUtil.getTextWidth({ text: PLACEHOLDER_TEXT + "#", height: text.size, font: text.font });
                let boundingPath = boundingBoxToPath({ x: text.x, y: text.y, width: textWidth, height: text.size });
                let coveredPoints = boundingPath.reduce((count, p) => {
                    if (interfaceIsCovered(modelToScreenCoords(p))) { count++; }
                    return count;
                }, 0);
                if (coveredPoints / boundingPath.length > 0.7) {
                    if (systemState.isCtrl()) {
                        mSelection.splice(mSelection.indexOf(text.id), 1);
                    } else {
                        mSelection.push(text.id);
                    }
                }
            });
            mSelection = DataUtil.unique(mSelection);
            mSelectionCallback(mSelection);
        } else if (interaction && interaction.type == DRAGGING && !systemState.isShift() && !systemState.isCtrl()) {
            mTranslateCallback(mSelection, VectorUtil.subtract(screenToModelCoords(screenCoords), screenToModelCoords(interaction.start)));
        } else if (interaction && interaction.type == PANNING &&
            systemState.getToolState() == Buttons.CURSOR_BUTTON &&
            VectorUtil.dist(interaction.start, screenCoords) < 3) {
            mSelection = [];
            mSelectionCallback(mSelection);
        }

        draw();
    }

    function onWheel(screenCoords, delta, systemState) {
        let currZoom = mZoomTransform.k;
        let scale = currZoom * (1 - delta / 1000);
        let zoomChange = scale - mZoomTransform.k;
        let transformX = -(screenCoords.x * zoomChange) + mZoomTransform.x;
        let transformY = -(screenCoords.y * zoomChange) + mZoomTransform.y;
        mZoomTransform = d3.zoomIdentity.translate(transformX, transformY).scale(scale);
        draw();
    }

    function onResize(width, height) {
        d3.select("#canvas-view-container")
            .style('width', width + "px")
            .style('height', height + "px");
        mCanvas
            .attr('width', width)
            .attr('height', height);
        mInterfaceCanvas
            .attr('width', width)
            .attr('height', height);
        mInteractionCanvas
            .attr('width', width)
            .attr('height', height);
        draw();
    }

    function setColor(color) {
        draw();
    }

    function draw() {
        mDrawingUtil.reset(mZoomTransform);
        mDrawingUtil.drawRect({
            x: 0, y: 0,
            width: mModel.getConfig().cardWidth,
            height: mModel.getConfig().cardHeight,
            shadow: true,
            outline: 'black',
            color: "#FFFFFF",
        })
        mModel.getImgs().forEach(img => {
            mDrawingUtil.drawImage(img);
        })
        mModel.getTexts().forEach((text, index) => {
            let x = text.x;
            let y = text.y;
            if (mInteraction && mInteraction.type == DRAGGING && mSelection.includes(text.id)) {
                x += mInteraction.translation.x;
                y += mInteraction.translation.y;
            }
            mDrawingUtil.drawText({
                x, y,
                font: text.font,
                size: text.size,
                height: text.size,
                color: mSelection.includes(text.id) ? "red" : "black",
                text: PLACEHOLDER_TEXT + index,
                code: mCodeUtil.getCode(text.id)
            });
        })

        if (mInteraction && mInteraction.type == LASSO) {
            mDrawingUtil.drawInterfaceSelectionBubble(mInteraction.line, SELECTION_BUBBLE_COLOR);
        }
    }

    function interfaceIsCovered(screenCoords) {
        let boundingBox = mInteractionCanvas.node().getBoundingClientRect();
        if (screenCoords.x < boundingBox.x || screenCoords.x > boundingBox.x + boundingBox.width) {
            return false;
        } else if (screenCoords.y < boundingBox.y || screenCoords.y > boundingBox.y + boundingBox.height) {
            return false;
        }

        let ctx = mInterfaceCanvas.node().getContext('2d');
        let p = ctx.getImageData(screenCoords.x - boundingBox.x, screenCoords.y - boundingBox.y, 1, 1).data;
        let hex = DataUtil.rgbaToHex(p[0], p[1], p[2], p[3]);
        if (hex != "#00000000") return true;
        else return false;
    }

    function screenToModelCoords(screenCoords) {
        let boundingBox = mInterfaceCanvas.node().getBoundingClientRect();
        if (checkConvertionState(screenCoords, boundingBox, mZoomTransform)) {
            return {
                x: (screenCoords.x - boundingBox.x - mZoomTransform.x) / mZoomTransform.k,
                y: (screenCoords.y - boundingBox.y - mZoomTransform.y) / mZoomTransform.k
            };
        } else {
            return { x: 0, y: 0 };
        }
    }

    function modelToScreenCoords(modelCoords) {
        let boundingBox = mInterfaceCanvas.node().getBoundingClientRect();
        return {
            x: modelCoords.x * mZoomTransform.k + mZoomTransform.x + boundingBox.x,
            y: modelCoords.y * mZoomTransform.k + mZoomTransform.y + boundingBox.y
        };
    }

    function boundingBoxToPath(bb) {
        if (isNaN(bb.x) || isNaN(bb.y) || isNaN(bb.height) || isNaN(bb.width)) {
            console.error("Invalid bounding box", bb);
        }
        return [
            { x: bb.x, y: bb.y },
            { x: bb.x + bb.width, y: bb.y },
            { x: bb.x + bb.width, y: bb.y + bb.height },
            { x: bb.x, y: bb.y + bb.height },
        ]
    }

    function checkConvertionState(coords, boundingBox, zoomPan) {
        if (isNaN(parseInt(coords.x)) || isNaN(parseInt(coords.y))) {
            console.error('Bad conversion coords', coords);
            return false;
        }

        if (isNaN(parseInt(boundingBox.x)) || isNaN(parseInt(boundingBox.y))) {
            console.error('Bad canvas bounding box!', boundingBox);
            return false;
        }

        if (isNaN(parseInt(zoomPan.x)) || isNaN(parseInt(zoomPan.y))) {
            console.error('Bad transform state!', zoomPan);
            return false;
        }

        return true;
    }

    function outOfBounds(point, box) {
        if (point.x <= box.x ||
            point.x >= box.x + box.width ||
            point.y <= box.y ||
            point.y >= box.y + box.height) {
            return true;
        } else {
            return false;
        }
    }


    return {
        onModelUpdate,
        onPointerDown,
        onDblClick,
        onPointerMove,
        onPointerUp,
        onWheel,
        onResize,
        setColor,
        onSelection,
        setNewTextCallback: (func) => mNewTextCallback = func,
        setSelectionCallback: (func) => mSelectionCallback = func,
        setTranslateCallback: (func) => mTranslateCallback = func,
    }
}