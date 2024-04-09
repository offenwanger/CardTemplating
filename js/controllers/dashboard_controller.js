import { Buttons } from "../constants.js";
import { DataModel } from "../data_model.js";
import { FileHandler } from "../file_handler.js";
import { CanvasController } from "./canvas_controller.js";
import { MenuController } from "./menu_controller.js";
import { SettingsController } from "./settings_controller.js";
import { SystemState } from "./system_state_controller.js";

export function DashboardController() {
    let mCanvasController = new CanvasController();
    let mSettingsController = new SettingsController();

    let mMenuController = new MenuController();

    let mSystemState = new SystemState();
    let mSelection = [];

    let mModel = new DataModel();

    let mCanvasPercent = 0.5;
    let mWidth = 1;
    let mHeight = 1;

    activateStateButtons();

    let mDeleteCallback = () => { };
    let mUndoCallback = () => { };
    let mRedoCallback = () => { };
    let mLoadModelCallback = async () => { };

    function modelUpdate(model) {
        mModel = model;
        // interface
        // main controllers
        mCanvasController.onModelUpdate(model);
        mSettingsController.onModelUpdate(model);
        mSelection = mSelection.filter(id => model.getItem(id));
    }

    function onResize(width, height) {
        mMenuController.onResize(width, height);
        mCanvasController.onResize(mCanvasPercent * width, height);
        mSettingsController.onResize((1 - mCanvasPercent) * width, height);

        mWidth = width;
        mHeight = height;
    }

    function onPointerDown(screenCoords) {
        mMenuController.hideColorPicker();
        if (screenCoords.x < mWidth * mCanvasPercent) {
            mCanvasController.onPointerDown(screenCoords, mSystemState);
        } else {
            mSettingsController.onPointerDown(screenCoords, mSystemState)
        }
    }

    function onDblClick(screenCoords) {
        if (screenCoords.x < mWidth * mCanvasPercent) {
            mCanvasController.onDblClick(screenCoords, mSystemState);
        } else {
            // The table is active and will handle it's own mouse events. I hope.
        }
    }

    function onPointerMove(screenCoords) {
        mCanvasController.onPointerMove(screenCoords, mSystemState);
    }

    function onPointerUp(screenCoords) {
        mCanvasController.onPointerUp(screenCoords, mSystemState);
    }

    function onWheel(screenCoords, delta) {
        if (screenCoords.x < mWidth * mCanvasPercent) {
            mCanvasController.onWheel(screenCoords, delta, mSystemState);
        } else {
            // table will handle it's own wheeling, let the event propogate
        }
    }

    function onLongPress(screenCoords) {

    }

    function onKeyStateChange(keysDown) {
        mSystemState.setKeys(keysDown);
        activateStateButtons();
    }

    function onUndo() {
        // if next undo is a selection, do that, otherwise pass it along
        // return the undo promise
        return mUndoCallback();
    }

    function onRedo() {
        // if next redo is a selection, do that, otherwise pass it along
        // return the redo promise
        return mRedoCallback();
    }


    function onEnter() {

    }

    function onDelete() {
        mDeleteCallback(mSelection)
    }

    mCanvasController.setSelectionCallback(onSelection)
    mSettingsController.setSelectionCallback(onSelection)
    function onSelection(selectedIds) {
        mSelection = selectedIds;
        mCanvasController.onSelection(selectedIds);
        mSettingsController.onSelection(selectedIds);
    }

    mMenuController.setColorChangeCallback((color) => {

    });

    mMenuController.setColorPickedCallback((color) => {

    });

    mMenuController.setOnClickCallback(async (button) => {
        if (button == Buttons.TEXT_BUTTON ||
            button == Buttons.SELECTION_BUTTON ||
            button == Buttons.CURSOR_BUTTON ||
            button == Buttons.PANNING_BUTTON ||
            button == Buttons.ZOOM_BUTTON) {
            mSystemState.setDefaultToolState(button)
        } else if (button == Buttons.DOWNLOAD) {
            FileHandler.downloadJSON(mModel.toObject());
        } else if (button == Buttons.UPLOAD) {
            await mLoadModelCallback();
        }
        activateStateButtons();
    })

    function activateStateButtons() {
        mMenuController.deactivateAll()
        mMenuController.activateButton(mSystemState.getToolState());
    }

    return {
        modelUpdate,
        onResize,
        onPointerDown,
        onPointerMove,
        onPointerUp,
        onWheel,
        onDblClick,
        onLongPress,
        onKeyStateChange,
        onUndo,
        onRedo,
        onEnter,
        onDelete,
        setUndoCallback: (func) => mUndoCallback = func,
        setRedoCallback: (func) => mRedoCallback = func,
        setUpdateColorCallback: (func) => mUpdateColorCallback = func,
        setLoadModelCallback: (func) => mLoadModelCallback = func,
        setNewTextCallback: (func) => mCanvasController.setNewTextCallback(func),
        setTableEditedCallback: (func) => mSettingsController.setTableEditedCallback(func),
        setTranslateCallback: (func) => mCanvasController.setTranslateCallback(func),
        setDeleteCallback: (func) => mDeleteCallback = func,
    }
}