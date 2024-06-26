import { Buttons } from "../constants.js";

export function SystemState() {
    let mStateArray = [
        [Buttons.TEXT_BUTTON, "d"],
        [Buttons.SELECTION_BUTTON, "s"],
        [Buttons.PANNING_BUTTON, "a"],
        [Buttons.ZOOM_BUTTON, "a", "s"],
        [Buttons.CURSOR_BUTTON, "x"],
    ]

    let mKeys = [];
    let mDefaultState = Buttons.TEXT_BUTTON;
    let mStructureViewActive = false;
    let mOverrideState = null;

    function setDefaultToolState(state) {
        mDefaultState = state;
    }

    function isDefaultToolState() {
        return getToolState() == mDefaultState;
    }

    function setKeys(keys) {
        mKeys = [...keys];
    }

    function getToolState() {
        if (mOverrideState) return mOverrideState;

        let keys = [...mKeys];
        let validStates = mStateArray;
        let checkIndex = 1;
        let found = false;
        while (keys.length > 0) {
            if (validStates.filter(i => i[checkIndex] == keys[0]).length > 0) {
                found = true;
                validStates = validStates.filter(i => i[checkIndex] == keys[0]);
                checkIndex++
            }
            keys.shift();
        }
        if (found) {
            return validStates.reduce(function (p, c) { return p.length > c.length ? c : p; }, { length: Infinity })[0];
        } else {
            return mDefaultState;
        }
    }

    function setOverrideToolState(tool) {
        mOverrideState = tool;
    }

    function clearOverrideToolState() {
        mOverrideState = null;
    }

    function isShift() {
        return mKeys.includes('shift');
    }

    function isCtrl() {
        return mKeys.includes('control');
    }

    function toggleStructureViewActive() {
        mStructureViewActive = !mStructureViewActive;
    }

    function isStructureViewActive() {
        return mStructureViewActive;
    }

    return {
        setDefaultToolState,
        isDefaultToolState,
        setKeys,
        getToolState,
        setOverrideToolState,
        clearOverrideToolState,
        isShift,
        isCtrl,
        toggleStructureViewActive,
        isStructureViewActive,
    }
}