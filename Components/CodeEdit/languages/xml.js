editor.language = {

	name: "xml",
	
	indentstring: "\t",
	autoIndent: function() {
		if (editor.caretPosition.y == 0) return;
		var indentprev = editor.lines[editor.caretPosition.y - 1].match(/^\s*/);
		if (indentprev.length > 0) {
			editor.insert(indentprev[0]);
		}
		var prevLine = editor.lines[editor.caretPosition.y - 1].trim();
		if (prevLine.charAt(prevLine.length - 1) == '{') {
			// indent
			editor.insert(editor.language.indentstring);
		}
	},
	
	autoUnIndentAtInsert: function(ins) {
		if (ins == '}') {
			var line = editor.lines[editor.caretPosition.y];
			var possibleindent = line.substr(editor.caretPosition.x - ins.length - editor.language.indentstring.length, editor.language.indentstring.length);
			if (possibleindent == editor.language.indentstring) {
				var newline = line.substr(0, editor.caretPosition.x - ins.length - possibleindent.length);
				newline += line.substr(editor.caretPosition.x - ins.length);
				editor.lines[editor.caretPosition.y] = newline;
			}
		}
	},
	
	smartCaretPositioning: function() {
		if (editor.lines[editor.caretPosition.y].trim() == "") {
			editor.caretPosition.x = editor.lines[editor.caretPosition.y].length;
		}
	},
	
	singleLineCommentTrigger: null,
	multiLineCommentStartTrigger: "<!--",
	multiLineCommentEndTrigger: "-->",
	
	isLineStartingInMultiLineCommentState: function(line) {
		for (var i = line - 1; i >= 0; i--) {
			var mlcstartpos = editor.lines[i].indexOf(editor.language.multiLineCommentStartTrigger);
			var mlcendpos = editor.lines[i].indexOf(editor.language.multiLineCommentEndTrigger);
			if (mlcstartpos > mlcendpos) {
				return true;
			}
			else if (mlcendpos > mlcstartpos) {
				return false;
			}
		}
		return false;
	},
	
	lineEndContext: {},
	
	stylizeKeyword: function(str, i, context) {
		var style = "";
		var len = 0;
		
		var substr = (i === 0) ? " " + str : str.substr(i - 1);
		
		if (context === "text") {		
			var match = substr.match(/^.(\<\/?)/);
			if (match) {
				style += "<span style='color: blue;'>";
				len = match[1].length;
				context = "tagname";
			}
		}
		
		else if (context === "tagname") {		
			var match = substr.match(/^(\<|\/)(\s*[a-zA-Z0-9\.\_\-]+)\s*/);
			if (match) {
				style += "<span style='color: #A31515;'>";
				len = match[2].length;
				context = "attr";
			}
		}
		
		else if (context === "attr") {		
			var match = substr.match(/^.(\/?\>)/);
			if (match) {
				style += "<span style='color: blue;'>";
				len = match[1].length;
				context = "text";
			}
			
			var match = substr.match(/^.\=/);
			if (match) {
				style += "<span style='color: blue;'>";
				len = 1;
				context = "attr";
			}
			
			var match = substr.match(/^.\:/);
			if (match) {
				style += "<span style='color: blue;'>";
				len = 1;
				context = "attr";
			}
			
			var match = substr.match(/^(\s|\:|'|")(\s*[a-zA-Z0-9\.\_\-]+)/);
			if (match) {
				style += "<span style='color: red;'>";
				len = match[2].length;
				context = "attr";
			}
		}
		
		return { span: style, length: len, context: context };
	},
	
	renderLine: function(line) {
		var str = "";
		var context = editor.language.lineEndContext[line - 1] === undefined ? "text" : editor.language.lineEndContext[line - 1];
		
		var inMultiLineComment = editor.language.isLineStartingInMultiLineCommentState(line);
		var inString = false;
		var stringTrigger = '';
		if (inMultiLineComment) {
			str += "<span class='comment'>";
		}
		
		var ignorestyle = -1;
		var linelen = editor.lines[line].length;
		for (var i = 0; i < linelen; i++) {
			var ch = editor.lines[line][i];
			if (ignorestyle <= 0 && !inMultiLineComment && !inString) {
				var style = editor.language.stylizeKeyword(editor.lines[line], i, context);
				if (style.length > 0) {
					str += style.span;
					ignorestyle = style.length;
				}
				context = style.context;
			}
			
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
						
			var thisIsStringStart = false;
			if ((ch === '"' || ch === "'") && !inString) {
				str += "<span class='string' style='color: blue;'>";
				stringTrigger = ch;
				inString = true;
				thisIsStringStart = true;
			} 
			
			str += ch;
			
			if (ignorestyle > 0) {
				ignorestyle--;
			}
			if (ignorestyle == 0) {
				str += "</span>";
				ignorestyle = -1;
			}
			
			// strings
			if (inString && ch == stringTrigger && !thisIsStringStart) {
				if (editor.lines[line].substr(i - 1, 1) != '\\' || (editor.lines[line].substr(i - 2, 2) == '\\\\')) {
					str += "</span>";
					inString = false;
					stringTrigger = '';
				}
			}
			
			// comments
			if (editor.language.multiLineCommentStartTrigger !== null) {
				if ((!inMultiLineComment && !inString) && editor.lines[line].substr(i + 1, editor.language.multiLineCommentStartTrigger.length) == editor.language.multiLineCommentStartTrigger) {
					str += "<span class='comment'>";
					inMultiLineComment = true;
				}
				
				if (inMultiLineComment && editor.lines[line].substr(i - editor.language.multiLineCommentEndTrigger.length + 1, editor.language.multiLineCommentEndTrigger.length) == editor.language.multiLineCommentEndTrigger) {
					str += "</span>";
					inMultiLineComment = false;
				}
			}
		}
		
		editor.language.lineEndContext[line] = context;
		
		return str;
	},
	
};