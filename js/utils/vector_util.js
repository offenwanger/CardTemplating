export let VectorUtil = function () {
    function add(v1, v2) {
        if (!isCoord(v1)) { console.error("Bad vector", v1); return { x: 0, y: 0 }; }
        if (!isCoord(v2)) { console.error("Bad vector", v2); return { x: 0, y: 0 }; }
        return {
            x: v1.x + v2.x,
            y: v1.y + v2.y
        }
    }

    function subtract(v1, v2) {
        if (!isCoord(v1)) { console.error("Bad vector", v1); return { x: 0, y: 0 }; }
        if (!isCoord(v2)) { console.error("Bad vector", v2); return { x: 0, y: 0 }; }
        return {
            x: v1.x - v2.x,
            y: v1.y - v2.y
        }
    }

    function dist(v1, v2) {
        if (Array.isArray(v1) && Array.isArray(v2)) {
            return Math.hypot(...v1.map((v, i) => v - v2[i]));
        } else {
            return length(subtract(v1, v2));
        }
    }

    function length(v) {
        return Math.sqrt(v.x * v.x + v.y * v.y)
    }

    function isCoord(v) {
        return v && isNumeric(v.x) && isNumeric(v.y);
    }

    function isNumeric(str) {
        if (typeof str == "number") return true;
        if (typeof str != "string") return false;
        return !isNaN(str) && !isNaN(parseFloat(str));
    }

    return {
        add,
        subtract,
        dist,
    }
}();