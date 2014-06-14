editor.language = {

	name: "javascript",
    extension: '.js',
	
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
	
	singleLineCommentTrigger: "//",
	multiLineCommentStartTrigger: "/*",
	multiLineCommentEndTrigger: "*/",
	
	keywords1: {
		keywords: [ 'break', 'case', 'catch', 'continue', 'debugger', 'default', 'delete', 'do', 'else', 'finally', 'for', 'function', 'if', 
		            'in', 'instanceof', 'new', 'return', 'switch', 'this', 'throw', 'try', 'typeof', 'var', 'void', 'while', 'true', 'false', 'null' ],
		style: 'color: blue;'
	},
	
	keywords2: {
		keywords: [ 'Array', 'Boolean', 'Date', 'Math', 'Number', 'String', 'RegExp' ],
		style: 'color: #31BDAF;'
	},
	
	keywords3: {
		keywords: [ 'undefined', 'Infinity', 'NaN',  ],
		style: 'color: black; font-style: italic;'
	},
	
	numbersStyle: 'color: red;',
	
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
	
	numberRegex: new RegExp("^[^a-zA-Z0-9\$_]([0-9]+)([^a-zA-Z0-9\$_]|$)", ''),	
	stylizeKeyword: function(str, i) {
		var style = "";
		var len = 0;
		
		var substr = (i === 0) ? " " + str : str.substr(i - 1);
		
		var a = [ 'keywords1', 'keywords2', 'keywords3' ];
		for (var i = 0; i < a.length; i++) {
			if (editor.language[a[i]] === null) continue;
			if (editor.language[a[i]].regex === undefined) {
				editor.language[a[i]].regex = new RegExp("^[^a-zA-Z0-9\$_](" + editor.language[a[i]].keywords.join('|') + ")([^a-zA-Z0-9\$_]|$)", '');
			}
			var match = substr.match(editor.language[a[i]].regex);
			if (match) {
				style += "<span style='" + editor.language[a[i]].style + "'>";
				len = match[1].length;
			}
		}
		
		if (editor.language.numbersStyle !== null) {
			match = substr.match(editor.language.numberRegex);
			if (match) {
				style += "<span style='" + editor.language.numbersStyle + "'>";
				len = match[1].length;
			}
		}
		
		return { span: style, length: len };
	},
	
	renderLine: function(line) {
		var str = "";
		
		var inSingleLineComment = false;
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
			if (ignorestyle <= 0 && !inSingleLineComment && !inMultiLineComment && !inString) {
				var style = editor.language.stylizeKeyword(editor.lines[line], i);
				if (style.length > 0) {
					str += style.span;
					ignorestyle = style.length;
				}
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
				str += "<span class='string'>";
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
			if (editor.language.singleLineCommentTrigger !== null) {
				if ((!inSingleLineComment && !inMultiLineComment && !inString) && editor.lines[line].substr(i + 1, editor.language.singleLineCommentTrigger.length) == editor.language.singleLineCommentTrigger) {
					str += "<span class='comment'>";
					inSingleLineComment = true;
				}
			}

			if (editor.language.multiLineCommentStartTrigger !== null) {
				if ((!inSingleLineComment && !inMultiLineComment && !inString) && editor.lines[line].substr(i + 1, editor.language.multiLineCommentStartTrigger.length) == editor.language.multiLineCommentStartTrigger) {
					str += "<span class='comment'>";
					inMultiLineComment = true;
				}
				
				if (inMultiLineComment && editor.lines[line].substr(i - editor.language.multiLineCommentEndTrigger.length + 1, editor.language.multiLineCommentEndTrigger.length) == editor.language.multiLineCommentEndTrigger) {
					str += "</span>";
					inMultiLineComment = false;
				}
			}
		}
		
		return str;
	},
	
	getKeywordUpToCaret: function() {
		var line = editor.lines[editor.caretPosition.y].substr(0, editor.caretPosition.x);
		return line.match(/[a-zA-Z0-9]*$/)[0];
	},
	
	getIntellisenseFromCurrentState: function(callback) {
        project.ternServer.request({
            query: {
                type: 'completions',
                file: editor.filename,
                end: { line: editor.caretPosition.y, ch: editor.caretPosition.x },
                types: true,
                docs: true,
                urls: true,
                origins: true,
                filter: false,
                caseInsensitive: true,
                includeKeywords: true,
            },
            files: [
                {
                    type: 'full',
                    name: editor.filename,
                    text: editor.lines.join('\n'),
                }
            ],
        }, function(error, response) {
            console.log(response);
            if (error === null) {
                var items = [];
                response.completions.forEach(function(c) {
                    var type = 'property';
                    if (c.type.indexOf('fn(') === 0) {
                        type = 'method';
                    }
                    items.push({ name: c.name, type: type, doc: c.doc });
                });
                callback(items);
            }
        });
	},
	
	onInsert: function(str) {
		var kw = editor.language.getKeywordUpToCaret();
		var line = editor.lines[editor.caretPosition.y].trim();
		if (str === '.'
				|| editor.lines[editor.caretPosition.y].match(new RegExp("new\\s+$", '')) !== null
			|| (kw.length > 0 && (line == kw
				|| line.match(new RegExp("=\\s*(" + kw + ")$", '')) !== null
				|| line.match(new RegExp(";\\s*(" + kw + ")$", '')) !== null
				|| line.match(new RegExp("\\.\\s*(" + kw + ")$", '')) !== null
				|| line.match(new RegExp("\\&\\&\\s*(" + kw + ")$", '')) !== null
				|| line.match(new RegExp("\\|\\|\\s*(" + kw + ")$", '')) !== null
				|| line.match(new RegExp("\\(\\s*(" + kw + ")$", '')) !== null
				|| line.match(new RegExp(",\\s*(" + kw + ")$", '')) !== null
			))) {
			editor.intellisense.request(false);
		}
	}
	
};