"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = void 0;
const vscode = require("vscode");
const path = require("path");
const ReferenceProvider_1 = require("./ReferenceProvider");
const DefinitionProvider_1 = require("./DefinitionProvider");
const HoverProvider_1 = require("./HoverProvider");
const CodeLensProvider_1 = require("./CodeLensProvider");
const RenameProvider_1 = require("./RenameProvider");
const DocumentSymbolProvider_1 = require("./DocumentSymbolProvider");
const CompletionProposalsProvider_1 = require("./CompletionProposalsProvider");
const Commands_1 = require("./Commands");
const grep_1 = require("./grep");
const comments_1 = require("./comments");
const HexCalcProvider_1 = require("./HexCalcProvider");
const whatsnewview_1 = require("./whatsnew/whatsnewview");
const packageinfo_1 = require("./whatsnew/packageinfo");
const globalstorage_1 = require("./globalstorage");
const config_1 = require("./config");
const donateinfo_1 = require("./donate/donateinfo");
function activate(context) {
    // Init package info
    packageinfo_1.PackageInfo.Init(context);
    // Init global storage
    globalstorage_1.GlobalStorage.Init(context);
    // Check version for donate info
    donateinfo_1.DonateInfo.checkVersion();
    // Check version and show 'What's new' if necessary.
    const mjrMnrChanged = whatsnewview_1.WhatsNewView.updateVersion();
    if (mjrMnrChanged) {
        // Major or minor version changed so show the whatsnew page.
        new whatsnewview_1.WhatsNewView(); // NOSONAR
    }
    // Register the additional command to view the "Whats' New" page.
    context.subscriptions.push(vscode.commands.registerCommand("asm-code-lens.whatsNew", () => new whatsnewview_1.WhatsNewView()));
    // Register the hex calculator webviews
    hexCalcExplorerProvider = new HexCalcProvider_1.HexCalcProvider();
    context.subscriptions.push(vscode.window.registerWebviewViewProvider("asm-code-lens.calcview-explorer", hexCalcExplorerProvider, { webviewOptions: { retainContextWhenHidden: true } }));
    hexCalcDebugProvider = new HexCalcProvider_1.HexCalcProvider();
    context.subscriptions.push(vscode.window.registerWebviewViewProvider("asm-code-lens.calcview-debug", hexCalcDebugProvider, { webviewOptions: { retainContextWhenHidden: true } }));
    // Enable logging.
    configure(context);
    // Check for every change.
    context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(event => {
        configure(context, event);
    }));
    // Register command once.
    vscode.commands.registerCommand('asm-code-lens.find-labels-with-no-reference', () => {
        var _a;
        // Get current text editor to get current project/root folder.
        const editorPath = ((_a = vscode.window.activeTextEditor) === null || _a === void 0 ? void 0 : _a.document.uri.fsPath) || '';
        // Get all workspace folders
        const wsFolders = (vscode.workspace.workspaceFolders || []).map(ws => ws.uri.fsPath + path.sep);
        const config = (0, config_1.getLabelsConfig)();
        // Check in which workspace folder the path is included
        for (const rootFolder of wsFolders) {
            if (editorPath.includes(rootFolder)) {
                // Add root folder
                config.rootFolder = rootFolder;
                // Found. Find labels
                Commands_1.Commands.findLabelsWithNoReference(config);
                // Stop loop
                break;
            }
        }
    });
}
exports.activate = activate;
/**
 * Reads the configuration.
 */
function configure(context, event) {
    // Note: All configuration preferences are scoped 'window' which means:
    // user, workspace or remote.
    // So, in multiroot configurations all folders share the same settings.
    // There are no special settings for the different multiroot folders.
    const settings = packageinfo_1.PackageInfo.getConfiguration();
    // Get all workspace folders
    const wsFolders = (vscode.workspace.workspaceFolders || []).map(ws => ws.uri.fsPath + path.sep);
    // Check for the hex calculator params
    if (event) {
        if (event.affectsConfiguration('asm-code-lens.hexCalculator.hexPrefix')
            || event.affectsConfiguration('asm-code-lens.donated')) {
            // Update the hex calculators
            if (hexCalcExplorerProvider)
                hexCalcExplorerProvider.setMainHtml();
            if (hexCalcDebugProvider)
                hexCalcDebugProvider.setMainHtml();
            // Update the donate info
            donateinfo_1.DonateInfo.donatedPreferencesChanged();
        }
    }
    // Dispose (remove) all providers
    for (const rootFolder of wsFolders) {
        // Deregister
        removeProvider(regCodeLensProviders.get(rootFolder), context);
        removeProvider(regHoverProviders.get(rootFolder), context);
        removeProvider(regCompletionProposalsProviders.get(rootFolder), context);
        removeProvider(regDefinitionProviders.get(rootFolder), context);
        removeProvider(regReferenceProviders.get(rootFolder), context);
        removeProvider(regRenameProviders.get(rootFolder), context);
        removeProvider(regDocumentSymbolProviders.get(rootFolder), context);
    }
    regCodeLensProviders.clear();
    regHoverProviders.clear();
    regCompletionProposalsProviders.clear();
    regDefinitionProviders.clear();
    regReferenceProviders.clear();
    regRenameProviders.clear();
    regDocumentSymbolProviders.clear();
    // Set search paths.
    (0, grep_1.setGrepGlobPatterns)(settings.includeFiles, settings.excludeFiles);
    // Get some settings.
    const configWoRoot = (0, config_1.getLabelsConfig)();
    // Note: don't add 'language' property, otherwise other extension with similar file pattern may not work.
    // If the identifier is missing it also doesn't help to define it in package.json. And if "id" would be used it clashes again with other extensions.
    const asmFiles = { scheme: "file", pattern: settings.includeFiles };
    // Multiroot: do for all root folders:
    for (const rootFolder of wsFolders) {
        // Copy config
        const config = Object.assign({}, configWoRoot);
        // For multiroot
        config.rootFolder = rootFolder;
        // Code Lenses
        if (settings.enableCodeLenses) {
            // Register
            const provider = vscode.languages.registerCodeLensProvider(asmFiles, new CodeLensProvider_1.CodeLensProvider(config));
            regCodeLensProviders.set(rootFolder, provider);
            context.subscriptions.push(provider);
        }
        if (settings.enableHovering) {
            // Register
            const provider = vscode.languages.registerHoverProvider(asmFiles, new HoverProvider_1.HoverProvider(config));
            regHoverProviders.set(rootFolder, provider);
            context.subscriptions.push(provider);
        }
        if (settings.enableCompletions) {
            // Register
            const provider = vscode.languages.registerCompletionItemProvider(asmFiles, new CompletionProposalsProvider_1.CompletionProposalsProvider(config));
            regCompletionProposalsProviders.set(rootFolder, provider);
            context.subscriptions.push(provider);
        }
        if (settings.enableGotoDefinition) {
            // Register
            const provider = vscode.languages.registerDefinitionProvider(asmFiles, new DefinitionProvider_1.DefinitionProvider(config));
            regDefinitionProviders.set(rootFolder, provider);
            context.subscriptions.push(provider);
        }
        if (settings.enableFindAllReferences) {
            // Register
            const provider = vscode.languages.registerReferenceProvider(asmFiles, new ReferenceProvider_1.ReferenceProvider(rootFolder));
            regReferenceProviders.set(rootFolder, provider);
            context.subscriptions.push(provider);
        }
        if (settings.enableRenaming) {
            // Register
            const provider = vscode.languages.registerRenameProvider(asmFiles, new RenameProvider_1.RenameProvider(rootFolder));
            regRenameProviders.set(rootFolder, provider);
            context.subscriptions.push(provider);
        }
        if (settings.enableOutlineView) {
            // Register
            const provider = vscode.languages.registerDocumentSymbolProvider(asmFiles, new DocumentSymbolProvider_1.DocumentSymbolProvider(config));
            regDocumentSymbolProviders.set(rootFolder, provider);
            context.subscriptions.push(provider);
        }
    }
    // Toggle line Comment configuration
    const toggleCommentPrefix = settings.get("comments.toggleLineCommentPrefix") || ';';
    vscode.languages.setLanguageConfiguration("asm-collection", { comments: { lineComment: toggleCommentPrefix } });
    // Store
    (0, comments_1.setCustomCommentPrefix)(toggleCommentPrefix);
}
/**
 * Removes a provider.
 * Disposes it and removes it from subscription list.
 */
function removeProvider(pv, context) {
    if (pv) {
        pv.dispose();
        const i = context.subscriptions.indexOf(pv);
        context.subscriptions.splice(i, 1);
    }
}
let hexCalcExplorerProvider;
let hexCalcDebugProvider;
let regCodeLensProviders = new Map();
let regHoverProviders = new Map();
let regCompletionProposalsProviders = new Map();
let regDefinitionProviders = new Map();
let regReferenceProviders = new Map();
let regRenameProviders = new Map();
let regDocumentSymbolProviders = new Map();
// this method is called when your extension is deactivated
/*
export function deactivate() {
}
*/
//# sourceMappingURL=extension.js.map