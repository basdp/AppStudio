var editor = {
	lines: [''],
	caretPosition: { x: 0, y: 0 },
	hasFocus: false,
	
	enableAutoIndent: true,
	pauseRendering: false,
	
	selectionMode: false,
	selectionMouseMode: false,
	selectionOrigin: null,
	
	lineHeight: 15,
	fontWidth: 15,
	gutterWidth: 41,
	textLeft: 45,
	
	skipNextInput: false,
	
	undoStack: [],
	redoStack: [],
	undoSize: 10,
	
	undoAdd: function(type, line, code, x, y) {
		editor.undoStack.push({ type: type, line: line, code: code, caretX: x, caretY: y });
	},
	
	undo: function() {
		if (editor.undoStack.length === 0) return;
		
		var u = editor.undoStack.pop();
		if (u.type == 'line') {
			editor.redoStack.push( { type: u.type, line: u.line, code: editor.lines[u.line], caretX: editor.caretPosition.x, caretY: editor.caretPosition.y } );
		} else if (u.type == 'full') {
			editor.redoStack.push( { type: u.type, line: u.line, code: editor.lines.slice(0), caretX: editor.caretPosition.x, caretY: editor.caretPosition.y } );
		}
		
		editor.caretPosition.x = u.caretX;
		editor.caretPosition.y = u.caretY;
		editor.positionCaret();
		
		if (u.type == 'line') {
			editor.lines[u.line] = u.code;
			editor.lineChanged(u.line);
		} else if (u.type == 'full') {
			editor.lines = u.code.slice(0);
			var linesels = editor.editorElement.getElementsByClassName('line');
			var lines = [];
			for (var i = 0; i < linesels.length; i++) {
				lines[i] = linesels[i];
			}
			for (var i = 0; i < lines.length; i++) {
				lines[i].remove();
			}
			editor.render();
		}
		
	},
	
	redo: function() {
		if (editor.redoStack.length === 0) return;
		
		var u = editor.redoStack.pop();
		if (u.type == 'line') {
			editor.undoStack.push( { type: u.type, line: u.line, code: editor.lines[u.line], caretX: editor.caretPosition.x, caretY: editor.caretPosition.y } );
		} else if (u.type == 'full') {
			editor.undoStack.push( { type: u.type, line: u.line, code: editor.lines.slice(0), caretX: editor.caretPosition.x, caretY: editor.caretPosition.y } );
		}
		
		editor.caretPosition.x = u.caretX;
		editor.caretPosition.y = u.caretY;
		editor.positionCaret();
		
		if (u.type == 'line') {
			editor.lines[u.line] = u.code;
			editor.lineChanged(u.line);
		} else if (u.type == 'full') {
			editor.lines = u.code.slice(0);
			var linesels = editor.editorElement.getElementsByClassName('line');
			var lines = [];
			for (var i = 0; i < linesels.length; i++) {
				lines[i] = linesels[i];
			}
			for (var i = 0; i < lines.length; i++) {
				lines[i].remove();
			}
			editor.render();
		}
	},
	
	lineChanged: function(line) {
		editor.positionCaret();
	
		editor.renderLine(line);
		
		var y = line + 1;
		if (editor.language.isLineStartingInMultiLineCommentState) {
			while (y < editor.lines.length && editor.language.isLineStartingInMultiLineCommentState(y)) {
				editor.renderLine(y);
				y++;
			}
			
			if (editor.lines[line].indexOf(editor.language.multiLineCommentStartTrigger) == -1) {
				var lineelem = editor.editorElement.getElementsByClassName('line' + (line + 1));
				if (lineelem.length > 0) {
					lineelem = lineelem[0];
					var textelem = lineelem.getElementsByClassName('text')[0];
					if (textelem.innerHTML.trim().indexOf("<span class=\"comment\">") == 0) {
						var y = line + 1;
						while (y < editor.lines.length && !editor.language.isLineStartingInMultiLineCommentState(y)) {
							editor.renderLine(y);
							y++;
						}
					}
				}
			}
		}
	},
	
	insert: function(str, recordUndo) {
		if (recordUndo === undefined) recordUndo = true;
		var strlines;
		if (str.nodeType !== undefined) {
			strlines = str.value.split("\n");
		} else {
			strlines = str.split("\n");
		}
		if (strlines.length > 1) {
			// this is a multiline string
			if (recordUndo)
				editor.undoAdd('full', 0, editor.lines.slice(0), editor.caretPosition.x, editor.caretPosition.y);
			
			var currentline = editor.caretPosition.y;
			editor.pauseRendering = true;
			for (var i = 0; i < strlines.length; i++) {
				editor.insert(strlines[i], false);
				editor.newline();
			}
			editor.pauseRendering = false;
			for (var i = currentline; i <= editor.caretPosition.y; i++) {
				editor.renderLine(i);
			}
		} else {
			if (str.nodeType !== undefined) {
				str = str.value;
			}
			var line = editor.lines[editor.caretPosition.y];
			
			if (recordUndo)
				editor.undoAdd('line', editor.caretPosition.y, line, editor.caretPosition.x, editor.caretPosition.y);
			
			editor.lines[editor.caretPosition.y] = line.substr(0, editor.caretPosition.x) + str + line.substr(editor.caretPosition.x);
			if (editor.caretPosition.x > editor.lines[editor.caretPosition.y].length)
				editor.caretPosition.x = editor.lines[editor.caretPosition.y].length - 1;
			editor.caretPosition.x += str.length;
			
			if (editor.enableAutoIndent) editor.language.autoUnIndentAtInsert(str);
			
			editor.lineChanged(editor.caretPosition.y);
		}
		
		editor.language.onInsert(str);
	},
	
	
	
	selectInLine: function(line, x) {
		var textLeft = editor.textLeft;
		x -= textLeft - 1;
		if (x < 0) return;
		
		if (line != editor.caretPosition.y) {
			var oldLine = editor.caretPosition.y;
			editor.caretPosition.y = line;
			editor.renderLine(oldLine);
		}
				
		editor.caretPosition.x = Math.round(x / editor.fontWidth);
		
		// fix tabs
		var line = editor.lines[line].replace(/\t/g, '\t\t\t\t');
		editor.caretPosition.x = Math.min(line.length, Math.round(x / editor.fontWidth));
		
		var match = line.substr(0, editor.caretPosition.x).match(/\t/g);
		if (match) {
			editor.caretPosition.x -= Math.round(match.length / 4 * 3);
			editor.caretPosition.x = Math.max(editor.caretPosition.x, 0);
		}
		
		if (!editor.selectionMode) editor.deselect();
		
		editor.renderLine(editor.caretPosition.y);
		
		if (editor.intellisense.isOpen) {
			editor.intellisense.dismiss();
		}
	},
	
	getSelectionBoundaries: function() {
		var selectionLeft, selectionRight;
		if (editor.selectionOrigin !== null) {
			if (editor.selectionOrigin.y < editor.caretPosition.y) {
				selectionLeft = editor.selectionOrigin;
				selectionRight = editor.caretPosition;
			} else if (editor.selectionOrigin.y == editor.caretPosition.y) {
				if (editor.selectionOrigin.x < editor.caretPosition.x) {
					selectionLeft = editor.selectionOrigin;
					selectionRight = editor.caretPosition;					
				} else {
					selectionRight = editor.selectionOrigin;
					selectionLeft = editor.caretPosition;					
				}
			} else {
				selectionRight = editor.selectionOrigin;
				selectionLeft = editor.caretPosition;
			}
			
			return { left: { x: selectionLeft.x, y: selectionLeft.y }, right: { x: selectionRight.x, y: selectionRight.y } };
		}
		
		return null;
	},
	
	getSelectionLength: function() {
		var bdr = editor.getSelectionBoundaries();
		if (bdr === null) return 0;
		var length = 0;
		for (var i = bdr.left.y; i <= bdr.right.y; i++) {
			if (i == bdr.left.y) {
				length -= bdr.left.x;
			}
			if (i == bdr.right.y) {
				length -= editor.lines[i].length - bdr.right.x;
			}
			length += editor.lines[i].length;
		}
		return length + (bdr.right.y - bdr.left.y);
	},
		
	deleteSelection: function() {
		editor.pauseRendering = true;
		var sb = editor.getSelectionBoundaries();
		var sellength = editor.getSelectionLength();
		editor.deselect();
		editor.caretPosition.x = sb.left.x;
		editor.caretPosition.y = sb.left.y;
		for (var i = 0; i < sellength; i++) {
			editor.del();
		}
		editor.pauseRendering = false;
		for (var i = editor.caretPosition.y; i < editor.lines.length; i++) {
			editor.renderLine(i);
		}
		
		editor.lineChanged(editor.caretPosition.y);
	},
	
	renderLine: function(line) {
		if (editor.pauseRendering) return;
		
		var editorelem = editor.editorElement;
		var lineelems = editorelem.getElementsByClassName("line" + line);
		var lineelem, textelem, selectelem;
		if (lineelems.length == 0) {
			lineelem = document.createElement("div");
			var gutterelem = document.createElement("div");
			textelem = document.createElement("div");
			selectelem = document.createElement("div");
			lineelem.className = "line line" + line;
			gutterelem.className = "gutter";
			gutterelem.textContent = line + 1;
			textelem.className = "text";
			selectelem.className = "selection";
			lineelem.appendChild(gutterelem);
			lineelem.appendChild(textelem);
			lineelem.appendChild(selectelem);
			editorelem.appendChild(lineelem);
						
			lineelem.onmousedown = function(e) {
				editor.selectInLine(line, e.pageX - editor.editorElement.getBoundingClientRect().left + editor.editorElement.scrollLeft);
				editor.selectionOrigin = { x: editor.caretPosition.x, y: editor.caretPosition.y };
				editor.ensureCaretVisible();
				editor.selectionMode = true;
				editor.selectionMouseMode = true;
				editor.editorElement.focus();
				e.preventDefault();
				e.stopPropagation();
			};
			
			lineelem.onmousemove = function(e) {
				if (editor.selectionMouseMode) {
					editor.selectInLine(line, e.x - editor.editorElement.getBoundingClientRect().left);
					editor.ensureCaretVisible();
				}
			};			
		} else {
			lineelem = editorelem.getElementsByClassName("line" + line)[0];
			textelem = lineelem.getElementsByClassName("text")[0];
			selectelem = lineelem.getElementsByClassName("selection")[0];
		}
		
		
		// Selection
		var selectionBoundaries = editor.getSelectionBoundaries();
		var selectionOnThisLine = false;
		if (editor.selectionOrigin !== null && selectionBoundaries.left.y <= line && selectionBoundaries.right.y >= line) {
			selectionOnThisLine = true;
			selectelem.style.display = "block";
			
			var textleftoffset = 0;
			var leftoffset = 0;
			if (selectionBoundaries.left.y == line) {
				textleftoffset = selectionBoundaries.left.x;
				
				var match = editor.lines[line].substr(0, textleftoffset).match(/\t/g);
				if (match) leftoffset += match.length * 3;
			}
			selectelem.style.left = (editor.textLeft + editor.fontWidth * (textleftoffset + leftoffset)) + "px";
			
			var charwidth = 0;
			if (selectionBoundaries.right.y > line) {
				charwidth = editor.lines[line].length;
			} else {
				charwidth = selectionBoundaries.right.x;
			}
			
			if (selectionBoundaries.left.y == line)
				charwidth -= selectionBoundaries.left.x;
			
			var match = editor.lines[line].substr(textleftoffset, charwidth).match(/\t/g);
			if (match) charwidth += match.length * 3;
				
			selectelem.style.width = (charwidth * editor.fontWidth) + "px";
		} else {
			selectelem.style.display = '';
		}
		
		var str = editor.language.renderLine(line);
				
		if (editor.lines[line].length == 0) {
			str += "&nbsp;";
		}
		
		textelem.innerHTML = str;
	},
	
	render: function() {
		for (var i = 0; i < editor.lines.length; i++) {
			editor.renderLine(i);
		}
	},
	
	backspace: function() {
		if (editor.getSelectionLength() > 0) {
			editor.deleteSelection();
			return;
		}
		if (editor.caretPosition.x == 0) {
			if (editor.caretPosition.y > 0) {
				editor.caretPosition.y--;
				editor.caretPosition.x = editor.lines[editor.caretPosition.y].length;
				editor.lines[editor.caretPosition.y] += editor.lines[editor.caretPosition.y + 1];
				editor.lines.splice(editor.caretPosition.y + 1, 1);
				for (var i = editor.caretPosition.y; i < editor.lines.length; i++) {
					editor.renderLine(i);
				}
				var editorelem = document.getElementById("editor");
				var lastline = editorelem.getElementsByClassName("line" + editor.lines.length)[0];
				lastline.parentElement.removeChild(lastline);
			}
		} else {
			editor.caretPosition.x -= 1;
			editor.lines[editor.caretPosition.y] = editor.lines[editor.caretPosition.y].substr(0, editor.caretPosition.x) + editor.lines[editor.caretPosition.y].substr(editor.caretPosition.x + 1);
			editor.renderLine(editor.caretPosition.y);
		}
		editor.deselect();
		editor.lineChanged(editor.caretPosition.y);
	},
	
	del: function() {
		if (editor.getSelectionLength() > 0) {
			editor.deleteSelection();
			return;
		}
		if (editor.caretPosition.x == editor.lines[editor.caretPosition.y].length) {
			if (editor.caretPosition.y < editor.lines.length - 1) {
				editor.lines[editor.caretPosition.y] += editor.lines[editor.caretPosition.y + 1];
				editor.lines.splice(editor.caretPosition.y + 1, 1);
				for (var i = editor.caretPosition.y; i < editor.lines.length; i++) {
					editor.renderLine(i);
				}
				var editorelem = document.getElementById("editor");
				var lastline = editorelem.getElementsByClassName("line" + editor.lines.length)[0];
				lastline.parentElement.removeChild(lastline);
			}
		} else {
			editor.lines[editor.caretPosition.y] = editor.lines[editor.caretPosition.y].substr(0, editor.caretPosition.x) + editor.lines[editor.caretPosition.y].substr(editor.caretPosition.x + 1);
			editor.renderLine(editor.caretPosition.y);
		}
		editor.lineChanged(editor.caretPosition.y);
	},
	
	newline: function() {
		if (editor.getSelectionLength() > 0) {
			editor.deleteSelection();
		}
		editor.selectionOrigin = null;
				
		if (editor.lines.length == editor.caretPosition.y - 1) {
			editor.lines[editor.caretPosition.y + 1] = "";
		} else {
			for (var i = editor.lines.length; i > editor.caretPosition.y; i--) {
				editor.lines[i] = editor.lines[i - 1];
			}
		}
		
		editor.lines[editor.caretPosition.y + 1] = editor.lines[editor.caretPosition.y].substr(editor.caretPosition.x);
		editor.lines[editor.caretPosition.y] = editor.lines[editor.caretPosition.y].substr(0, editor.caretPosition.x);
		
		editor.caretPosition.y++;
		editor.caretPosition.x = 0;
		
		if (editor.enableAutoIndent) editor.language.autoIndent();
		for (var i = editor.caretPosition.y - 1; i < editor.lines.length; i++) {
			editor.renderLine(i);
		}
		editor.lineChanged(editor.caretPosition.y);
	},
	
	home: function() {
		var smartindex = editor.lines[editor.caretPosition.y].match(/^\s*/);
		if (smartindex.length > 0) smartindex = smartindex[0].length;
		if (editor.caretPosition.x == smartindex) {
			editor.caretPosition.x = 0;
		} else {
			editor.caretPosition.x = smartindex;
		}
		editor.renderLine(editor.caretPosition.y);
	},
	
	end: function() {
		editor.caretPosition.x = editor.lines[editor.caretPosition.y].length;
		editor.renderLine(editor.caretPosition.y);
	},
	
	pageup: function() {
		var oldLine = editor.caretPosition.y;
		editor.caretPosition.y -= Math.floor(editor.editorElement.offsetHeight / editor.lineHeight) - 1;
		editor.caretPosition.y = Math.max(0, editor.caretPosition.y);
		editor.renderLine(editor.caretPosition.y);
		editor.renderLine(oldLine);
		editor.ensureCaretVisible();
	},
	
	pagedown: function() {
		var oldLine = editor.caretPosition.y;
		editor.caretPosition.y += Math.floor(editor.editorElement.offsetHeight / editor.lineHeight) - 1;
		editor.caretPosition.y = Math.min(editor.lines.length - 1, editor.caretPosition.y);
		editor.renderLine(editor.caretPosition.y);
		editor.renderLine(oldLine);
		editor.ensureCaretVisible();
	},
	
	caretBlinkSpeed: 500,
	toggleCaretTimeout: -1,
	
	positionCaret: function() {
		var caretLeft = editor.caretPosition.x;
		if (caretLeft > editor.lines[editor.caretPosition.y].length) caretLeft = editor.lines[editor.caretPosition.y].length;
		var match = editor.lines[editor.caretPosition.y].substr(0, caretLeft).match(/\t/g);
		if (match) caretLeft += match.length * 3;
		editor.caretElement.style.top = editor.caretPosition.y * editor.lineHeight + 2;
		editor.caretElement.style.left = (editor.textLeft + (caretLeft * editor.fontWidth)) + "px";
	},
	
	toggleCaret: function() {
		var caret = document.getElementById('caret');
		if (!editor.hasFocus) {
			caret.style.borderRightColor = 'transparent';
		} else {	
			if (caret.style.borderRightColor == 'transparent') {
				caret.style.borderRightColor = '';
				editor.positionCaret();
			} else {
				caret.style.borderRightColor = 'transparent';
			}
		}
		
		editor.toggleCaretTimeout = setTimeout(editor.toggleCaret, editor.caretBlinkSpeed);
	},
	
	ensureCaretVisible: function() {
		if (editor.toggleCaretTimeout != -1) {
			clearTimeout(editor.toggleCaretTimeout);
		}
		var caret = document.getElementById('caret');
		caret.style.borderRightColor = '';
		editor.toggleCaretTimeout = setTimeout(editor.toggleCaret, editor.caretBlinkSpeed);
		
		var gutterOuterWidth = editor.gutterWidth;
		var lineHeight = editor.lineHeight;
		
		editor.positionCaret();
		
		// find parent line
		
		var caretLeft = caret.offsetLeft + 1;
		var caretTop = editor.caretPosition.y * editor.lineHeight;
		
		if (caretLeft < editor.editorElement.scrollLeft + gutterOuterWidth) {
			editor.editorElement.scrollLeft = Math.max(caretLeft - gutterOuterWidth - 40, 0);
		}
		if (caretLeft > editor.editorElement.scrollLeft + editor.editorElement.clientWidth - 1) {
			editor.editorElement.scrollLeft = caretLeft - editor.editorElement.clientWidth + 40 + 1;
		}
		if (caretTop < editor.editorElement.scrollTop) {
			editor.editorElement.scrollTop = caretTop;
		}
		if (caretTop + lineHeight > editor.editorElement.scrollTop + editor.editorElement.clientHeight) {
			editor.editorElement.scrollTop = caretTop - editor.editorElement.clientHeight + lineHeight;
		}
	},
	
	deselect: function() {
		var selectionBoundaries = editor.getSelectionBoundaries();
		editor.selectionOrigin = null;
		if (selectionBoundaries === null) return;
		for (var y = selectionBoundaries.left.y; y <= selectionBoundaries.right.y; y++)
			editor.renderLine(y);
	},
};