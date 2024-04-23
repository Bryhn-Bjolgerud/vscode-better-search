import { window, QuickPick, QuickPickItem, QuickInputButton, ThemeIcon, Range, Selection } from "vscode";
import { search, highlight } from "./search";


export class LeapWidget {
    public isActive = true;

    private searchString = '';
    private searchResult: Range[] = [];

    private readonly quickPick: QuickPick<QuickPickItem> = window.createQuickPick();
    private quickInputButtons: Map<QuickInputButton, () => void> = new Map();

    constructor() {
        this.quickPick.title = 'Better Search';
        this.quickPick.placeholder = 'Search';
        this.createButtons();

        this.quickPick.onDidTriggerButton(this.onDidTriggerButton.bind(this));
        this.quickPick.onDidChangeValue(this.onChangeValue.bind(this));
        this.quickPick.onDidHide(this.hide.bind(this));
    }

    public show(): void {
        if (!this.isActive) {
            console.error('show: Leapwidget has already been disposed!');
            return;
        }

        this.quickPick.show();
    }

    public close(): void {
        this.hide();
        this.quickPick.dispose();
        this.isActive = false;
    }

    private createButtons(): void {
        this.quickInputButtons = new Map<QuickInputButton, () => void>([
            [{
                iconPath: new ThemeIcon('widget-close'),
                tooltip: 'Close (Escape)'
            }, this.close.bind(this)]
        ]);
        this.quickPick.buttons = [...this.quickInputButtons.keys()];
    }

    private createSearch() {
        const editor = window.activeTextEditor;
        if (!editor) {
            return;
        }
        this.searchResult = search(this.searchString, editor);
        const showLabels = this.searchResult.length > 0;
        highlight(this.searchResult, editor, showLabels);

        if (this.searchResult.length === 1) {
            editor.selections = [new Selection(this.searchResult[0].start, this.searchResult[0].start)];
            this.close();
        }

    }

    private hide(): void {
        if (!this.isActive) {
            console.error('hide: Leapwidget has already been disposed!');
            return;
        }

        const editor = window.activeTextEditor;
        if (editor) {
            highlight([], editor, false);
        }
    }

    private onChangeValue(value: string): void {
        this.searchString = value;
        this.createSearch();
    }

    private onDidTriggerButton(button: QuickInputButton): void {
        this.quickInputButtons.get(button)?.();
    }
}