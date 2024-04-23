import { Position, TextLine, TextEditor, window, Range, TextEditorDecorationType } from "vscode";

let usedDecorationTypes: TextEditorDecorationType[] = [];

export function search(searchString: string, editor: TextEditor): Range[] {
    const potentialMatches: Range[] = [];
    if (searchString.length === 0) {
        return potentialMatches;
    }

    // Checking for general matches to highlight.
    const searchStringLowerCase = searchString.toLocaleLowerCase();
    const visibleLines = getVisibleLines(editor);
    for (const line of visibleLines) {
        const text = line.text + '  ';
        for (let character = 0; character < text.length; character++) {
            const comperator = text.slice(character, character + searchStringLowerCase.length).toLocaleLowerCase();
            if (comperator === searchStringLowerCase) {
                potentialMatches.push(new Range(
                    new Position(line.lineNumber, character),
                    new Position(line.lineNumber, character + searchStringLowerCase.length)
                ));
            }
        }
    }
    const searchResult: Range[] = [];
    // No matches, but is their any for without the tail?
    if (potentialMatches.length === 0) {
        const potentialMatchesOnLastSearch: Range[] = []

        const searchStringWithoutTail = searchString.slice(0, -1).toLocaleLowerCase();
        for (const line of visibleLines) {
            const text = line.text + '  ';
            for (let character = 0; character < text.length; character++) {
                const comperator = text.slice(character, character + searchStringWithoutTail.length).toLocaleLowerCase();
                if (comperator === searchStringWithoutTail) {
                    potentialMatchesOnLastSearch.push(new Range(
                        new Position(line.lineNumber, character),
                        new Position(line.lineNumber, character + searchStringWithoutTail.length)
                    ));
                }
            }
        }

        const searchStringTail = searchString.slice(-1);
        for (let i = 0; i < potentialMatchesOnLastSearch.length; i++) {
            // Each label is unique, so if the tail (last char) matches a label we only want that match.
            if (createLabels(i) === searchStringTail) {
                searchResult.push(potentialMatchesOnLastSearch[i]);
            }
        }
    }

    if (searchResult.length > 0) {
        return searchResult
    } else {
        // Dont want to return more matches than labels
        if (potentialMatches.length > 26) {
            return potentialMatches.slice(0, 26)
        } else {
            return potentialMatches
        }
    }

}

export function highlight(searchResult: Range[], editor: TextEditor, showLabels: boolean): void {
    for (let i = 0; i < usedDecorationTypes.length; i++) {
        usedDecorationTypes[i].dispose();
    }
    usedDecorationTypes = [];
    for (let i = 0; i < searchResult.length; i++) {
        const decorationType = createDecorationType(createLabels(i), showLabels);
        editor.setDecorations(decorationType, [{ range: searchResult[i] }]);
        usedDecorationTypes.push(decorationType);
    }
}

function createLabels(value: number): string {
    return numberToCharacter(value % 26);
}

function numberToCharacter(value: number): string {
    return "ABCDEFGHIJKLMNOPQRSTUVWXYZ".charAt(value);
}

function getVisibleLines(editor: TextEditor): TextLine[] {
    let textLines = [];
    const ranges = editor.visibleRanges;

    for (let range of ranges) {
        for (let lineNumber = range.start.line; lineNumber <= range.end.line; lineNumber++) {
            textLines.push(editor.document.lineAt(lineNumber));
        }
    }

    return textLines;
}

function createDecorationType(label: string, showLabels: boolean): TextEditorDecorationType {
    return window.createTextEditorDecorationType({
        backgroundColor: 'var(--vscode-editor-findMatchHighlightBackground)',
        light: {
            after: showLabels ? {
                contentText: label,
                color: 'var(--vscode-editor-background)',
                backgroundColor: 'var(--vscode-editor-foreground)',
                fontWeight: 'bold',
                border: '2px solid var(--vscode-editor-foreground)'
            } : undefined
        },
        dark: {
            after: showLabels ? {
                contentText: label,
                color: 'var(--vscode-editor-background)',
                backgroundColor: 'var(--vscode-editor-foreground)',
                fontWeight: 'bold',
                border: '2px solid var(--vscode-editor-foreground)'
            } : undefined
        }
    });
}