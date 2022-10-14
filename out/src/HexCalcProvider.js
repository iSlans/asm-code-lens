"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HexCalcProvider = void 0;
const vscode = require("vscode");
const path = require("path");
const fs_1 = require("fs");
const packageinfo_1 = require("./whatsnew/packageinfo");
const donateinfo_1 = require("./donate/donateinfo");
class HexCalcProvider {
    /**
     * Called by vscode.
     */
    resolveWebviewView(webviewView, context, token) {
        // Store webview
        this.webview = webviewView.webview;
        // Allow scripts in the webview
        this.webview.options = {
            enableScripts: true
        };
        // Handle messages from the webview
        this.webview.onDidReceiveMessage(message => {
            switch (message.command) { // NOSONAR
                case 'donateClicked':
                    donateinfo_1.DonateInfo.openDonateWebView();
                    break;
            }
        });
        // Create html code
        this.setMainHtml();
    }
    /**
     * Returns the html code to display the calculator.
     */
    setMainHtml() {
        if (!this.webview)
            return;
        // Add the html styles etc.
        const extPath = packageinfo_1.PackageInfo.extension.extensionPath;
        const mainHtmlFile = path.join(extPath, 'html', 'hexcalc.html');
        let mainHtml = (0, fs_1.readFileSync)(mainHtmlFile).toString();
        // Exchange local path
        const resourcePath = vscode.Uri.file(extPath);
        const vscodeResPath = this.webview.asWebviewUri(resourcePath).toString();
        mainHtml = mainHtml.replace(/\${vscodeResPath}/g, vscodeResPath);
        // Get hex prefix
        const configuration = packageinfo_1.PackageInfo.getConfiguration();
        const hexPrefix = configuration.get('hexCalculator.hexPrefix');
        // Add to initialization
        mainHtml = mainHtml.replace('//${init}', `
let hexPrefix = "${hexPrefix}";`);
        // Get donated state
        const donated = configuration.get('donated');
        // Set button
        if (!donated) {
            mainHtml = mainHtml.replace('<!--${donate}-->', `
		<button class="button-donate" style="float:right" onclick="donateClicked()">Donate...<div style="float:right;font-size:50%">ASM Code Lens</div></button>`);
        }
        // Add a Reload and Copy button for debugging
        //mainHtml = mainHtml.replace('<body>', '<body><button onclick="parseStart()">Reload</button><button onclick="copyHtmlToClipboard()">Copy HTML to clipboard</button>');
        // Set content
        this.webview.html = mainHtml;
    }
}
exports.HexCalcProvider = HexCalcProvider;
//# sourceMappingURL=HexCalcProvider.js.map