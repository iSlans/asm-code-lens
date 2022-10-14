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
exports.RenameProvider = void 0;
const vscode = require("vscode");
const grep_1 = require("./grep");
const fs = require("fs");
const regexes_1 = require("./regexes");
/**
 * RenameProvider for assembly language.
 * User selects "Rename symbol".
 */
class RenameProvider {
    /**
     * Constructor.
     * @param rootFolder Stores the root folder for multiroot projects.
     */
    constructor(rootFolder) {
        // Store
        this.rootFolder = rootFolder;
    }
    /**
     * Called from vscode if the user selects "Rename symbol".
     * @param document The current document.
     * @param position The position of the word for which the references should be found.
     * @param options
     * @param token
     */
    provideRenameEdits(document, position, newName, token) {
        return __awaiter(this, void 0, void 0, function* () {
            // First check for right path
            const docPath = document.uri.fsPath;
            if (!docPath.includes(this.rootFolder)) {
                // Skip because path belongs to different workspace
                return undefined;
            }
            // Path is from right project -> rename
            return this.rename(document, position, newName);
        });
    }
    /**
     * Searches for oldName in all files and replaces it with newName.
     * @param oldName The name to replace.
     * @param newName The new name.
     */
    rename(document, position, newName) {
        return __awaiter(this, void 0, void 0, function* () {
            const oldName = document.getText(document.getWordRangeAtPosition(position));
            const searchRegex = (0, regexes_1.regexAnyReferenceForWordGlobal)(oldName);
            const locations = yield (0, grep_1.grep)(searchRegex, this.rootFolder);
            const reducedLocations = yield (0, grep_1.reduceLocations)(locations, document.fileName, position, false, true, /\w/);
            // Change to WorkSpaceEdits.
            // Note: WorkSpaceEdits do work on all (even not opened files) in the workspace.
            // However the problem is that the file which is not yet open would be
            // opened by the WorkSpaceEdit and stay there unsaved.
            // Therefore I try beforehand to find out which documents are already opened and
            // handle the unopened files differently.
            // The problem is: there is no way to find out the opened documents.
            // The only available information are the dirty docs. I.e. those are opened.
            // And only those are changed with WorkSpaceEdits.
            // The other, undirty opened docs and unopened docs, are changed on disk.
            // For the undirty opened docs this will result in a reload at the same position.
            // Not nice, but working.
            const wsEdit = new vscode.WorkspaceEdit();
            const docs = vscode.workspace.textDocuments.filter(doc => doc.isDirty);
            const fileMap = new Map();
            for (const loc of reducedLocations) {
                // Check if doc is not open
                const fsPath = loc.uri.fsPath;
                const foundDoc = (0, grep_1.getTextDocument)(fsPath, docs);
                if (foundDoc) {
                    // use workspace edit because file is opened in editor
                    wsEdit.replace(loc.uri, loc.range, newName);
                }
                else {
                    // Remember the change for the files on disk:
                    // It may happen that the same file is changed several times.
                    // Therefore the data is collected first.
                    // Check if location array already exists.
                    let locs = fileMap.get(fsPath);
                    if (!locs) {
                        // If not, create it.
                        locs = new Array();
                        fileMap.set(fsPath, locs);
                    }
                    // Add location
                    locs.push(loc.range);
                }
            }
            // Change files on disk.
            for (const [fsPath, changes] of fileMap) {
                this.renameInFile(fsPath, changes, newName);
            }
            return wsEdit;
        });
    }
    /**
     * Replaces one occurrence in the file on disk with the 'newName'.
     * @param filePath The absolute file path.
     * @param changes The changes: an array with locations.
     * @param newName The new name.
     */
    renameInFile(filePath, changes, newName) {
        return __awaiter(this, void 0, void 0, function* () {
            //const readStream = fs.createReadStream(filePath, { encoding: 'utf-8' });
            // Read and exchange
            const linesData = fs.readFileSync(filePath, { encoding: 'utf-8' });
            const lines = linesData.split('\n');
            // Process all changes
            const regex = (0, regexes_1.regexInclude)();
            for (const range of changes) {
                const row = range.start.line;
                const clmn = range.start.character;
                const clmnEnd = range.end.character;
                const line = lines[row];
                // Skip include lines
                const match = regex.exec(line);
                if (match)
                    continue;
                // Replace
                const replacedLine = line.substring(0, clmn) + newName + line.substring(clmnEnd);
                lines[row] = replacedLine;
            }
            // Now write file
            const replacedText = lines.join('\n');
            const writeStream = fs.createWriteStream(filePath, { encoding: 'utf-8' });
            yield writeStream.write(replacedText, () => {
                writeStream.close();
            });
        });
    }
}
exports.RenameProvider = RenameProvider;
//# sourceMappingURL=RenameProvider.js.map