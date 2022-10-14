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
exports.DefinitionProvider = void 0;
const vscode = require("vscode");
const grep_1 = require("./grep");
//import { resolve } from 'path';
const regexes_1 = require("./regexes");
/**
 * DefinitionProvider for assembly language.
 * Called from vscode e.g. for "Goto definition".
 */
class DefinitionProvider {
    /**
     * Constructor.
     * @param config The configuration (preferences) to use.
     */
    constructor(config) {
        // Store
        this.config = config;
    }
    /**
     * Called from vscode if the user selects "Goto definition".
     * @param document The current document.
     * @param position The position of the word for which the definition should be found.
     * @param options
     * @param token
     */
    provideDefinition(document, position, token) {
        return __awaiter(this, void 0, void 0, function* () {
            // First check for right path
            const docPath = document.uri.fsPath;
            if (!docPath.includes(this.config.rootFolder))
                return []; // Path is wrong.
            // Check for 'include "..."'
            const lineContents = document.lineAt(position.line).text;
            const match = (0, regexes_1.regexInclude)().exec(lineContents);
            if (match) {
                // INCLUDE found
                return this.getInclude(match[1]);
            }
            else {
                // Normal definition
                return this.search(document, position);
            }
        });
    }
    /**
     * Searches the files that match the 'relPath' path.
     * @param relPath E.g. 'util/zxspectrum.inc'
     * @returns A promise to an array with locations. Normally there is only one entry to the array.
     * Points to the first line of the file.
     */
    getInclude(relPath) {
        return __awaiter(this, void 0, void 0, function* () {
            const filePattern = new vscode.RelativePattern(this.config.rootFolder, '**/' + relPath);
            const uris = yield vscode.workspace.findFiles(filePattern, null);
            const locations = [];
            const pos = new vscode.Position(0, 0);
            const range = new vscode.Range(pos, pos);
            for (const uri of uris) {
                const loc = new vscode.Location(uri, range);
                locations.push(loc);
            }
            return locations;
        });
    }
    /**
     * Does a search for a word. I.e. finds all references of the word.
     * @param document The document that contains the word.
     * @param position The word position.
     * @returns A promise to an array with locations. Normally there is only one entry to the array.
     */
    search(document, position) {
        return __awaiter(this, void 0, void 0, function* () {
            const searchWord = document.getText(document.getWordRangeAtPosition(position)); //, /[a-z0-9_.]+/i));
            // Check if search word is in the excludes
            if (this.config.labelsExcludes.includes(searchWord))
                return []; // Abort
            // Find all "something:" (labels) in the document, also labels without colon.
            const regexes = (0, regexes_1.regexesLabelForWord)(searchWord, this.config);
            // Find all sjasmplus MODULEs in the document
            const searchSjasmModule = (0, regexes_1.regexModuleForWord)(searchWord);
            regexes.push(searchSjasmModule);
            // Find all sjasmplus MACROs in the document
            const searchSjasmMacro = (0, regexes_1.regexMacroForWord)(searchWord);
            regexes.push(searchSjasmMacro);
            // Find all sjasmplus STRUCTs in the document
            const searchSjasmStruct = (0, regexes_1.regexStructForWord)(searchWord);
            regexes.push(searchSjasmStruct);
            const locations = yield (0, grep_1.grepMultiple)(regexes, this.config.rootFolder);
            const reducedLocations = yield (0, grep_1.reduceLocations)(locations, document.fileName, position, false, true, /\w/);
            // There should be only one location.
            // Anyhow return the whole array.
            return reducedLocations;
        });
    }
}
exports.DefinitionProvider = DefinitionProvider;
//# sourceMappingURL=DefinitionProvider.js.map