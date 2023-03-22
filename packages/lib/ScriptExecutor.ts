import Folder from './models/Folder';
import Note from './models/Note';
import * as moment from 'moment';

const asyncToGen = require('async-to-gen');
const SCRIPT_BEGIN = '```js executable';
const SCRIPT_END = '```';

const isScript = (noteBody: string): boolean => {
	const trimmedBody = noteBody.trim();
	return trimmedBody.startsWith(SCRIPT_BEGIN) && trimmedBody.endsWith(SCRIPT_END);
};

const parseScript = (noteBody: string): string => {
	let scriptBody = noteBody.trim().substring(SCRIPT_BEGIN.length + 1);
	scriptBody = scriptBody.substring(0, scriptBody.length - SCRIPT_END.length - 1);
	return scriptBody;
};

class ScriptExecutor {
	public static async executeNote(noteId: string, dispatch: (action: any)=> void, showMessage: (message: string)=> void, errorCallback: (error: Error)=> void) {
		const currentNote = await Note.load(noteId);
		const currentFolder = await Folder.load(currentNote.parent_id);

		if (isScript(currentNote.body)) {
			const script = parseScript(currentNote.body);

			try {
				const transformed = asyncToGen(`const scriptFunction = (async function(currentNote, currentFolder, Note, Folder, moment, dispatch, print, error) {try{${script}}catch(e){error(e);}})`).toString();
				const scriptFunction = eval(`${transformed}; scriptFunction`);
				scriptFunction(currentNote, currentFolder, Note, Folder, moment, dispatch, showMessage, errorCallback);
			} catch (e) {
				errorCallback(e);
			}
		}
	}
}

export {
	isScript as noteBodyIsScript,
};

export default ScriptExecutor;
