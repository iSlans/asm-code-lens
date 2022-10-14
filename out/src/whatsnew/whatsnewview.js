"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsNewView = void 0;
const vscode = require("vscode");
const path = require("path");
const fs_1 = require("fs");
const packageinfo_1 = require("./packageinfo");
const version_1 = require("./version");
const globalstorage_1 = require("../globalstorage");
class WhatsNewView {
    /**
     * Creates the text view.
     * @param title The title to use for this view.
     * @param text The static text to show.
     */
    constructor() {
        // Create vscode panel view
        this.vscodePanel = vscode.window.createWebviewPanel('', '', { preserveFocus: true, viewColumn: vscode.ViewColumn.Nine });
        // Title
        this.vscodePanel.title = "Whats New";
        // Init html
        this.setHtml();
    }
    /**
     * Updates the version number.
     * @return true if version was updated. false if version major/minor are equal.
     */
    static updateVersion() {
        // Load data from extension storage
        const versionId = 'version';
        const previousVersion = globalstorage_1.GlobalStorage.Get(versionId);
        const currentVersion = packageinfo_1.PackageInfo.extension.packageJSON.version;
        // Update version: "major", "minor" and "patch"
        if (currentVersion != previousVersion)
            globalstorage_1.GlobalStorage.Set(versionId, currentVersion);
        // Compare
        const isNewer = version_1.Version.isNewVersion(currentVersion, previousVersion);
        return isNewer;
    }
    /**
     * Returns the html code to display the whats web html.
     */
    setHtml() {
        if (!this.vscodePanel.webview)
            return;
        // Add the html styles etc.
        const extPath = packageinfo_1.PackageInfo.extension.extensionPath;
        const mainHtmlFile = path.join(extPath, 'html/whatsnew.html');
        let html = (0, fs_1.readFileSync)(mainHtmlFile).toString();
        // Exchange local path
        const resourcePath = vscode.Uri.file(extPath);
        const vscodeResPath = this.vscodePanel.webview.asWebviewUri(resourcePath).toString();
        html = html.replace('${vscodeResPath}', vscodeResPath);
        // Exchange extension name
        html = html.replace(/\${extensionName}/g, packageinfo_1.PackageInfo.extension.packageJSON.id);
        // Exchange extension version
        const versArray = packageinfo_1.PackageInfo.extension.packageJSON.version.split('.');
        let mainVersion = versArray.shift() || '';
        const vPart2 = versArray.shift();
        if (vPart2)
            mainVersion += '.' + vPart2;
        html = html.replace(/\${extensionMainVersion}/g, mainVersion);
        // Exchange display name
        html = html.replace(/\${extensionDisplayName}/g, packageinfo_1.PackageInfo.extension.packageJSON.displayName);
        // Exchange repository
        html = html.replace(/\${repositoryUrl}/g, packageinfo_1.PackageInfo.extension.packageJSON.repository.url);
        // Exchange repository
        html = html.replace(/\${repositoryIssues}/g, packageinfo_1.PackageInfo.extension.packageJSON.bugs.url);
        // Exchange repository
        html = html.replace(/\${repositoryHomepage}/g, packageinfo_1.PackageInfo.extension.packageJSON.repository.url);
        // Exchange changelog
        const changeLogFile = path.join(extPath, 'html/whatsnew_changelog.html');
        const changeLogHtml = (0, fs_1.readFileSync)(changeLogFile).toString();
        html = html.replace('${changeLog}', changeLogHtml);
        // Set content
        this.vscodePanel.webview.html = html;
    }
}
exports.WhatsNewView = WhatsNewView;
//# sourceMappingURL=whatsnewview.js.map