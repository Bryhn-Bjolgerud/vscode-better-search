import { commands, ExtensionContext } from 'vscode';
import { LeapWidget } from './leapWidget';

let widget: LeapWidget | undefined;

function getWidgetInstance(
): LeapWidget {
	if (!widget || !widget.isActive) {
		widget = new LeapWidget();
	}
	return widget;
}

export function activate(context: ExtensionContext) {
	context.subscriptions.push(...[
		commands.registerCommand('leap.search', async () => {
			widget = getWidgetInstance();
			widget.show();
		})
	]);
}