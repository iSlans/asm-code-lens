"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DonateInfo = void 0;
const fs_1 = require("fs");
const path = require("path");
const vscode = require("vscode");
const globalstorage_1 = require("../globalstorage");
const packageinfo_1 = require("../whatsnew/packageinfo");
const donateinfoinner_1 = require("./donateinfoinner");
/**
 * This class collects donation specific functions
 * like showing a nag screen or showing teh webview.
 */
class DonateInfo extends donateinfoinner_1.DonateInfoInner {
    /**
     * This function is used to display the donation info message.
     * @param message The text to show.
     * @param items The items to choose from.
     */
    static showInfoMessage(message, ...items) {
        return __awaiter(this, void 0, void 0, function* () {
            return vscode.window.showErrorMessage(message, ...items);
        });
    }
    /**
     * Returns the previous version, normally from GlobalStorage
     * but here in a function to override for the unit tests.
     * @returns E.g. "2.3.5"
     */
    static getPreviousVersion() {
        const previousVersion = globalstorage_1.GlobalStorage.Get(this.VERSION_ID);
        return previousVersion;
    }
    /**
     * Returns the current version, normally from PackageInfo
     * but here in a function to override for the unit tests.
     * @returns E.g. "2.3.5"
     */
    static getCurrentVersion() {
        const currentVersion = packageinfo_1.PackageInfo.extension.packageJSON.version;
        return currentVersion;
    }
    /**
     * @returns The donation time. Normally from GlobalStorage but also used by unit tests.
     */
    static getDonationTime() {
        const donateEndTime = globalstorage_1.GlobalStorage.Get(this.DONATE_TIME_ID);
        return donateEndTime;
    }
    /**
     * Sets the donation time until when the nag screen will be shown.
     * Should be 14 days into the future after new version ahs been installed.
     * @param time After this time the nag screen is not shown anymore. E.g .Date.now() + 14 days.
     */
    static setDonationTime(time) {
        globalstorage_1.GlobalStorage.Set(this.DONATE_TIME_ID, time);
    }
    /**
     * @returns Returns the state of the 'donated' flag in the asm-code-lens preferences.
     */
    static getDonatedPref() {
        // Get donated state
        const configuration = packageinfo_1.PackageInfo.getConfiguration();
        const donated = configuration.get('donated');
        if (donated)
            return true;
        return false;
    }
    /**
     * Opens a webview with donation information.
     */
    static openDonateWebView() {
        // Create vscode panel view
        const vscodePanel = vscode.window.createWebviewPanel('', '', { preserveFocus: true, viewColumn: vscode.ViewColumn.Nine });
        vscodePanel.title = 'Donate...';
        // Read the file
        const extPath = packageinfo_1.PackageInfo.extension.extensionPath;
        const htmlFile = path.join(extPath, 'html/donate.html');
        let html = (0, fs_1.readFileSync)(htmlFile).toString();
        // Exchange local path
        const resourcePath = vscode.Uri.file(extPath);
        const vscodeResPath = vscodePanel.webview.asWebviewUri(resourcePath).toString();
        html = html.replace('${vscodeResPath}', vscodeResPath);
        // Handle messages from the webview
        vscodePanel.webview.options = { enableScripts: true };
        vscodePanel.webview.onDidReceiveMessage(message => {
            switch (message.command) { // NOSONAR
                case 'showExtension':
                    // Switch to Extension Manager
                    vscode.commands.executeCommand("workbench.extensions.search", packageinfo_1.PackageInfo.extension.packageJSON.publisher);
                    // And select the given extension
                    const extensionName = packageinfo_1.PackageInfo.extension.packageJSON.publisher + '.' + message.data;
                    vscode.commands.executeCommand("extension.open", extensionName);
                    break;
            }
        });
        // Set html
        vscodePanel.webview.html = html;
    }
}
exports.DonateInfo = DonateInfo;
// Global storage properties
DonateInfo.VERSION_ID = 'version';
DonateInfo.DONATE_TIME_ID = 'donateTimeId';
//# sourceMappingURL=donateinfo.js.map