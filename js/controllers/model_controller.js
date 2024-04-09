import { DataModel } from "../data_model.js";
import { Data } from "../data_structs.js";
import { IdUtil } from "../utils/id_util.js";

export function ModelController() {
    let mDataModel = new DataModel();

    function addText(text) {
        if (!IdUtil.isType(text.id, Data.Text)) { console.error("Invalid text", text); return; }
        mDataModel.getTexts().push(text);
    }

    function removeText(textId) {
        if (!IdUtil.isType(textId, Data.Text)) { console.error("Invalid text id", textId); return; }
        mDataModel.setTexts(mDataModel.getTexts().filter(d => d.id != textId));
    }

    function updateText(text) {
        if (!IdUtil.isType(text.id, Data.Text)) { console.error("Invalid text", text); return; }
        let currText = mDataModel.getText(text.id);
        if (!currText) { console.error("Text not found for id", text.id); return; }
        currText.update(text);
    }

    function addImg(img) {
        if (!IdUtil.isType(img.id, Data.Img)) { console.error("Invalid img", img); return; }
        mDataModel.getImgs().push(img);
    }

    function removeImg(imgId) {
        if (!IdUtil.isType(imgId, Data.Img)) { console.error("Invalid img id", imgId); return; }
        mDataModel.setImgs(mDataModel.getImgs().filter(g => g.id != imgId));
    }

    function updateImg(img) {
        if (!IdUtil.isType(img.id, Data.Img)) { console.error("Invalid img", img); return; }
        let currImg = mDataModel.getImg(img.id);
        if (!currImg) { console.error("Img not found for id", img.id); return; }
        currImg.update(img);
    }

    function updateDataTable(table) {
        let dataCells = mDataModel.getDataCells().filter(c => {
            return c.row < table.length;
        });

        for (let rowIndex in table) {
            for (let data of table[rowIndex]) {
                if (data.text) {
                    let cell = dataCells.find(c => c.row == rowIndex && c.col == data.col);
                    if (!cell) {
                        cell = new Data.DataCell();
                        cell.col = data.col;
                        cell.row = rowIndex;
                        dataCells.push(cell);
                    }
                    cell.text = data.text;
                } else {
                    dataCells = dataCells.filter(c => c.row != rowIndex || c.col != data.col);
                }
            }
        }
        mDataModel.setDataCells(dataCells);
    }

    function translate(itemId, translate) {
        let item = mDataModel.getText(itemId);
        if (!item) item = mDataModel.getImg(itemId);
        if (!item) { console.error("not valid id, ", itemId); return; }
        item.x += translate.x;
        item.y += translate.y;
    }

    function getModel() {
        return mDataModel.clone();
    }

    function setModel(model) {
        mDataModel = model.clone();
    }

    return {
        addText,
        removeText,
        updateText,
        addImg,
        removeImg,
        updateImg,
        updateDataTable,
        translate,
        getModel,
        setModel,
    }
}