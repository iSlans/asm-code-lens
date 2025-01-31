"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentSymbolProvider = void 0;
const vscode = require("vscode");
const comments_1 = require("./comments");
/**
 * ReferenceProvider for assembly language.
 */
class DocumentSymbolProvider {
    /**
     * Constructor.
     * @param config The configuration (preferences) to use.
     */
    constructor(config) {
        // Store
        this.config = config;
    }
    /**
     * Called by vscode to provide symbol information for the given document.
     * I.e. returns all labels of a document.
     *
     * @param document The document in which the command was invoked.
     * @param token A cancellation token.
     * @return An array of document highlights or a thenable that resolves to such. The lack of a result can be
     * signaled by returning `undefined`, `null`, or an empty array.
     */
    provideDocumentSymbols(document, token) {
        // First check for right path
        const docPath = document.uri.fsPath;
        if (!docPath.includes(this.config.rootFolder))
            return undefined; // Path is wrong.
        // Loops through the whole document line by line and
        // extracts the labels.
        // Determines for each label if it is code-label,
        // a code-relative-label, an const-label (EQU) or a
        // data-label and creates symbols for each.
        // Those symbols are returned.
        let symbols = new Array();
        //const regexLabel = /^([.a-z_@][\w.]*\b)(:?)/i;
        let regexLabel;
        if (this.config.labelsWithColons && this.config.labelsWithoutColons)
            regexLabel = /^(((@?)([a-z_][\w\.]*))(:?))/i; // With or without colon
        else {
            if (this.config.labelsWithColons)
                regexLabel = /^(((@?)([a-z_][\w\.]*)):)/i; // With colon
            else
                regexLabel = /^(((@?)([a-z_][\w\.]*)))(?:\s|$)/i; // Without colon
        }
        const regexModule = /\s+\b(module\s+([a-z_][\w\.]*)|endmodule.*)/i;
        const regexStruct = /\s+\b(struct\s+([a-z_][\w\.]*)|ends.*)/i;
        //const regexNotLabels = /^(include|if|endif|else|elif)$/i;
        const excludes = ['include', ...this.config.labelsExcludes];
        const regexConst = /\b(equ)\s+(.*)/i;
        const regexData = /\b(d[bcdghmsw]|def[bdghmsw])\b\s*(.*)/i;
        let lastSymbol;
        let lastSymbols = new Array();
        let lastAbsSymbolChildren;
        let lastModules = new Array();
        let defaultSymbolKind = vscode.SymbolKind.Function;
        // Strip all comments
        const len = document.lineCount;
        const lines = Array(len);
        for (let i = 0; i < len; i++) {
            const textLine = document.lineAt(i);
            lines[i] = textLine.text;
        }
        (0, comments_1.stripAllComments)(lines);
        // Go through all lines
        for (let line = 0; line < len; line++) {
            let lineContents = lines[line];
            const match = regexLabel.exec(lineContents);
            if (match) {
                // It is a label or module (or both)
                const labelPlus = match[1]; // Label plus e.g. ':'
                const label = match[2]; // Label without ':'
                // Check that label is not excluded
                if (!excludes.includes(label)) {
                    // Check for label
                    // Create range
                    const range = new vscode.Range(line, 0, line, 10000);
                    const selRange = range; //new vscode.Range(line, 0, line, 3);
                    // Create Symbol
                    lastSymbol = new vscode.DocumentSymbol(label, '', defaultSymbolKind, range, selRange);
                    lastSymbols.push(lastSymbol);
                    // Insert as absolute or relative label
                    if (label.startsWith('.')) {
                        // Relative label
                        lastAbsSymbolChildren === null || lastAbsSymbolChildren === void 0 ? void 0 : lastAbsSymbolChildren.push(lastSymbol);
                    }
                    else if (label.startsWith('@')) {
                        // Absolute label ignoring MODULE
                        symbols.push(lastSymbol);
                    }
                    else {
                        // Absolute label
                        // Add to children of last module
                        const len = lastModules.length;
                        if (len > 0) {
                            const lastModule = lastModules[len - 1];
                            lastModule.children.push(lastSymbol);
                        }
                        else {
                            symbols.push(lastSymbol);
                        }
                        lastAbsSymbolChildren = lastSymbol.children;
                    }
                    // Remove label from line contents.
                    const len = labelPlus.length;
                    lineContents = lineContents.substring(len);
                    // Add a whitespace to recognize a directly following MODULE
                    lineContents += ' ';
                }
            }
            // Now check for MODULE or STRUCT
            let matchModule = regexModule.exec(lineContents);
            if (!matchModule)
                matchModule = regexStruct.exec(lineContents);
            if (matchModule) {
                const keyword = matchModule[1].toLowerCase();
                const moduleName = matchModule[2];
                if (moduleName) {
                    // Handle MODULE
                    // Create range
                    const range = new vscode.Range(line, 0, line, 10000);
                    const selRange = range; //new vscode.Range(line, 0, line, 3);
                    // Create symbol
                    const kind = (keyword.startsWith("module")) ? vscode.SymbolKind.Module : vscode.SymbolKind.Struct;
                    const moduleSymbol = new vscode.DocumentSymbol(moduleName, '', kind, range, selRange);
                    // Add to children of last module
                    const len = lastModules.length;
                    if (len > 0) {
                        const lastModule = lastModules[len - 1];
                        lastModule.children.push(moduleSymbol);
                    }
                    else {
                        symbols.push(moduleSymbol);
                    }
                    lastModules.push(moduleSymbol);
                }
                // Check for ENDMODULE
                if (keyword == "endmodule" || keyword == "ends") {
                    // Handle ENDMODULE
                    lastModules.pop();
                    lastAbsSymbolChildren = undefined;
                }
                lastSymbol = undefined;
                lastSymbols.length = 0;
                continue;
            }
            // Trim
            lineContents = lineContents.trim();
            // Now check which kind of data it is:
            // code, const or data
            if (!lineContents)
                defaultSymbolKind = vscode.SymbolKind.Function;
            if (lastSymbol) {
                if (lineContents) {
                    let kind;
                    // Check for EQU
                    let match = regexConst.exec(lineContents);
                    if (match) {
                        // It's const data, e.g. EQU
                        kind = vscode.SymbolKind.Constant;
                    }
                    else {
                        // Check for data
                        match = regexData.exec(lineContents);
                        if (match) {
                            // It's data data, e.g. defb
                            kind = vscode.SymbolKind.Field;
                        }
                    }
                    // Check if found
                    if (kind != undefined) {
                        // It's something else than code
                        for (const elem of lastSymbols) {
                            elem.kind = kind;
                            elem.detail = match[1] + ' ' + match[2].trimRight();
                        }
                        defaultSymbolKind = kind;
                    }
                    // Something different, so assume code
                    lastSymbol = undefined;
                    lastSymbols.length = 0;
                    continue;
                }
            }
        }
        return symbols;
    }
}
exports.DocumentSymbolProvider = DocumentSymbolProvider;
//# sourceMappingURL=DocumentSymbolProvider.js.map