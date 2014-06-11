editor.language = {

	name: "xml",
    extension: '.xml',
    
	indentstring: "\t",
	autoIndent: function() {
		if (editor.caretPosition.y == 0) return;
		var indentprev = editor.lines[editor.caretPosition.y - 1].match(/^\s*/);
		if (indentprev.length > 0) {
			editor.insert(indentprev[0]);
		}
		var prevLine = editor.lines[editor.caretPosition.y - 1].trim();
		if (prevLine.match(/\<[^/][^\>]*[^/]\>$/) !== null) {
			// indent
			editor.insert(editor.language.indentstring);
		}
	},
	
	autoUnIndentAtInsert: function(ins) {
		var prevLine = editor.lines[editor.caretPosition.y];
		var m = prevLine.match(/\<\/[^\>]*\>$/);
		if (m !== null) {
			// unindent
			var possibleindent = prevLine.substr(editor.caretPosition.x - m[0].length - editor.language.indentstring.length, editor.language.indentstring.length);
			if (possibleindent == editor.language.indentstring) {
				var newline = prevLine.replace(possibleindent, '');
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
	
	getKeywordUpToCaret: function() {
		var line = editor.lines[editor.caretPosition.y].substr(0, editor.caretPosition.x);
		return line.match(/[a-zA-Z0-9]*$/)[0];
	},
	
	findTags: function() {
		var xml = '';
		for (var y = 0; y < editor.caretPosition.y; y++) {
			xml += editor.lines[y] + '\n';
		}
		xml += editor.lines[editor.caretPosition.y].substr(0, editor.caretPosition.x);
		return xml.match(/\<\/?[a-zA-Z0-9\.\_\-]+[^\>]*\>/g);
	},
	
	getIntellisenseFromCurrentState: function() {
		if (editor.lines[editor.caretPosition.y].match(new RegExp("\\<\\/[a-zA-Z0-9\.\_\-]*$", '')) !== null) {
			// find close tag
			var tags = editor.language.findTags();
			if (tags === null || tags.length === 0) {
				return [];
			} else {
				var tagstack = [];
				for (var i = 0; i < tags.length; i++) {
					if (tags[i].substr(0, 2) == "</") {
						tagstack.pop();
					} else if (tags[i].substr(tags[i].length - 2) == "/>") {
						// self closing, do nothing
					} else {
						tagstack.push(tags[i]);	
					}
				}
				if (tagstack.length > 0) {
					var tagname = tagstack[tagstack.length - 1].match(/\<([a-zA-Z0-9\.\_\-]+)/)[1];
				}
			}
			return [ { name: tagname, type: 'tag', code: tagname + '>' } ];
		} else if (editor.lines[editor.caretPosition.y].match(/\<$/) !== null) {
			var items = [
				{ name: 'Grid', type: 'tag' },
				{ name: 'Layout', type: 'tag' },
				{ name: 'Button', type: 'tag' },
				{ name: 'Label', type: 'tag' },
			];
		
			items.sort(function(a, b) {
				if (a.name.toLowerCase() < b.name.toLowerCase())
					return -1;
				if (a.name.toLowerCase() > b.name.toLowerCase())
					return 1;
				return 0;
			});
			
			return items;
		} else if (editor.lines[editor.caretPosition.y].match(/\<\s*([a-zA-Z0-9\.\_\-]+)[^\>]+$/) !== null) {
			// attribute
			var items = [
				{ name: 'Name', type: 'property' },
				{ name: 'Width', type: 'property' },
				{ name: 'Height', type: 'property' },
				{ name: 'Style', type: 'property' },
			];
			
			return items;
		}
		
		return [];
	},
	
	onInsert: function(str) {
		var kw = editor.language.getKeywordUpToCaret();
		var line = editor.lines[editor.caretPosition.y].trim();
		if (str === '<'
				|| editor.lines[editor.caretPosition.y].match(new RegExp("\\<\\/$", '')) !== null
				|| editor.lines[editor.caretPosition.y].match(/\<\s*([a-zA-Z0-9\.\_\-]+).*?(\s)$/) !== null
			) {
			editor.intellisense.request(false);
		}
	},
};