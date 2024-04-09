import { DataModel } from "../data_model.js";
import { Data } from "../data_structs.js";
import { FileHandler } from "../file_handler.js";
import { DataUtil } from "../utils/data_util.js";
import { GenerationUtil } from "../utils/generation_util.js";
import { IdUtil } from "../utils/id_util.js";

export function SettingsController() {
    const DEFAULT_COL_WIDTH = 100;

    let mTableEditedCallback = () => { }
    let mSelectionCallback = () => { }

    let mPasting = false;

    let mModel = new DataModel();

    let mViewContainer = d3.select("#settings-view-container")
    let mCanvases = [];

    let mPrintButton = mViewContainer.append('button')
        .attr('id', 'generate-button')
        .html("Print")
        .on('click', async () => {
            await FileHandler.printCanvases(mCanvases)
        })

    let mSettingsContainer = mViewContainer.append("div")
        .attr("id", "settings-container");
    let mTablesContainer = mViewContainer.append("div")
        .attr("id", "table-container");
    let mCardsContainer = mViewContainer.append("div")
        .attr("id", 'display-container');

    let mTableDiv = mTablesContainer.append("div")
        .attr('id', 'data-table')
    let mJTable = jspreadsheet(mTableDiv.node(), {
        data: [],
        columns: [],
        meta: {},
        onchange,
        onbeforepaste,
        onpaste,
    });

    let mSelection = [];
    let mInvalidCells = {};


    function onModelUpdate(model) {
        mModel = model;
        let modelTable = model.getTable();
        let row1 = mJTable.getData()[0];

        let colCount = row1 ? row1.length : 0;
        let newColCount = modelTable.getColumns().length;
        for (let i = colCount; i < newColCount; i++) {
            mJTable.insertColumn();
            mJTable.setWidth(i, DEFAULT_COL_WIDTH)
        }
        for (let i = newColCount; i < colCount; i++) {
            mJTable.deleteColumn();
        }

        let data = modelTable.getDataArray().map(r => r.map(c => c.value));
        if (data.length == 0) data = [[""]]

        mJTable.setData(data);
        modelTable.getColumns().forEach((col, i) => { mJTable.setHeader(i, "Text" + i); });
        mJTable.setMeta(modelTable.getDataArray().reduce((obj, rowData, rowIndex) => {
            rowData.forEach((cellData, colIndex) => {
                let cellIndex = jspreadsheet.helpers.getColumnNameFromCoords(colIndex, rowIndex);
                obj[cellIndex] = cellData
            })
            return obj;
        }, {}));

        restyle();

        mCardsContainer.selectAll('*').remove();
        mCanvases = []
        let rows = DataUtil.unique(mModel.getDataCells().map(c => c.row));
        rows.forEach(row => {
            let card = GenerationUtil.getCard(mModel, row);
            mCanvases.push(card);
            mCardsContainer.node().appendChild(card);
        })

        mCardsContainer.selectAll('*')
            .style("margin", "10px")
            .style("box-shadow", "5px 5px 5px #444444")
    }

    function onchange(instance, cell, x, y, value) {
        if (!mPasting) {
            parseTables();
        }
    }

    function onbeforepaste(instance, data, x, y) {
        mPasting = true;
    }

    function onpaste(instance, data) {
        mPasting = false;
        parseTables();
    }

    function restyle() {
        let jTable = mJTable.getData();
        let cellIndexes = []
        for (let row = 0; row < jTable.length; row++) {
            for (let col = 0; col < jTable[0].length; col++) {
                cellIndexes.push(jspreadsheet.helpers.getColumnNameFromCoords(col, row))
            }
        }

        let styles = {}
        cellIndexes.forEach(cellIndex => {
            let meta = mJTable.getMeta(cellIndex);
            let style = '';
            style += 'color: black; ';
            if (meta && mSelection.includes(meta.id)) {
                style += 'background-color: ' + mColorMap(meta.id) + '; ';
            } else {
                style += 'background-color:white; ';
            }
            styles[cellIndex] = style;
        })
        mJTable.setStyle(styles)
    }

    function parseTables() {
        let data = mJTable.getData()
        let columns = mModel.getTable().getColumns();
        let table = [];
        data.forEach(row => {
            if (row.some(d => d)) {
                table.push(columns.map((c, i) => { return { col: c, text: row[i] } }))
            }
        })
        mTableEditedCallback(table);
    }

    function onResize(width, height) {
        mViewContainer.style("height", height + "px")
            .style("width", width + "px");
    }

    function onSelection(selection) {
        mSelection = [];
        mSelection.push(...selection.filter(id => IdUtil.isType(id, Data.Text)));
        mSelection = DataUtil.unique(mSelection);
        restyle();
    }

    return {
        onResize,
        onModelUpdate,
        onSelection,
        setTableEditedCallback: (func) => mTableEditedCallback = func,
        setSelectionCallback: (func) => mSelectionCallback = func,
    }
}