"use strict";
var __awaiter =
    (this && this.__awaiter) ||
    function (thisArg, _arguments, P, generator) {
        function adopt(value) {
            return value instanceof P
                ? value
                : new P(function (resolve) {
                    resolve(value);
                });
        }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) {
                try {
                    step(generator.next(value));
                } catch (e) {
                    reject(e);
                }
            }
            function rejected(value) {
                try {
                    step(generator["throw"](value));
                } catch (e) {
                    reject(e);
                }
            }
            function step(result) {
                result.done
                    ? resolve(result.value)
                    : adopt(result.value).then(fulfilled, rejected);
            }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
Object.defineProperty(exports, "__esModule", { value: true });
exports.HoverProvider = void 0;
const vscode = require("vscode");
const grep_1 = require("./grep");
const regexes_1 = require("./regexes");
const fs = require("fs");
const comments_1 = require("./comments");

// ---------------Custom Code -------------------
let docs = {}
try {
    const separator = `\n@@@\n`;
    const data = fs.readFileSync(__dirname + '/documentation.s').toString();
    // hoverTexts.push(new vscode.MarkdownString(data))
    const docsArray = data.split(separator).map(el => el.split('\n'))
    docsArray.forEach(docArr => {
        // let flags = docArr.pop();
        let [name, command, ...info] = docArr;
        name = name.replace(' ', '');
        docs[name] = { command, info }
    })
} catch { e => console.log(e); }
// ----------------------------------------------

/**
 * HoverProvider for assembly language.
 */
class HoverProvider {
    /**
     * Constructor.
     * @param config The configuration (preferences) to use.
     */
    constructor(config) {
        // Store
        this.config = config;
    }
    /**
     * Called from vscode if the user hovers over a word.
     * @param document The current document.
     * @param position The position of the word for which the references should be found.
     * @param options
     * @param token
     */
    provideHover(document, position, token) {
        return __awaiter(this, void 0, void 0, function* () {
            // First check for right path
            const docPath = document.uri.fsPath;
            if (!docPath.includes(this.config.rootFolder)) return undefined; // Path is wrong.
            // Right path.
            return this.search(document, position);
        });
    }
    /**
     * Does a search for a word. I.e. finds all references of the word.
     * @param document The document that contains the word.
     * @param position The word position.
     * @return A promise with a vscode.Hover object.
     */
    search(document, position) {
        return __awaiter(this, void 0, void 0, function* () {
            // Check for local label
            const regexEnd = /\w/;
            const lineContents = document.lineAt(position.line).text;
            const { label } = (0, grep_1.getCompleteLabel)(
                lineContents,
                position.character,
                regexEnd
            );
            //console.log("provideHover", this.rootFolder, document.uri.fsPath, "'" + label + "'");
            if (label.startsWith(".")) {
                return new vscode.Hover("");
            }
            // It is a non local label
            const range = document.getWordRangeAtPosition(position);
            const searchWord = document.getText(range);
            // regexes for labels with and without colon
            const regexes = (0, regexes_1.regexesLabelForWord)(
                searchWord,
                this.config
            );
            // Find all sjasmplus MODULEs in the document
            const searchSjasmModule = (0, regexes_1.regexModuleForWord)(searchWord);
            regexes.push(searchSjasmModule);
            // Find all sjasmplus MACROs in the document
            const searchSjasmMacro = (0, regexes_1.regexMacroForWord)(searchWord);
            regexes.push(searchSjasmMacro);
            const locations = yield (0, grep_1.grepMultiple)(
                regexes,
                this.config.rootFolder
            );
            // Reduce the found locations.
            const reducedLocations = yield (0, grep_1.reduceLocations)(
                locations,
                document.fileName,
                position,
                false,
                true,
                regexEnd
            );

            const hoverTexts = new Array();

            // ----------------- Custom Code -------------------------------
            try {
                let docword = searchWord.toUpperCase();
                if (!(docword in docs)) {
                    docword = docword.slice(0, -1)
                }
                if (docword in docs) {
                    let info = docs[docword].info;
                    let command = docs[docword].command;
                    let infostr = info.join('\n')

                    let mdtext = new vscode.MarkdownString();
                    mdtext.supportHtml = true;
                    mdtext.appendCodeblock(command)
                    hoverTexts.push(mdtext)

                    mdtext = new vscode.MarkdownString();
                    mdtext.appendCodeblock(infostr)
                    hoverTexts.push(mdtext)
                }
            } catch (e) {
                hoverTexts.push(new vscode.MarkdownString(e.toString()))
            }
            // --------------------------------------------------------------

            // Now read the comment lines above the document.
            // Normally there is only one but e.g. if there are 2 modules with the same name there could be more.
            // Check for end
            for (const loc of reducedLocations) {
                // Check if included in exclusion list
                const name = loc.moduleLabel;
                if (this.config.labelsExcludes.includes(name)) continue;
                // Get comments
                const lineNr = loc.range.start.line;
                const filePath = loc.uri.fsPath;
                const linesData = fs.readFileSync(filePath, { encoding: "utf-8" });
                const lines = linesData.split("\n");

                // Now find all comments above the found line
                const foundTexts = (0, comments_1.readCommentsForLine)(lines, lineNr);
                if (foundTexts.length > 0) {

                    // Separate several found texts
                    if (hoverTexts.length > 0) {
                        // hoverTexts.push(new vscode.MarkdownString('=============='));
                    }
                    // Add text

                    hoverTexts.push(
                        ...foundTexts.map((line) => {
                            // -------------------- Custom Code ---------------------------------
                            const DocIdentifier = '@Doc ';
                            let final_line = line;
                            let docStart = line.search(DocIdentifier);
                            if (docStart > -1) {
                                let docString = line.slice(docStart + DocIdentifier.length);
                                docString = docString.replace('\\n', `\n`);
                                final_line = docString;
                            }

                            let str = new vscode.MarkdownString()
                            str.appendCodeblock(final_line)
                            return str
                            // ------------------------------------------------------------------
                        })
                    );
                }
            }
            // End of processing.
            // Check if 0 entries
            if (hoverTexts.length == 0) return undefined; // Nothing found
            // return
            const hover = new vscode.Hover(hoverTexts);
            return hover;
        });
    }
}
exports.HoverProvider = HoverProvider;
//# sourceMappingURL=HoverProvider.js.map
