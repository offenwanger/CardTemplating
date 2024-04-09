import { DashboardController } from "./controllers/dashboard_controller.js";
import { ModelController } from "./controllers/model_controller.js";
import { MemoryStash, VersionController } from "./controllers/version_controller.js";
import { DataModel } from "./data_model.js";
import { Data } from "./data_structs.js";
import { EventManager } from "./event_manager.js";
import { FileHandler } from "./file_handler.js";
import { IdUtil } from "./utils/id_util.js";

document.addEventListener('DOMContentLoaded', function (e) {
    let mModelController = new ModelController();
    let mDashboardController = new DashboardController();

    new EventManager(mDashboardController);

    let mVersionController = new VersionController();
    mVersionController.setStash(new MemoryStash()).then(() => {
        mVersionController.stack(mModelController.getModel().toObject());
    });

    mDashboardController.setUndoCallback(async () => {
        let obj = await mVersionController.reverse();
        if (obj) {
            mModelController.setModel(DataModel.fromObject(obj));
            mDashboardController.modelUpdate(mModelController.getModel());
        }
    })

    mDashboardController.setRedoCallback(async () => {
        let obj = await mVersionController.advance();
        if (obj) {
            mModelController.setModel(DataModel.fromObject(obj));
            mDashboardController.modelUpdate(mModelController.getModel());
        }
    })

    mDashboardController.setLoadModelCallback(async () => {
        try {
            let model = await FileHandler.getJSONModel();
            if (model) {
                mModelController.setModel(DataModel.fromObject(model));
                mVersionController.stack(mModelController.getModel().toObject());
                mDashboardController.modelUpdate(mModelController.getModel());
            }
        } catch (e) {
            console.error(e);
        }
    })

    mDashboardController.setNewTextCallback(coords => {
        let text = new Data.Text();
        text.x = coords.x;
        text.y = coords.y;
        mModelController.addText(text);

        mDashboardController.modelUpdate(mModelController.getModel());
        mVersionController.stack(mModelController.getModel().toObject());
    })

    mDashboardController.setTableEditedCallback(table => {
        mModelController.updateDataTable(table);
        mDashboardController.modelUpdate(mModelController.getModel());
        mVersionController.stack(mModelController.getModel().toObject());
    })

    mDashboardController.setTranslateCallback((selectionIds, translate) => {
        selectionIds.forEach(id => {
            mModelController.translate(id, translate);
        })
        mDashboardController.modelUpdate(mModelController.getModel());
        mVersionController.stack(mModelController.getModel().toObject());
    })

    mDashboardController.setDeleteCallback((selectionIds) => {
        selectionIds.forEach(id => {
            if (IdUtil.isType(id, Data.Text)) {
                mModelController.removeText(id);
            }
        })
        mDashboardController.modelUpdate(mModelController.getModel());
        mVersionController.stack(mModelController.getModel().toObject());
    })

    if (new URLSearchParams(window.location.search).has('viz')) {
        let loadViz = new URLSearchParams(window.location.search).get('viz');
        let url = "/" + loadViz + ".json";
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'json';
        xhr.onload = function () {
            var status = xhr.status;
            if (status === 200) {
                try {
                    let model = xhr.response;
                    if (model) {
                        mModelController.setModel(DataModel.fromObject(model));
                        mVersionController.stack(mModelController.getModel().toObject());
                        mDashboardController.modelUpdate(mModelController.getModel());
                    }
                } catch (e) {
                    console.error(e);
                }
            } else {
                console.error("Failed to get model", xhr.response);
            }
        };
        xhr.send();
    }
});