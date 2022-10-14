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
exports.ReferenceProvider = void 0;
const grep_1 = require("./grep");
const regexes_1 = require("./regexes");
/**
 * ReferenceProvider for assembly language.
 */
class ReferenceProvider {
    /**
     * Constructor.
     * @param rootFolder Stores the root folder for multiroot projects.
     */
    constructor(rootFolder) {
        // Store
        this.rootFolder = rootFolder;
    }
    /**
     * Called from vscode if the user selects "Find all references".
     * @param document The current document.
     * @param position The position of the word for which the references should be found.
     * @param options
     * @param token
     */
    provideReferences(document, position, options, token) {
        return __awaiter(this, void 0, void 0, function* () {
            // First check for right path
            const docPath = document.uri.fsPath;
            if (docPath.indexOf(this.rootFolder) < 0)
                return []; // Skip because path belongs to different workspace
            // Path is from right project -> search
            return this.search(document, position);
        });
    }
    /**
     * Does a search for a word. I.e. finds all references of the word.
     * @param document The document that contains the word.
     * @param position The word position.
     */
    search(document, position) {
        return __awaiter(this, void 0, void 0, function* () {
            const searchWord = document.getText(document.getWordRangeAtPosition(position));
            const searchRegex = (0, regexes_1.regexAnyReferenceForWord)(searchWord);
            const locations = yield (0, grep_1.grep)(searchRegex, this.rootFolder);
            const reducedLocations = yield (0, grep_1.reduceLocations)(locations, document.fileName, position, false, true, /\w/);
            return reducedLocations;
        });
    }
}
exports.ReferenceProvider = ReferenceProvider;
//# sourceMappingURL=ReferenceProvider.js.map