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
exports.dbgPrintLocations = exports.getCompleteLabel = exports.getModule = exports.getNonLocalLabel = exports.reduceLocations = exports.getLabelAndModuleLabel = exports.getRegExFromLabel = exports.getLastLabelPart = exports.grepTextDocumentMultiple = exports.grepTextDocument = exports.grepMultiple = exports.grep = exports.grepGlobExclude = exports.grepGlobInclude = exports.setGrepGlobPatterns = exports.getTextDocument = exports.removeDuplicates = exports.GrepLocation = void 0;
const vscode = require("vscode");
const assert = require("assert");
const fs = require("fs");
const regexes_1 = require("./regexes");
const comments_1 = require("./comments");
/**
 * This extends the vscode location object by
 * the match object.
 * Used in 'findLabelsWithNoReference'.
 */
class GrepLocation extends vscode.Location {
    /**
     * Creates a new location object.
     * @param uri The resource identifier.
     * @param rangeOrPosition The range or position. Positions will be converted to an empty range.
     * @param fileMatch The complete file match object.
     * @param symbol The label, i.e. part of the label (without module name).
     */
    constructor(uri, rangeOrPosition, fileMatch) {
        super(uri, rangeOrPosition);
        this.fileMatch = fileMatch;
        const { label } = getCompleteLabel(fileMatch.lineContents, fileMatch.start);
        this.symbol = label;
    }
}
exports.GrepLocation = GrepLocation;
/**
 * Remove all duplicates from the location list.
 * @param locations An array with locations, some entries might be doubled.
 * @param handler(loc) Returns a string that should be used to find equal entries.
 * @returns An array of locations with unique entries.
 */
function removeDuplicates(locations, handler) {
    // Put all in a map;
    const locMap = new Map();
    locations.forEach(loc => locMap.set(handler(loc), loc));
    // Then generate an array from the map:
    const results = Array.from(locMap.values());
    return results;
}
exports.removeDuplicates = removeDuplicates;
/**
 * Checks the list of 'docs' for a given 'filePath' and returns the corresponding
 * text document.
 * @param filePath
 * @param docs The list of text documents. Obtained with vscode.workspace.textDocuments.filter(doc => doc.isDirty)
 * @returns The vscode.TextDocument or undefined if not found.
 */
function getTextDocument(filePath, docs) {
    // Check if file is opened in editor
    let foundDoc;
    for (const doc of docs) {
        //if(doc.isDirty)    // Only check dirty documents, other are on disk
        if (doc.fileName == filePath) {
            foundDoc = doc;
            break;
        }
    }
    return foundDoc;
}
exports.getTextDocument = getTextDocument;
/**
 * Sets the glob patterns to check for files while grepping.
 * @param globInclude Include pattern
 * @param globExclude Exclude pattern
 */
function setGrepGlobPatterns(globInclude, globExclude) {
    exports.grepGlobInclude = globInclude;
    exports.grepGlobExclude = globExclude;
}
exports.setGrepGlobPatterns = setGrepGlobPatterns;
/**
 * Searches files according to opts.
 * opts includes the directory the glob pattern and the regular expression (the word) to
 * search for.
 * @param regex The regular expression to search for.
 * @param rootFolder The search is limited to the root / project folder. This needs to contain a trailing '/'.
 * @returns An array of the vscode locations of the found expressions.
 */
function grep(regex, rootFolder) {
    return __awaiter(this, void 0, void 0, function* () {
        const allMatches = new Map();
        assert(exports.grepGlobInclude);
        try {
            const uris = yield vscode.workspace.findFiles(exports.grepGlobInclude, exports.grepGlobExclude);
            const docs = vscode.workspace.textDocuments.filter(doc => doc.isDirty);
            for (const uri of uris) {
                // get fileName
                const fileName = uri.fsPath;
                if (fileName.indexOf(rootFolder) < 0)
                    continue; // Skip because path belongs to different project
                // Check if file is opened in editor
                const filePath = fileName;
                let foundDoc = getTextDocument(filePath, docs);
                // Check if file on disk is checked or in vscode
                if (foundDoc) {
                    // Check file in vscode
                    const fileMatches = grepTextDocument(foundDoc, regex);
                    // Add filename to matches
                    for (const match of fileMatches) {
                        match.filePath = fileName;
                    }
                    // Store
                    allMatches.set(fileName, fileMatches);
                }
                else {
                    // Check file on disk
                    let fileMatches = allMatches.get(fileName);
                    // Read
                    const linesData = fs.readFileSync(filePath, { encoding: 'utf-8' });
                    const lines = linesData.split('\n');
                    (0, comments_1.stripAllComments)(lines);
                    const len = lines.length;
                    for (let index = 0; index < len; index++) {
                        const lineContents = lines[index];
                        if (lineContents.length == 0)
                            continue;
                        regex.lastIndex = 0; // If global search is used, make sure it always start at 0
                        const lineMatches = [];
                        do {
                            const match = regex.exec(lineContents);
                            if (!match)
                                break;
                            // Found: get start and end
                            let start = match.index;
                            for (let j = 1; j < match.length; j++) {
                                // This capture group surrounds the start til the searched word begins. It is used to adjust the found start index.
                                if (match[j]) {
                                    // Note: an optional group might be undefined
                                    const i = match[j].length;
                                    start += i;
                                }
                            }
                            const end = match.index + match[0].length;
                            // Make sure that the map entry exists.
                            if (!fileMatches) {
                                fileMatches = [];
                                allMatches.set(fileName, fileMatches);
                            }
                            // Reverse order (useful if names should be replaced later on)
                            lineMatches.unshift({
                                filePath,
                                line: index,
                                start,
                                end,
                                lineContents,
                                match
                            });
                        } while (regex.global); // Note if "g" was specified multiple matches (e.g. for rename) can be found.
                        // Put in global array.
                        if (fileMatches)
                            fileMatches.push(...lineMatches);
                    }
                }
            }
        }
        catch (e) {
            console.log("Error: ", e);
        }
        // Convert matches to vscode locations
        const locations = [];
        for (const [file, matches] of allMatches) {
            // Iterate all matches inside file
            for (const match of matches) {
                const lineNr = match.line;
                let colStart = match.start;
                // Check for dot label
                //if (match.match[1].indexOf('.')>=0)
                //    colStart--; // include the dot
                const colEnd = match.end;
                const startPos = new vscode.Position(lineNr, colStart);
                const endPos = new vscode.Position(lineNr, colEnd);
                const loc = new GrepLocation(vscode.Uri.file(file), new vscode.Range(startPos, endPos), match);
                // store
                locations.push(loc);
            }
        }
        return locations;
    });
}
exports.grep = grep;
/**
 * Greps for multiple regular expressions. E.g. used to search for labels
 * terminated by a ':' and for labels that start on 1rst column.
 * Simply calls 'grep' multiple times.
 * @param regexes Array of regexes.
 * @param rootFolder The search is limited to the root / project folder. This needs to contain a trailing '/'.
 * @return An array with all regex search results.
 */
function grepMultiple(regexes, rootFolder) {
    return __awaiter(this, void 0, void 0, function* () {
        let allLocations = [];
        // grep all regex
        for (const regex of regexes) {
            const locations = yield grep(regex, rootFolder);
            // Add found locations
            allLocations.push(...locations);
        }
        // Remove double entries
        if (regexes.length > 0) {
            allLocations = removeDuplicates(allLocations, loc => {
                const fm = loc.fileMatch;
                const s = fm.filePath + ':' + fm.line + ':' + fm.start;
                return s;
            });
        }
        // Return all
        return allLocations;
    });
}
exports.grepMultiple = grepMultiple;
/**
 * Searches a vscode.TextDocument for a regular expression and
 * returns the found line numbers.
 * @param doc The TextDocument.
 * @returns An array that contains: line number, start column, end column, and the text of the line.
 */
function grepTextDocument(doc, regex) {
    const matches = [];
    const len = doc.lineCount;
    // Strip all comments
    const lines = Array(len);
    for (let i = 0; i < len; i++) {
        const textLine = doc.lineAt(i);
        lines[i] = textLine.text;
    }
    (0, comments_1.stripAllComments)(lines);
    // Go through all lines
    for (let line = 0; line < len; line++) {
        const lineContents = lines[line];
        regex.lastIndex = 0; // If global search is used, make sure it always start at 0
        do {
            const match = regex.exec(lineContents);
            if (!match)
                break;
            // Found: get start and end
            let start = match.index;
            for (let j = 1; j < match.length; j++) {
                // This capture group surrounds the start til the searched word begins. It is used to adjust the found start index.
                if (match[j]) {
                    // Note: an optional group might be undefined
                    const i = match[j].length;
                    start += i;
                }
            }
            const end = match.index + match[0].length;
            // Store found result
            matches.push({
                filePath: undefined,
                line,
                start,
                end,
                lineContents,
                match
            });
        } while (regex.global); // Note if "g" was specified multiple matches (e.g. for rename) can be found.
    }
    return matches;
}
exports.grepTextDocument = grepTextDocument;
/**
 * Greps for multiple regexes in the text document.
 * Simply calls grepTextDocument several times.
 * @param doc The document to search.
 * @param regexes An array of regular expressions.
 * @return An array with all matches.
 */
function grepTextDocumentMultiple(doc, regexes) {
    const allMatches = [];
    // grep all regex
    for (const regex of regexes) {
        // grep doc
        const fileMatches = grepTextDocument(doc, regex);
        // Add found matches
        allMatches.push(...fileMatches);
    }
    // Return all
    return allMatches;
}
exports.grepTextDocumentMultiple = grepTextDocumentMultiple;
/**
 * Returns the last portion of a label.
 * @param label  E.g. 'explosion.init' or 'check_all'
 * @return E.g. 'init' or 'check_all'.
 */
function getLastLabelPart(label) {
    const k = label.indexOf('.');
    if (k < 0)
        return label; // No dot.
    return label.substring(k + 1);
}
exports.getLastLabelPart = getLastLabelPart;
/**
 * Converts the given label into a regular expression.
 * Changes the last part of the label into a regex that
 * allows various other letters in between.
 * E.g. 'sound.initial' will become 'sound.\\w*i\\w*n\\w*i\\w*t\\w*a\\w*l\\w*
 * so that the regular exception would also match if not all
 * characters are in the right order.
 * E.g. this would match: 'sound.initialize'.
 * @param label  E.g. 'explosion.init' or 'check_all'
 * @return E.g. 'explosion.\\w*i\\w*n\\w*i\\w*t\\w*'or
 * '\\w*c\\w*h\\w*e\\w*c\\w*k\\w*_\\w*a\\w*l\\w*l\\w*'
 */
function getRegExFromLabel(label) {
    // Get last portion
    let prefix;
    let lastPart;
    const k = label.indexOf('.');
    if (k < 0) {
        // No dot
        prefix = '';
        lastPart = label;
    }
    else {
        // Includes dot
        prefix = label.substring(0, k + 1);
        lastPart = label.substring(k + 1);
    }
    // Change last part
    const lastRegexStr = (0, regexes_1.regexPrepareFuzzy)(lastPart) + '\\w*';
    let regexStr = prefix.replace(/(\.)/g, '\\.'); // Make sure to convert . to \. for regular expression.
    regexStr += lastRegexStr;
    // Return
    const regex = new RegExp(regexStr, 'i');
    return regex;
}
exports.getRegExFromLabel = getRegExFromLabel;
/**
 * Concatenates a module and a label.
 * @param module E.g. 'sound.effects'.
 * @param label  E.g. 'explosion'
 * @return E.g. sound.effects.explosion. If module is undefined or an empty string then label is returned unchanged.
 */
function concatenateModuleAndLabel(module, label) {
    if (!module)
        return label;
    if (module.length == 0)
        return label;
    const mLabel = module + '.' + label;
    return mLabel;
}
/**
 * Returns the label and the module label (i.e. module name + label) for a given
 * file and position.
 * The file may be on disk or opened in the editor.
 * 1. The original label is constructed from the document and position info.
 * 2. If local label: The document is parsed from position to begin for a non-local label.
 * 3. The document is parsed from begin to position for 'MODULE' info.
 * 4. The MODULE info is added to the original label (this is now the searchLabel).
 * 4. Both are returned.
 * @param fileName The filename of the document.
 * @param pos The position that points to the label.
 * @param documents All dirty vscode.TextDocuments.
 * @returns { label, module.label }
 */
function getLabelAndModuleLabel(fileName, pos, documents, regexEnd = /[\w\.]/) {
    // Get line/column
    const row = pos.line;
    const clmn = pos.character;
    // Check if file is opened in editor
    const filePath = fileName;
    let foundDoc = getTextDocument(filePath, documents);
    let lines;
    // Different handling: open text document or file on disk
    if (foundDoc) {
        // Doc is opened in text editor (and dirty).
        lines = foundDoc.getText().split('\n');
    }
    else {
        // Doc is read from disk.
        const linesData = fs.readFileSync(filePath, { encoding: 'utf-8' });
        lines = linesData.split('\n');
    }
    // 1. Get original label
    const line = lines[row];
    let { label, preString } = getCompleteLabel(line, clmn, regexEnd);
    // 2. If local label: The document is parsed from position to begin for a non-local label.
    if (label.startsWith('.')) {
        // Local label, e.g. ".loop"
        const nonLocalLabel = getNonLocalLabel(lines, row);
        label = nonLocalLabel + label;
    }
    // 3. The document is parsed from begin to 'pos' for 'MODULE' info.
    const module = getModule(lines, row);
    // 4. The MODULE info is added to the original label
    const moduleLabel = concatenateModuleAndLabel(module, label);
    // Check that no character is preceding the label.
    if (preString.length == 0) {
        // It's the definition of a label, so moduleLabel is the only possible label.
        label = moduleLabel;
    }
    return { label, moduleLabel };
}
exports.getLabelAndModuleLabel = getLabelAndModuleLabel;
/**
 * Reduces the number of found 'locations'. Is used to get rid of wrong references
 * by checking the dot notation/module label.
 * 1. Get the module-label (=searchLabel).
 * 2. Get the module-labels for each found location and the corresponding file.
 * 3. 'searchLabel' is compared with all labels.
 * 4. If 'searchLabel' is not equal to the direct label and not equal to the
 *    concatenated label it is removed from 'locations'
 * @param locations An array with found locations of grepped labels.
 * @param document The document of the original label.
 * @param position The position inside the document with the original label.
 * @param removeOwnLocation true (default) to remove the location of the searched word.
 * @param checkFullName true (default) = During label check the full name is checked. false (e.g.
 * for CompletionProvider) = It is checked with 'startsWith'.
 */
function reduceLocations(locations, docFileName, position, removeOwnLocation = true, checkFullName = true, regexEnd = /[\w\.]/) {
    return __awaiter(this, void 0, void 0, function* () {
        const docs = vscode.workspace.textDocuments.filter(doc => doc.isDirty);
        // 1. Get module label
        const searchLabel = getLabelAndModuleLabel(docFileName, position, docs, regexEnd);
        // For item completion:
        let regexLabel;
        let regexModuleLabel;
        // Check for full name
        if (!checkFullName) {
            // Do not care
            //searchLabel.label = searchLabel.label.toLowerCase();
            //searchLabel.moduleLabel = searchLabel.moduleLabel.toLowerCase();
            regexLabel = getRegExFromLabel(searchLabel.label);
            regexModuleLabel = getRegExFromLabel(searchLabel.moduleLabel);
        }
        // Copy locations
        let redLocs = [...locations];
        // 2. Get the module-labels for each found location and the corresponding file.
        let i = redLocs.length;
        //let removedSameLine = -1;
        while (i--) { // loop backwards
            // get fileName
            const loc = redLocs[i];
            const fileName = loc.uri.fsPath;
            const pos = loc.range.start;
            // Check if same location as searchLabel.
            if (removeOwnLocation
                && pos.line == position.line
                && fileName == fileName) {
                // Remove also this location
                redLocs.splice(i, 1);
                // Remember
                //removedSameLine = i;
                continue;
            }
            const mLabel = getLabelAndModuleLabel(fileName, pos, docs, regexEnd);
            // Assign to location
            loc.label = mLabel.label;
            loc.moduleLabel = mLabel.moduleLabel;
            // 3. 'searchLabel' is compared with all labels.
            if (checkFullName) {
                if (mLabel.label == searchLabel.label
                    || mLabel.moduleLabel == searchLabel.moduleLabel
                    || mLabel.moduleLabel == searchLabel.label
                    || mLabel.label == searchLabel.moduleLabel)
                    continue; // Please note: the test is ambiguous. There might be situations were this is wrong.
            }
            else {
                // Compare regular expressions to catch also scrambled input.
                if (regexLabel.exec(mLabel.label)
                    || regexModuleLabel.exec(mLabel.moduleLabel)
                    || regexLabel.exec(mLabel.moduleLabel)
                    || regexModuleLabel.exec(mLabel.label))
                    continue;
            }
            // 4. If 'searchLabel' is not equal to the direct label and not equal to the
            //    concatenated label it is removed from 'locations'
            redLocs.splice(i, 1); // delete
        }
        // Return.
        // If reduced locations has removed too much (all) then fall back to the original array.
        // This can e.g. happen for STRUCT fields.
        /*
        if(redLocs.length == 0) {
            // Copy again.
            redLocs = [...locations];
            // But remove the searchLabel
            if(removedSameLine >= 0)
                redLocs.splice(removedSameLine,1)
        }
        */
        // Remove all duplicates from the list:
        const uniqueLocations = redLocs; // removeDuplicates(redLocs, loc => loc.moduleLabel);
        return uniqueLocations;
    });
}
exports.reduceLocations = reduceLocations;
/**
 * Searches 'lines' from 'index' to 0 and returns the
 * first non local label.
 * @param lines An array of strings containing the complete text.
 * @param index The starting line (the line where the label was found.
 * @returns A string like 'check_collision'. undefined if nothing found.
 */
function getNonLocalLabel(lines, index) {
    // Find all "something:" (labels)
    const regex = /^\s*\b([a-z_][\w\.]*):/i;
    // Find all sjasmplus labels without ":"
    const regex2 = /^([a-z_][\w\.]*)\b(?!:)/i;
    // Loop
    let match;
    for (; index >= 0; index--) {
        const line = lines[index];
        match = regex.exec(line);
        if (match)
            break;
        match = regex2.exec(line);
        if (match)
            break;
    }
    // Out of bounds check
    if (!match)
        return undefined;
    // Return
    const label = match[1];
    return label;
}
exports.getNonLocalLabel = getNonLocalLabel;
/**
 * Searches 'lines' from beginning to 'len' and returns the (concatenated)
 * module label.
 * 'lines' are searched for 'MODULE' and 'ENDMODULE' to retrieve the module information.
 * Additional searches for STRUCTs and treats them in the same way.
 * @param lines An array of strings containing the complete text.
 * @param len The line number up to which it will be searched. (excluding)
 * @returns A string like 'audio.samples'.
 */
function getModule(lines, len) {
    const regexModule = (0, regexes_1.regexModuleStruct)();
    const regexEndmodule = (0, regexes_1.regexEndModuleStruct)();
    const modules = [];
    for (let row = 0; row < len; row++) {
        const lineContents = lines[row];
        // MODULE
        const matchModule = regexModule.exec(lineContents);
        if (matchModule) {
            modules.push(matchModule[2]);
            continue;
        }
        // ENDMODULE
        const matchEndmodule = regexEndmodule.exec(lineContents);
        if (matchEndmodule) {
            modules.pop();
            //continue; // Is last statement anyway
        }
    }
    // Create module label
    const mLabel = modules.join('.');
    return mLabel;
}
exports.getModule = getModule;
/**
 * Returns the complete label around the 'startIndex'.
 * I.e. startIndex might point to the last part of the label then this
 * function returns the complete label.
 * @param lineContents The text of the line.
 * @param startIndex The index into the label.
 * @param regexEnd Defaults to /[\w\.]/ . I.e. the label is returned with all subparts.
 * Note: The HoverProvider might use /\w/ so that the sub parts are not returned.
 * @returns {label, preString} The found label and the part of the string that
 * is found before 'label'.
 */
function getCompleteLabel(lineContents, startIndex, regexEnd = /[\w\.]/) {
    // Find end of label.
    const len = lineContents.length; // REMARK: This can lead to error: "length of undefined"
    let k;
    for (k = startIndex; k < len; k++) {
        const s = lineContents.charAt(k);
        // Allow [a-z0-9_]
        const match = regexEnd.exec(s);
        if (!match)
            break;
    }
    // k points now after the label
    // Find start of label.
    let i;
    for (i = startIndex - 1; i >= 0; i--) {
        const s = lineContents.charAt(i);
        // Allow [a-z0-9_.]
        const match = /[\w\.]/.exec(s);
        if (!match)
            break;
    }
    // i points one before the start of the label
    i++;
    // Get complete string
    const label = lineContents.substring(i, k);
    const preString = lineContents.substring(0, i);
    return { label, preString };
}
exports.getCompleteLabel = getCompleteLabel;
/**
 * Prints out all found locations.
 * @param locs The locations.
 *
 */
function dbgPrintLocations(locs) {
    for (let loc of locs) {
        console.log(loc.symbol + ': ' + loc.label + ', ' + loc.moduleLabel);
    }
}
exports.dbgPrintLocations = dbgPrintLocations;
//# sourceMappingURL=grep.js.map