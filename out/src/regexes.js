"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.regexEveryMacroForWord = exports.regexEveryModuleForWord = exports.regexesEveryLabelForWord = exports.regexEveryLabelWithoutColonForWord = exports.regexEveryLabelColonForWord = exports.regexPrepareFuzzy = exports.regexAnyReferenceForWordGlobal = exports.regexAnyReferenceForWord = exports.regexStructForWord = exports.regexMacroForWord = exports.regexModuleForWord = exports.regexesLabelForWord = exports.regexLabelWithoutColonForWord = exports.regexLabelColonForWord = exports.regexEndModuleStruct = exports.regexModuleStruct = exports.regexInclude = exports.regexLabelEquOrMacro = exports.regexesLabel = exports.regexLabelWithoutColon = exports.regexLabelColon = void 0;
/**
 * Checks for a label with a colon, e.g.
 * "label:", " label:" or "init.label_1:".
 * Also "@label:".
 * But not ".label:".
 * Capture groups:
 *  1 = preceding spaces
 *  2 = the label itself e.g. "init.label_1
 * Used by findLabelsWithNoReference, provideCodeLenses.
 */
function regexLabelColon() {
    return /(^\s*@?)\b([a-z_][\w\.]*):/i;
}
exports.regexLabelColon = regexLabelColon;
/**
 * Checks for a label without a colon, i.e. a
 * label used by sjasmplus.
 * E.g. "label" or "init.label_1".
 * Also "@label".
 * But not ".label".
 * Capture groups:
 *  1 = ''
 *  2 = the label itself e.g. "init.label_1"
 * Used by findLabelsWithNoReference, provideCodeLenses.
 */
function regexLabelWithoutColon() {
    return /^(@?)([a-z_][\w\.]*)(?:\s|$)/i;
    //return /^()([a-z_][\w\.]*)\b(?![:\.])/i;
}
exports.regexLabelWithoutColon = regexLabelWithoutColon;
/**
 * Returns an array of regexes with 1 or 2 regexes.
 * @param labelsWithColons Add regex with colons
 * @param labelsWithoutColons Add regex without colons
 */
function regexesLabel(cfg) {
    const regexes = [];
    // Find all "some.thing:" (labels) in the document
    if (cfg.labelsWithColons) {
        const searchRegex = regexLabelColon();
        regexes.push(searchRegex);
    }
    // Find all sjasmplus labels without ":" in the document
    if (cfg.labelsWithoutColons) {
        const searchRegex2 = regexLabelWithoutColon();
        regexes.push(searchRegex2);
    }
    return regexes;
}
exports.regexesLabel = regexesLabel;
/**
 * Checks for a label followed by MACRO or EQU.
 * E.g. "label: MACRO" or "label2: equ" or "label equ".
 * Capture groups:
 *  None.
 * Used by findLabelsWithNoReference.
 */
function regexLabelEquOrMacro() {
    return /^[\w\.]+:?\s*\b(equ|macro)/i;
}
exports.regexLabelEquOrMacro = regexLabelEquOrMacro;
/**
 * Checks for an INCLUDE directive.
 * E.g. 'include "something"' or ' include "something"'.
 * Capture groups:
 *  1 = what is included, i.e. what is inside the ""
 * Used by DefinitionProvider, RenameProvider.
 */
function regexInclude() {
    return /\s*INCLUDE\s+"(.*)"/i;
}
exports.regexInclude = regexInclude;
/**
 * Checks for a MODULE or STRUCT directive.
 * Used by getModule.
 */
function regexModuleStruct() {
    return /^\s+(MODULE|STRUCT)\s+([\w\.]+)/i;
}
exports.regexModuleStruct = regexModuleStruct;
/**
 * Checks for a ENDMODULE or ENDS directive.
 * Used by getModule.
 */
function regexEndModuleStruct() {
    return /^\s+(ENDMODULE|ENDS)\b/i;
}
exports.regexEndModuleStruct = regexEndModuleStruct;
/**
 * Searches for labels that contain the given word.
 * Checks for a label with a colon.
 * Capture groups:
 *  1 = preceding characters before 'searchWord'.
 * Used by DefinitionProvider.
 */
function regexLabelColonForWord(searchWord) {
    return new RegExp('^(\\s*)([^0-9\\s][\\w\\.]*)?\\b' + searchWord + ':');
}
exports.regexLabelColonForWord = regexLabelColonForWord;
/**
 * Searches for labels that contains the given word.
 * Checks for a label without a colon.
 * Capture groups:
 *  1 = preceding characters before 'searchWord'.
 * Used by DefinitionProvider.
 */
function regexLabelWithoutColonForWord(searchWord) {
    return new RegExp('^()([^0-9\\s][\\w\\.]*)?\\b' + searchWord + '\\b(?![:\\.])');
}
exports.regexLabelWithoutColonForWord = regexLabelWithoutColonForWord;
/**
 * Returns an array of regexes with 1 or 2 regexes.
 * @param labelsWithColons Add regex with colons
 * @param labelsWithoutColons Add regex without colons
 */
function regexesLabelForWord(searchWord, cfg) {
    const regexes = [];
    // Find all "some.thing:" (labels) in the document
    if (cfg.labelsWithColons) {
        const searchRegex = regexLabelColonForWord(searchWord);
        regexes.push(searchRegex);
    }
    // Find all sjasmplus labels without ":" in the document
    if (cfg.labelsWithoutColons) {
        const searchRegex2 = regexLabelWithoutColonForWord(searchWord);
        regexes.push(searchRegex2);
    }
    return regexes;
}
exports.regexesLabelForWord = regexesLabelForWord;
/**
 * Searches for a (sjasmplus) MODULE that contains the given word.
 * Capture groups:
 *  1 = preceding characters before 'searchWord'.
 * Used by DefinitionProvider.
 */
function regexModuleForWord(searchWord) {
    return new RegExp('^(\\s+(module|MODULE)\\s+)' + searchWord + '\\b');
}
exports.regexModuleForWord = regexModuleForWord;
/**
 * Searches for a (sjasmplus) MACRO that contains the given word.
 * Capture groups:
 *  1 = preceding characters before 'searchWord'.
 * Used by DefinitionProvider.
 */
function regexMacroForWord(searchWord) {
    return new RegExp('^(\\s+(macro|MACRO)\\s+)' + searchWord + '\\b');
}
exports.regexMacroForWord = regexMacroForWord;
/**
 * Searches for a (sjasmplus) STRUCT that contains the given word.
 * Capture groups:
 *  1 = preceding characters before 'searchWord'.
 * Used by DefinitionProvider.
 */
function regexStructForWord(searchWord) {
    return new RegExp('^(\\s+(struct|STRUCT)\\s+)' + searchWord + '\\b');
}
exports.regexStructForWord = regexStructForWord;
/**
 * Searches any reference for a given word (label).
 * Capture groups:
 *  1 = preceding characters before 'searchWord'.
 * Used by resolveCodeLens.
 */
function regexAnyReferenceForWord(searchWord) {
    return new RegExp('^(.*)\\b' + searchWord + '\\b');
}
exports.regexAnyReferenceForWord = regexAnyReferenceForWord;
/**
 * Searches any reference for a given word (label).
 * Capture groups:
 *  1 = preceding characters before 'searchWord'.
 * Used by RenameProvider.
 */
function regexAnyReferenceForWordGlobal(searchWord) {
    return new RegExp('(.*?)\\b' + searchWord + '\\b', 'g');
}
exports.regexAnyReferenceForWordGlobal = regexAnyReferenceForWordGlobal;
/**
 * Prepares a string for fuzzy search.
 * I.e. allows to input a string like "snd" and it will find
 * with a regular expression also "sound", "sounds", "snd" etc.
 * but not e.g. "sn".
 * Used by CompletionProposalsProvider.
 */
function regexPrepareFuzzy(searchWord) {
    const replaced = searchWord.replace(/(.)/g, '\\w*$1');
    return replaced;
}
exports.regexPrepareFuzzy = regexPrepareFuzzy;
/**
 * Searches for labels that contains the given word.
 * Checks for a label with a colon.
 * The label can be everywhere. I.e. it can be a middle part of a dot
 * notated label.
 * Capture groups:
 *  1 = preceding characters before 'searchWord'.
 * Used by CompletionProposalsProvider.
 */
function regexEveryLabelColonForWord(searchWord) {
    return new RegExp('^(\\s*[\\w\\.]*)\\b' + searchWord + '[\\w\\.]*:', 'i');
}
exports.regexEveryLabelColonForWord = regexEveryLabelColonForWord;
/**
 * Searches for labels that contains the given word.
 * Checks for a label without a colon.
 * The label can be everywhere. I.e. it can be a middle part of a dot
 * notated label.
 * Capture groups:
 *  1 = preceding characters before 'searchWord'.
 * Used by CompletionProposalsProvider.
 */
function regexEveryLabelWithoutColonForWord(searchWord) {
    //searchWord=searchWord.replace(/\./g, '\\.');
    return new RegExp('^(([^0-9 ][\\w\\.]*)?)\\b' + searchWord + '[\\w\\.]*\\b(?![:\\w\\.])', 'i');
}
exports.regexEveryLabelWithoutColonForWord = regexEveryLabelWithoutColonForWord;
/**
 * Returns an array of regexes with 1 or 2 regexes.
 * @param labelsWithColons Add regex with colons
 * @param labelsWithoutColons Add regex without colons
 */
function regexesEveryLabelForWord(searchWord, cfg) {
    const regexes = [];
    // Find all "some.thing:" (labels) in the document
    if (cfg.labelsWithColons) {
        const searchRegex = regexEveryLabelColonForWord(searchWord);
        regexes.push(searchRegex);
    }
    // Find all sjasmplus labels without ":" in the document
    if (cfg.labelsWithoutColons) {
        const searchRegex2 = regexEveryLabelWithoutColonForWord(searchWord);
        regexes.push(searchRegex2);
    }
    return regexes;
}
exports.regexesEveryLabelForWord = regexesEveryLabelForWord;
/**
 * Searches for a (sjasmplus) MODULE that contains the given word.
 * The label can be everywhere. I.e. it can be a middle part of a dot
 * notated label.
 * Capture groups:
 *  1 = preceding characters before 'searchWord'.
 * Used by CompletionProposalsProvider.
 */
function regexEveryModuleForWord(searchWord) {
    return new RegExp('^(\\s+(MODULE)\\s+)' + searchWord + '[\\w\\.]*', 'i');
}
exports.regexEveryModuleForWord = regexEveryModuleForWord;
/**
 * Searches for a (sjasmplus) MACRO that contains the given word.
 * The label can be everywhere. I.e. it can be a middle part of a dot
 * notated label.
 * Capture groups:
 *  1 = preceding characters before 'searchWord'.
 * Used by CompletionProposalsProvider.
 */
function regexEveryMacroForWord(searchWord) {
    return new RegExp('^(\\s+(MACRO)\\s+)' + searchWord + '[\\w\\.]*', 'i');
}
exports.regexEveryMacroForWord = regexEveryMacroForWord;
//# sourceMappingURL=regexes.js.map