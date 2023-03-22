import Folder from './models/Folder';
import Note from './models/Note';
import * as moment from 'moment';

const SCRIPT_BEGIN = '```js executable';
const SCRIPT_END = '```';

const isScript = (noteBody: string): boolean => {
	return noteBody.trim().indexOf(SCRIPT_BEGIN) === 0 && noteBody.trim().indexOf(SCRIPT_END) === (noteBody.length - SCRIPT_END.length);
};

const parseScript = (noteBody: string): string => {
	let scriptBody = noteBody.trim().substring(SCRIPT_BEGIN.length);
	scriptBody = scriptBody.substring(0, scriptBody.length - SCRIPT_END.length);
	return scriptBody;
};

class ScriptExecutor {
	public static async safeExecuteNote(noteId: string, showMessage: (message: string)=> void, errorCallback: (error: Error)=> void) {
		const currentNote = await Note.load(noteId);
		const currentFolder = await Folder.load(currentNote.id);

		if (isScript(currentNote.body)) {
			const script = parseScript(currentNote.body);
			const scriptFunction = eval(`(async function(currentNote, currentFolder, Note, Folder, moment, print, error) {
        try {
${script}
        } catch (e) {
          error(e);
        }
      })`);
			scriptFunction(currentNote, currentFolder, Note, Folder, moment, showMessage, errorCallback);
		}
	}
}

export {
	isScript as noteBodyIsScript,
};

export default ScriptExecutor;
