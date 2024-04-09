import { Data } from "../data_structs.js";
import { DrawingUtil } from "./drawing_util.js";
import { IdUtil } from "./id_util.js";

export const GenerationUtil = function () {

    function getCard(model, row) {
        let canvas = document.createElement('canvas');
        canvas.height = model.getConfig().cardHeight;
        canvas.width = model.getConfig().cardWidth;
        let ctx = canvas.getContext('2d');
        let drawingUtil = new DrawingUtil(ctx, ctx, ctx);
        let values = model.getDataCells().filter(c => c.row == row);
        drawingUtil.drawRect({
            x: 1, y: 1,
            height: model.getConfig().cardHeight - 2,
            width: model.getConfig().cardWidth - 2,
            color: '#FFFFFF',
            outline: 'black',
        })
        values.forEach(value => {
            if (IdUtil.getClass(value.col) == Data.Text) {
                let text = model.getText(value.col);
                drawingUtil.drawText({
                    x: text.x,
                    y: text.y,
                    size: text.size,
                    font: text.font,
                    color: 'black',
                    text: value.text
                });
            }
        })

        return canvas;
    }

    return {
        getCard
    }
}();