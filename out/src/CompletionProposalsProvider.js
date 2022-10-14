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
exports.CompletionProposalsProvider = void 0;
const vscode = require("vscode");
const grep_1 = require("./grep");
const regexes_1 = require("./regexes");
const packageinfo_1 = require("./whatsnew/packageinfo");
/// All additional completions like Z80 instructions and assembler
/// directives etc.
const completions = [
    // Z80 registers
    'a', 'b', 'c', 'd', 'e', 'h', 'l',
    'af', 'bc', 'de', 'hl', 'ix', 'iy', 'sp',
    'ixl', 'ixh', 'iyl', 'iyh',
    // Z80 instructions
    'adc', 'add', 'and', 'bit', 'call', 'ccf', 'cp', 'cpd',
    'cpdr', 'cpi', 'cpir', 'cpl', 'daa', 'dec', 'di', 'ei',
    'djnz', 'ex', 'exx', 'halt', 'im', 'inc', 'in', 'ind',
    'indr', 'ini', 'inir', 'jp', 'jr', 'ld', 'ldd', 'lddr',
    'ldi', 'ldir', 'neg', 'nop', 'or', 'otdr', 'otir', 'out',
    'outd', 'outi', 'pop', 'push', 'res', 'ret', 'reti', 'retn',
    'rl', 'rla', 'rlc', 'rlca', 'rld', 'rr', 'rra', 'rrc',
    'rrca', 'rrd', 'rst', 'sbc', 'scf', 'set', 'sla', 'slia',
    'sll', 'swap', 'sra', 'srl', 'sub', 'xor',
    // Z80N instructions
    'ldix', 'ldws', 'ldirx', 'lddx', 'lddrx', 'ldpirx',
    'outinb', 'mul', 'swapnib', 'mirror', 'nextreg',
    'pixeldn', 'pixelad', 'setae', 'test',
    'bsla', 'bsra', 'bsrl', 'bsrf', 'brlc',
    // sjasmplus fake instructions
    'sli',
    // sjasmplus
    'macro', 'endm', 'module', 'endmodule', 'struct', 'ends', 'dup', 'edup',
    'if', 'ifn', 'ifdef', 'ifndef', 'ifused', 'ifnused', 'else', 'endif',
    'include', 'incbin',
    'abyte', 'abytec', 'abytez', 'align', 'assert',
    'binary', 'block', 'defb', 'defd', 'defg', 'defh', 'defl', 'defm', 'defs', 'defw', 'dephase', 'disp', 'phase', 'unphase',
    'd24', 'db', 'dc', 'dd', 'dg', 'dh', 'hex', 'dm', 'ds', 'dw', 'dz',
    'display', 'byte', 'word', 'dword',
    'emptytap', 'emptytrd', 'encoding',
    'equ', 'export',
    'end', 'endlua', 'endt', 'ent',
    'includelua', 'inchob', 'inctrd', 'insert',
    'lua', 'labelslist', 'org', 'outend', 'output',
    'memorymap', 'mmu',
    'page', 'rept', 'endr', 'savebin', 'savedev', 'savehob', 'savesna', 'savetrd',
    'savetap', 'basic', 'code', 'numbers', 'chars', 'headless',
    'savenex', 'core', 'cfg', 'cfg3', 'bar', 'palette', 'default', 'mem', 'bmp', 'screen',
    'l2', 'l2_320', 'l2_640', 'scr', 'shc', 'shr', 'tile', 'cooper', 'bank', 'auto',
    'shellexec', 'size', 'slot',
    'tapend', 'tapout',
    'textarea',
    'define', 'undefine',
    'defarray', 'defarray+',
    'device', 'ZXSPECTRUM48', 'ZXSPECTRUM128', 'ZXSPECTRUM256', 'ZXSPECTRUM512', 'ZXSPECTRUM1024', 'ZXSPECTRUM2048', 'ZXSPECTRUM4096', 'ZXSPECTRUM8192', 'ZXSPECTRUMNEXT', 'NONE', 'ramtop',
    'open', 'close',
    'setbp', 'setbreakpoint',
    'bplist', 'unreal', 'zesarux',
    'opt', 'cspectmap', 'fpos',
    '_sjasmplus', '_version', '_release', '_errors', '_warnings'
];
/**
 * CompletionItemProvider for assembly language.
 */
class CompletionProposalsProvider {
    /**
     * Constructor.
     * @param config The configuration (preferences) to use.
     */
    constructor(config) {
        // Store
        this.config = config;
    }
    /**
     * Called from vscode if the user selects "Find all references".
     * @param document The current document.
     * @param position The position of the word for which the references should be found.
     * @param token
     */
    provideCompletionItems(document, position, token) {
        return __awaiter(this, void 0, void 0, function* () {
            // First check for right path
            const docPath = document.uri.fsPath;
            if (!docPath.includes(this.config.rootFolder))
                return undefined; // Path is wrong.
            // Get required length
            const settings = packageinfo_1.PackageInfo.getConfiguration();
            let requiredLen = settings.completionsRequiredLength;
            if (requiredLen == undefined || requiredLen < 1)
                requiredLen = 1;
            const line = document.lineAt(position).text;
            const { label } = (0, grep_1.getCompleteLabel)(line, position.character);
            //console.log('provideCompletionItems:', label);
            let len = label.length;
            if (label.startsWith('.'))
                len--; // Require one more character for local labels.
            if (len < requiredLen)
                return new vscode.CompletionList([new vscode.CompletionItem(' ')], false); // A space is required, otherwise vscode will not ask again for completion items.
            // Search proposals
            return this.propose(document, position);
        });
    }
    /**
     * Proposes a list of labels etc.
     * @param document The document that contains the word.
     * @param position The word position.
     */
    propose(document, position) {
        return __awaiter(this, void 0, void 0, function* () {
            // Get all lines
            const lines = document.getText().split('\n');
            // Get the module at the line of the searched word.
            const row = position.line;
            const moduleLabel = (0, grep_1.getModule)(lines, row);
            // Get the range of the whole input label.
            // Otherwise vscode takes only the part after the last dot.
            const lineContents = lines[row];
            const { label, preString } = (0, grep_1.getCompleteLabel)(lineContents, position.character);
            const start = preString.length;
            const end = start + label.length;
            const range = new vscode.Range(new vscode.Position(row, start), new vscode.Position(row, end));
            //console.log('Completions for: '+ label);
            // Get the first non-local label
            let nonLocalLabel; // Only used for local labels
            if (label.startsWith('.')) {
                nonLocalLabel = (0, grep_1.getNonLocalLabel)(lines, row);
            }
            // Search
            let searchWord = document.getText(document.getWordRangeAtPosition(position));
            searchWord = (0, regexes_1.regexPrepareFuzzy)(searchWord);
            // regexes for labels with and without colon
            const regexes = (0, regexes_1.regexesEveryLabelForWord)(searchWord, this.config);
            // Find all sjasmplus MODULEs in the document
            const searchSjasmModule = (0, regexes_1.regexEveryModuleForWord)(searchWord);
            regexes.push(searchSjasmModule);
            // Find all sjasmplus MACROs in the document
            const searchSjasmMacro = (0, regexes_1.regexEveryMacroForWord)(searchWord);
            regexes.push(searchSjasmMacro);
            const locations = yield (0, grep_1.grepMultiple)(regexes, this.config.rootFolder);
            // Reduce the found locations.
            const reducedLocations = yield (0, grep_1.reduceLocations)(locations, document.fileName, position, true, false);
            // Now put all proposal texts in a map. (A map to make sure every item is listed only once.)
            const proposals = new Map();
            // Get number of dots
            //const dotCount = label.split('.').length-1;
            // Go through all found locations
            for (const loc of reducedLocations) {
                const text = loc.moduleLabel;
                if (this.config.labelsExcludes.includes(text))
                    continue; // Skip if excluded
                /*
                Alternative implementation that only proposes completion up to the next dot:
                const fullText = loc.moduleLabel;
                // Reduce text to match number of columns
                const textArr = fullText.split('.');
                let text = textArr[0];
                for (let i = 1; i <= dotCount; i++) {
                    text += '.' + textArr[i];
                }
                */
                //console.log('');
                //console.log('Proposal:', text);
                const item = new vscode.CompletionItem(text, vscode.CompletionItemKind.Function);
                item.filterText = text;
                item.range = range;
                // Check for local label
                if (nonLocalLabel) {
                    // A previous non-local label was searched (and found), so label is local.
                    item.filterText = label;
                    // Change insert text
                    let k = moduleLabel.length;
                    if (k > 0)
                        k++; // For the dot '.'
                    k += nonLocalLabel.length;
                    let part = text.substring(k);
                    item.insertText = part;
                    // change shown text
                    item.label = part;
                    // And filter text
                    item.filterText = part;
                }
                // Maybe make the label local to current module.
                else if (text.startsWith(moduleLabel + '.')) {
                    // Change insert text
                    const k = moduleLabel.length + 1;
                    let part = text.substring(k);
                    item.insertText = part;
                    // change shown text
                    item.label = '[' + text.substring(0, k) + '] ' + part;
                }
                proposals.set(item.label, item);
            }
            // Create list from map
            const propList = Array.from(proposals.values());
            // Check if word includes a dot
            let allCompletions;
            let k = label.lastIndexOf('.');
            if (k < 0) {
                // No dot.
                // Check if word starts with a capital letter
                const upperCase = (label[0] == label[0].toUpperCase());
                // Add the instruction proposals
                let i = 0;
                allCompletions = completions.map(text => {
                    if (upperCase)
                        text = text.toUpperCase();
                    const item = new vscode.CompletionItem(text, vscode.CompletionItemKind.Function);
                    item.sortText = i.toString(); // To make sure they are shown at first.
                    i++;
                    item.range = range;
                    return item;
                });
                // Add grepped words
                allCompletions.push(...propList);
            }
            else {
                // Simply use grepped list.
                allCompletions = propList;
            }
            // Return.
            // false: In fact the 'false' means that the list is not incomplete,
            // i.e. it is complete. vscode will not call completion
            // anymore if not something bigger chances.
            // So, in fact only for the first character the completion list
            // is build. vscode filters this list on its own.
            const completionList = new vscode.CompletionList(allCompletions, false);
            return completionList;
        });
    }
}
exports.CompletionProposalsProvider = CompletionProposalsProvider;
//# sourceMappingURL=CompletionProposalsProvider.js.map