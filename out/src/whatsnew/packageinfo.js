"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PackageInfo = void 0;
const vscode = require("vscode");
/**
 * Reads the package.json of the extension.
 */
class PackageInfo {
    /**
     * Sets the extension path.
     * Called on extension activation.
     */
    static Init(context) {
        // Store path
        //this.extensionPath = path;
        // Get package info from globalState
        const _extension = context.globalState["_extension"];
        const extensionName = _extension.id;
        // Store extension info
        this.extension = vscode.extensions.getExtension(extensionName);
    }
    /**
     * Convenience method to return the configuration/the settings.
     * @param workspaceFolder The workspace folder to get the configuration for
     * (in case of multiroot)
     */
    static getConfiguration(workspaceFolder) {
        const packageJSON = this.extension.packageJSON;
        const extensionBaseName = packageJSON.name;
        const config = vscode.workspace.getConfiguration(extensionBaseName, workspaceFolder);
        return config;
    }
}
exports.PackageInfo = PackageInfo;
//# sourceMappingURL=packageinfo.js.map