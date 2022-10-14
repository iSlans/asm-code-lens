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
exports.Commands = void 0;
const vscode = require("vscode");
const path = require("path");
const grep_1 = require("./grep");
const regexes_1 = require("./regexes");
/// Output to the vscode "OUTPUT" tab.
let output = vscode.window.createOutputChannel("ASM Code Lens");
/**
 * Static user command functions.
 * - findLabelsWithNoReference: Searches all labels and shows the ones that are not referenced.
 */
class Commands {
    /**
     * Searches all labels and shows the ones that are not referenced.
     * @param config The configuration (preferences) to use.
     * (config.rootFolder The search is limited to the root / project
     * folder. This needs to contain a trailing '/'.)
     */
    static findLabelsWithNoReference(config) {
        return __awaiter(this, void 0, void 0, function* () {
            // Get regexes
            const regexes = (0, regexes_1.regexesLabel)(config);
            // Get all label definition (locations)
            const labelLocations = yield (0, grep_1.grepMultiple)(regexes, config.rootFolder);
            //dbgPrintLocations(locations);
            // locations is a GrepLocation array that contains all found labels.
            // Convert this to an array of labels.
            this.findLabels(labelLocations, config.rootFolder);
        });
    }
    /**
     * Finds all labels without reference.
     * I.e. prints out all labels in 'locLabels' which are note referenced somewhere.
     * @param locLabels A list of GrepLocations.
     * @param rootFolder The search is limited to the root / project folder. This needs to contain a trailing '/'.
     */
    static findLabels(locLabels, rootFolder) {
        return __awaiter(this, void 0, void 0, function* () {
            const baseName = path.basename(rootFolder);
            output.appendLine("Unreferenced labels, " + baseName + ":");
            output.show(true);
            try {
                let labelsCount = locLabels.length;
                let unrefLabels = 0;
                const regexEqu = (0, regexes_1.regexLabelEquOrMacro)();
                for (const locLabel of locLabels) {
                    // Skip all EQU and MACRO
                    const fm = locLabel.fileMatch;
                    regexEqu.lastIndex = fm.match[1].length;
                    const matchEqu = regexEqu.exec(fm.lineContents);
                    if (matchEqu) {
                        labelsCount--;
                        // output.appendLine("labelCount="+labelsCount);
                        if (labelsCount == 0)
                            output.appendLine("Done. " + unrefLabels + ' unreferenced label' + ((unrefLabels > 1) ? 's' : '') + ".");
                        continue;
                    }
                    // Get label
                    const label = fm.match[2];
                    const searchLabel = label.replace(/\./, '\\.');
                    const pos = new vscode.Position(fm.line, fm.start);
                    const fileName = fm.filePath;
                    // And search for references
                    const regex = (0, regexes_1.regexAnyReferenceForWord)(searchLabel);
                    const locations = yield (0, grep_1.grep)(regex, rootFolder);
                    // Remove any locations because of module information (dot notation)
                    const reducedLocations = yield (0, grep_1.reduceLocations)(locations, fileName, pos, true, false);
                    // Check count
                    const count = reducedLocations.length;
                    if (count == 0) {
                        // No reference
                        unrefLabels++;
                        output.appendLine(label + ", file://" + fileName + "#" + (pos.line + 1));
                    }
                    // Check for last search
                    labelsCount--;
                    // output.appendLine("labelCount="+labelsCount);
                    if (labelsCount == 0)
                        output.appendLine("Done. " + unrefLabels + ' unreferenced label' + ((unrefLabels > 1) ? 's' : '') + ".");
                }
            }
            catch (e) {
                console.log("Error: ", e);
            }
            // Check if any label is unreferenced
            if (locLabels.length == 0)
                output.appendLine("None.");
            output.appendLine('');
        });
    }
}
exports.Commands = Commands;
//# sourceMappingURL=Commands.js.map