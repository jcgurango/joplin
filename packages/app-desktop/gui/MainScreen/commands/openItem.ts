import { CommandRuntime, CommandDeclaration, CommandContext } from '@joplin/lib/services/CommandService';
import shim from '@joplin/lib/shim';
import { _ } from '@joplin/lib/locale';
import bridge from '../../../services/bridge';
import { openItemById } from '../../NoteEditor/utils/contextMenu';
import ScriptExecutor from '@joplin/lib/ScriptExecutor';
const { parseResourceUrl, urlProtocol, fileUriToPath } = require('@joplin/lib/urlUtils');
const { urlDecode } = require('@joplin/lib/string-utils');

export const declaration: CommandDeclaration = {
	name: 'openItem',
};

export const runtime = (): CommandRuntime => {
	return {
		execute: async (context: CommandContext, link: string) => {
			if (!link) throw new Error('Link cannot be empty');

			if (link.startsWith('joplin://') || link.startsWith(':/')) {
				const parsedUrl = parseResourceUrl(link);
				if (parsedUrl) {
					const { itemId, hash } = parsedUrl;

					if (hash === 'execute-note') {
						await ScriptExecutor.executeNote(
							itemId,
							context.dispatch.bind(context),
							(message) => bridge().showInfoMessageBox(message),
							(error) => bridge().showErrorMessageBox(`Script Execution Error: ${error.message}\nStack Trace:\n${error.stack}`)
						);
					}

					await openItemById(itemId, context.dispatch, hash);
				} else {
					void require('electron').shell.openExternal(link);
				}
			} else if (urlProtocol(link)) {
				if (link.indexOf('file://') === 0) {
					// When using the file:// protocol, openPath doesn't work (does
					// nothing) with URL-encoded paths.
					//
					// shell.openPath seems to work with file:// urls on Windows,
					// but doesn't on macOS, so we need to convert it to a path
					// before passing it to openPath.
					const decodedPath = fileUriToPath(urlDecode(link), shim.platformName());
					void require('electron').shell.openPath(decodedPath);
				} else {
					void require('electron').shell.openExternal(link);
				}
			} else {
				bridge().showErrorMessageBox(_('Unsupported link or message: %s', link));
			}
		},
	};
};
