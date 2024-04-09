export let FileHandler = function () {
    function downloadJSON(obj) {
        let blob = new Blob([JSON.stringify(obj)], { type: 'text/plain' });
        downloadFile(blob, 'card_template_' + Date.now() + '.json');
    }

    function downloadFile(blob, name) {
        let link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = name;
        link.click();
        // delete the internal blob reference to clear memory
        URL.revokeObjectURL(link.href);
    }

    async function getJSONModel() {
        let fileHandle = await window.showOpenFilePicker();
        let file = await fileHandle[0].getFile();
        let contents = await file.text();
        return JSON.parse(contents);
    }

    async function printCanvases(canvases) {
        if (canvases.length == 0) {
            alert("No Data in Table to Print");
            return;
        }

        let printWindow = window.open('', 'PRINT');

        printWindow.document.write('<html><head><title>' + document.title + '</title>');
        printWindow.document.write('</head><body >');
        for (let canvas of canvases) {
            printWindow.document.write('<img style="margin:3px" src="' + canvas.toDataURL() + '"></img>');
        }
        printWindow.document.write('</body></html>');

        printWindow.document.close(); // necessary for IE >= 10
        printWindow.focus(); // necessary for IE >= 10*/

        await new Promise((res) => {
            printWindow.addEventListener('load', () => {
                printWindow.print();
                printWindow.close();
                res();
            }, false)
        });
    }

    return {
        downloadJSON,
        getJSONModel,
        printCanvases,
    }
}();