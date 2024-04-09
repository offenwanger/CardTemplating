export let DataUtil = function () {
    function numToColor(num) {
        return "#" + Math.round(num).toString(16).padStart(6, "0");
    }

    function rgbToHex(r, g, b) {
        return "#" +
            r.toString(16).padStart(2, "0") +
            g.toString(16).padStart(2, "0") +
            b.toString(16).padStart(2, "0");
    }

    function rgbaToHex(r, g, b, a) {
        return "#" +
            r.toString(16).padStart(2, "0") +
            g.toString(16).padStart(2, "0") +
            b.toString(16).padStart(2, "0") +
            a.toString(16).padStart(2, "0");
    }

    function hexToRGBA(hex) {
        if (hex.length != 7 && hex.length != 9) { console.error("invalid hex", hex); return { r: 0, g: 0, b: 0, a: 0 } };
        let r = parseInt(hex.slice(1, 3), 16);
        let g = parseInt(hex.slice(3, 5), 16);
        let b = parseInt(hex.slice(5, 7), 16);
        let a = hex.length == 9 ? parseInt(hex.slice(7, 9), 16) : parseInt("FF", 16);

        return { r, g, b, a };
    }

    function unique(arr) {
        if (arr.length == 0) return arr;
        if (arr[0].id) {
            return [...new Map(arr.map(item =>
                [item.id, item])).values()];
        } else {
            return [...new Map(arr.map(item =>
                [item, item])).values()];
        }
    }

    function limit(num, v1, v2) {
        let min, max;
        if (v1 < v2) { min = v1; max = v2 } else { min = v2; max = v1 };
        return Math.max(Math.min(num, max), min);
    }

    return {
        rgbToHex,
        rgbaToHex,
        hexToRGBA,
        numToColor,
        unique,
        limit,
    }
}();
