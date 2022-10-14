"use strict";
const vscode = acquireVsCodeApi();
/**
 * Send message to show the extensions.
 */
// @ts-ignore
function showExtension(extensionName) {
    vscode.postMessage({
        command: 'showExtension',
        data: extensionName
    });
}
module.exports = 0;
//# sourceMappingURL=donate.js.map