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
exports.CodeLensProvider = void 0;
const vscode = require("vscode");
const grep_1 = require("./grep");
const regexes_1 = require("./regexes");
const donateinfo_1 = require("./donate/donateinfo");
/**
 * A CodeLens for the assembler files.
 * Extends CodeLens by the TextDocument.
 */
class AsmCodeLens extends vscode.CodeLens {
    /**
     * Constructor.
     * @param doc The corresponding TextDocument.
     * @param range The range in the TextDocument.
     * @param matchedText The matchedText, i.e. the symbol.
     */
    constructor(doc, range, matchedText) {
        super(range);
        this.document = doc;
        this.symbol = matchedText;
    }
}
/**
 * CodeLensProvider for assembly language.
 */
class CodeLensProvider {
    /**
     * Constructor.
     * @param config The configuration (preferences) to use.
     */
    constructor(config) {
        // Store
        this.config = config;
    }
    /**
     * Called from vscode to provide the code lenses.
     * Code lenses are provided unresolved.
     * It searches the given document for symbols (strings which ends with ":")
     * and creates a code lens for each.
     * @param document The document to check.
     * @param token
     */
    provideCodeLenses(document, token) {
        return __awaiter(this, void 0, void 0, function* () {
            // First check for right path
            const docPath = document.uri.fsPath;
            if (docPath.indexOf(this.config.rootFolder) < 0)
                return [];
            // Show donate info
            donateinfo_1.DonateInfo.checkDonateInfo(); // No need for 'await'.
            // Find all code lenses
            const codeLenses = [];
            const regexes = (0, regexes_1.regexesLabel)(this.config);
            const matches = (0, grep_1.grepTextDocumentMultiple)(document, regexes);
            // Loop all matches and create code lenses
            for (const fmatch of matches) {
                // Create codeLens
                const lineNr = fmatch.line;
                const colStart = (fmatch.match[1]) ? fmatch.match[1].length : 0;
                let colEnd = fmatch.end;
                const lineContents = document.lineAt(lineNr).text;
                let matchedText = lineContents.substring(colStart, colEnd);
                if (matchedText.endsWith(':')) {
                    colEnd--;
                    matchedText = matchedText.substring(0, matchedText.length - 1);
                }
                const trimmedMatchedText = matchedText.trim();
                // Check that label is not excluded
                if (!this.config.labelsExcludes.includes(trimmedMatchedText.toLowerCase())) {
                    // Create code lens
                    const startPos = new vscode.Position(lineNr, colStart);
                    const endPos = new vscode.Position(lineNr, colEnd);
                    const range = new vscode.Range(startPos, endPos);
                    const codeLense = new AsmCodeLens(document, range, trimmedMatchedText);
                    // Store
                    codeLenses.push(codeLense);
                }
            }
            return codeLenses;
        });
    }
    /**
     * Called by vscode if the codelens should be resolved (displayed).
     * The symbol (matchedText) is searched and the count of references is
     * presented with the text "n references".
     * @param codeLens An AsmCodeLens object which also includes the symbol and the document.
     * @param token
     */
    resolveCodeLens(codeLens, token) {
        return __awaiter(this, void 0, void 0, function* () {
            // Search the references
            const searchWord = codeLens.symbol;
            const searchRegex = (0, regexes_1.regexAnyReferenceForWord)(searchWord);
            const doc = codeLens.document;
            const pos = codeLens.range.start;
            //const line = pos.line;
            const locations = yield (0, grep_1.grep)(searchRegex, this.config.rootFolder);
            // Remove any locations because of module information (dot notation)
            const reducedLocations = yield (0, grep_1.reduceLocations)(locations, doc.fileName, pos, true, false);
            // create title
            const count = reducedLocations.length;
            let title = count + ' reference';
            if (count != 1)
                title += 's';
            // Add command to show the references (like in "find all references")
            codeLens.command = {
                title: title,
                command: 'editor.action.showReferences',
                arguments: [
                    doc.uri,
                    pos,
                    reducedLocations //reference locations
                ]
            };
            return codeLens;
        });
    }
}
exports.CodeLensProvider = CodeLensProvider;
//# sourceMappingURL=CodeLensProvider.js.map