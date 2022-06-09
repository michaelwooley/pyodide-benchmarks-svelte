// export const getWorker = () => {
//     console.log(import.meta.url);
//     console.log(new URL('./pyodide.worker.ts', import.meta.url));
//     const worker = new Worker(new URL('./pyodide.worker.ts', import.meta.url), {
//         type: 'module'
//     });
//     return worker;
// };
// window.URL = window.URL || window.webkitURL;

// URL.createObjectURL();
// window.URL = window.URL || window.webkitURL;

// // "Server response", used in all examples
// var response = "self.onmessage=function(e){postMessage('Worker: '+e.data);}";

// var blob;
// try {
//     blob = new Blob([response], { type: 'application/javascript' });
// } catch (e) {
//     // Backwards-compatibility
//     window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder;
//     blob = new BlobBuilder();
//     blob.append(response);
//     blob = blob.getBlob();
// }

export const getWorkerDev = async () => {
    const workerString = await (await import('./pyodide.worker?raw')).default;
    console.log(workerString);
    const blob = new Blob([workerString], { type: 'application/javascript' });
    const worker = new Worker(URL.createObjectURL(blob));
    return worker;
};
