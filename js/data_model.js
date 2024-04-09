import { Data } from "./data_structs.js";
import { IdUtil } from "./utils/id_util.js";

export function DataModel() {
    let mConfig = new Data.Config();
    let mDataCells = [];
    let mTexts = [];
    let mImgs = [];

    function getTexts() {
        return mTexts;
    }

    function setTexts(texts) {
        mTexts = texts;
    }

    function getText(id) {
        return getTexts().find(o => o.id == id);
    }

    function getDataCells() {
        return mDataCells;
    }

    function setDataCells(datacells) {
        mDataCells = datacells;
    }

    function getDataCell(row, col) {
        return getDataCells().find(o => o.row == row && o.col == col);
    }

    function getImgs() {
        return mImgs;
    }

    function setImgs(imgs) {
        mImgs = imgs
    }

    function getImg(id) {
        return getImgs().find(o => o.id == id);
    }

    function getConfig() {
        return mConfig;
    }

    function setConfig(config) {
        mConfig = config;
    }

    function getTable() {
        let table = new DataTable();
        mTexts.forEach(text => {
            table.addColumn(text.id);
        })
        mDataCells.forEach(cell => {
            table.setCell(cell.col, cell.row, cell.text, cell.id);
        })
        return table;
    }

    function getItem(id) {
        return [
            mConfig,
            ...mDataCells,
            ...mTexts,
            ...mImgs,
        ].find(i => i.id == id);
    }

    function toObject() {
        return {
            texts: DataModel.cloneItem(mTexts),
            imgs: DataModel.cloneItem(mImgs),
            config: DataModel.cloneItem(mConfig),
            dataCells: DataModel.cloneItem(mDataCells),
        }
    }

    function clone() {
        let dataModel = new DataModel();
        dataModel.setTexts(DataModel.cloneItem(mTexts));
        dataModel.setImgs(DataModel.cloneItem(mImgs));
        dataModel.setConfig(DataModel.cloneItem(mConfig));
        dataModel.setDataCells(DataModel.cloneItem(mDataCells));
        return dataModel;
    }

    this.getTexts = getTexts;
    this.setTexts = setTexts;
    this.getText = getText;
    this.getDataCells = getDataCells;
    this.setDataCells = setDataCells;
    this.getDataCell = getDataCell;
    this.getImgs = getImgs;
    this.setImgs = setImgs;
    this.getImg = getImg;
    this.getConfig = getConfig;
    this.setConfig = setConfig;
    this.getTable = getTable;
    this.getItem = getItem;
    this.toObject = toObject;
    this.clone = clone;
}

DataModel.fromObject = function (item) {
    let dataModel = new DataModel();
    dataModel.setTexts(DataModel.cloneItem(item.texts));
    dataModel.setImgs(DataModel.cloneItem(item.imgs));
    dataModel.setConfig(DataModel.cloneItem(item.config));
    dataModel.setDataCells(DataModel.cloneItem(item.dataCells));
    return dataModel;
}

DataModel.cloneItem = function (item, newIds = false) {
    if (Array.isArray(item)) {
        return item.map(o => DataModel.cloneItem(o));
    } else if (typeof item == 'string' || typeof item == 'number' || typeof item == 'boolean') {
        return item;
    } else if (item.id) {
        let ObjClass = IdUtil.getClass(item.id);
        if (!ObjClass) { console.error("Invalid data item!", item); return null; }

        let dataItem = new ObjClass();
        Object.keys(dataItem).forEach(key => {
            if (newIds && key == 'id') return;
            if (item[key] != undefined && item[key] != null) {
                dataItem[key] = DataModel.cloneItem(item[key])
            }
        });
        return dataItem;
    } else {
        console.error("Invalid data item!", item);
    }
}

export function DataTable() {
    let mCols = []
    let mRows = []

    function addColumn(id) {
        if (mCols.find(c => c == id)) return;
        mCols.push(id);
    }

    function setCell(col, row, value, id = null) {
        let colIndex = mCols.findIndex(c => c == col)
        if (colIndex == -1) { console.error("Invalid column id, cell not added", col); return; }
        for (let i = mRows.length; i <= row; i++) {
            mRows[i] = [];
        };

        let cell = mRows[row].find(c => c == col);
        if (!cell) {
            cell = { col, row };
            mRows[row].push(cell);
        }
        cell.value = value;
        if (id) cell.id = id;
    }

    function clearCells() {
        mRows = [];
    }

    function getColumns() {
        return [...mCols]
    }

    function getDataArray() {
        return mRows.map(row => mCols.map(col => {
            let cell = row.find(cell => cell.col == col)
            if (!cell) cell = { id: "", value: "" };
            return {
                id: cell.id,
                value: cell.value
            }
        }));
    }

    function getColumnData(columnId) {
        return mRows.map(row => row.find(c => c.colId == columnId));
    }

    this.getColumns = getColumns;
    this.addColumn = addColumn;
    this.setCell = setCell;
    this.clearCells = clearCells;
    this.getDataArray = getDataArray;
    this.getColumnData = getColumnData;
}

