editor.language = {

	name: "text",
	
	indentstring: "\t",
	autoIndent: function() {
		if (editor.caretPosition.y == 0) return;
		var indentprev = editor.lines[editor.caretPosition.y - 1].match(/^\s*/);
		if (indentprev.length > 0) {
			editor.insert(indentprev[0]);
		}
	},
	
	autoUnIndentAtInsert: function(ins) {
		
	},
	
	smartCaretPositioning: function() {
		if (editor.lines[editor.caretPosition.y].trim() == "") {
			editor.caretPosition.x = editor.lines[editor.caretPosition.y].length;
		}
	},
	
	singleLineCommentTrigger: null,
	multiLineCommentStartTrigger: null,
	multiLineCommentEndTrigger: null,
	
	isLineStartingInMultiLineCommentState: function(line) {
		return false;
	},
	
	lineEndContext: {},
		
	renderLine: function(line) {
		var str = "";
		
		var linelen = editor.lines[line].length;
		for (var i = 0; i < linelen; i++) {
			var ch = editor.lines[line][i];
			
			if (ch === " ") {
				ch = "&nbsp;";
			}
			if (ch === "<") {
				ch = "&lt;";
			}
			if (ch === "&") {
				ch = "&amp;";
			}
			if (ch === "\t") {
				ch = "&nbsp;&nbsp;&nbsp;&nbsp;";
			}
						
			str += ch;
		}
		
		return str;
	},
	
};