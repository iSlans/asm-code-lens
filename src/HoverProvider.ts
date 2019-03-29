'use strict';
import * as vscode from 'vscode';
import { grep, read, reduceLocations } from './grep';
import * as fs from 'fs';
import * as path from 'path';



/**
 * HoverProvider for assembly language.
 */
export class HoverProvider implements vscode.HoverProvider {

    /**
     * Called from vscode if the user hovers over a word.
     * @param document The current document.
     * @param position The position of the word for which the references should be found.
     * @param options 
     * @param token 
     */
    public provideHover(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): Thenable<vscode.Hover> {
        let settings = vscode.workspace.getConfiguration('asm-code-lens');
        if(settings.enableHoverProvider)
            return this.search(document, position);
        else
            return undefined; // new vscode.Hover;
    }

    
    /**
     * Does a search for a word. I.e. finds all references of the word.
     * @param document The document that contains the word.
     * @param position The word position.
     * @return A promise with a vscode.Hover object.
     */
    private search(document, position): Thenable<vscode.Hover>
    {
        return new Promise<vscode.Hover>((resolve, reject) => {
            const searchWord = document.getText(document.getWordRangeAtPosition(position));
            const searchRegex = new RegExp('\\b' + searchWord + ':');   // Note: I should also search for labels without ":".

            grep(searchRegex)
            .then(locations => {
                // Reduce the found locations.
                // Please note that the label location itself is also removed.
                // I.e. you cannot hover a label definition.
                // Anyhow doesn't make sense because the text is visible
                // in the sources.
                reduceLocations(locations, document, position)
                .then(reducedLocations => {
                    // Now read the comment lines above the documfound word.
                    const loc = reducedLocations[0]; // There is (hopefully) only one.
                    if(!loc) {
                        const hover = new vscode.Hover('...');
                        return resolve(hover);
                    }
                    const lineNr = loc.range.start.line;
                    const filePath = loc.uri.fsPath;
                    const readStream = fs.createReadStream(filePath, { encoding: 'utf-8' });
                    read(readStream, data => {
                        const lines = data.split('\n');
                        // Now find all comments above the found line
                        const hoverTexts = new Array<string>();
                        const text = lines[lineNr];
                        hoverTexts.unshift(text);
                        let startLine = lineNr-1;
                        while(startLine >= 0) {
                            // Check if line starts with ";"
                            const line = lines[startLine];
                            const match = /^\s*;/.exec(line);
                            if(!match)
                                break;
                            // Add text
                            hoverTexts.unshift(line);    
                            // Next
                            startLine --;
                        }
                        // return
                        const hover = new vscode.Hover(hoverTexts);
                        return resolve(hover);
                    });    
                });
                
            });
        });
    }

}
