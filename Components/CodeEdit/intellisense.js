editor.intellisense = {

	isOpen: false,

	request: function(canAutocomplete) {
		if (canAutocomplete === undefined) canAutocomplete = true;
	
		if (editor.intellisense.windowElement === undefined) {
			editor.intellisense.windowElement = document.getElementById("intellisense");
		}
		
		if (editor.intellisense.isOpen) return;
		
		editor.intellisense.hintCache = editor.language.getKeywordUpToCaret().toLowerCase();
		var list = editor.language.getIntellisenseFromCurrentState();
		if (list.length == 0) return;
		
		editor.intellisense.windowElement.style.height = "";
		
		var ul = editor.intellisense.windowElement.getElementsByTagName('ul')[0];
		ul.innerHTML = "";
		for (var i = 0; i < list.length; i++) {
			var li = document.createElement('li');
			li.textContent = list[i].name;
			li.className = list[i].type;
			if (list[i].code !== undefined) {
				li.setAttribute('data-code', list[i].code);
			} else {
				li.setAttribute('data-code', list[i].name);
			}
			if (list[i].active) li.className += " active";
			li.onmousedown = function() {
				var sel = editor.intellisense.windowElement.getElementsByClassName('selected');
				if (sel.length === 1) {
					sel[0].classList.remove('selected');
				}
				sel = editor.intellisense.windowElement.getElementsByClassName('active');
				if (sel.length === 1) {
					sel[0].classList.remove('active');
				}
				this.classList.add('selected');
			}
			li.ondblclick = function() {
				editor.intellisense.accept();
			}
			ul.appendChild(li);
		}
		if (ul.getElementsByClassName('active').length == 0) {
			ul.getElementsByTagName('li')[0].className += " active";
		}
		
		editor.intellisense.windowElement.style.left = editor.caretElement.offsetLeft - editor.intellisense.hintCache.length * editor.fontWidth;
		editor.intellisense.windowElement.style.top = editor.caretElement.offsetTop + editor.lineHeight;
		editor.intellisense.windowElement.style.display = 'block';
				
		editor.intellisense.isOpen = true;
		
		var f = editor.intellisense.filterHints();
		if (f === 1 && canAutocomplete) {
			editor.intellisense.accept();
		}
	},
	
	dismiss: function() {
		if (editor.intellisense.windowElement === undefined) {
			editor.intellisense.windowElement = document.getElementById("intellisense");
		}
		
		editor.intellisense.windowElement.style.display = '';
		editor.intellisense.isOpen = false;
	},
	
	down: function() {
		var sel = editor.intellisense.windowElement.getElementsByClassName('selected');
		if (sel.length === 0) {
			// select the first in the list
			var sel = editor.intellisense.windowElement.getElementsByClassName('active')[0];
			sel.classList.remove('active');
			sel.classList.add('selected');
		} else {
			sel = sel[0];
			var next = sel.nextElementSibling;
			while (next !== null && next.style.display === "none") {
				next = next.nextElementSibling;
			}
			if (next !== null) {
				sel.classList.remove('selected');			
				next.classList.add('selected');
				sel = next;
			}
		}
		
		if (sel.offsetTop + sel.offsetHeight > editor.intellisense.windowElement.offsetHeight) {
			editor.intellisense.windowElement.scrollTop = sel.offsetHeight + sel.offsetTop - editor.intellisense.windowElement.offsetHeight;
		}
	},
	
	up: function() {
		var sel = editor.intellisense.windowElement.getElementsByClassName('selected');
		if (sel.length === 0) {
			// select the first in the list
			var sel = editor.intellisense.windowElement.getElementsByClassName('active')[0];
			sel.classList.remove('active');
			sel.classList.add('selected');
		} else {
			sel = sel[0];
			
			var prev = sel.previousElementSibling;
			while (prev !== null && prev.style.display === "none") {
				prev = prev.previousElementSibling;
			}
			if (prev !== null) {
				sel.classList.remove('selected');			
				prev.classList.add('selected');
				sel = prev;
			}
		}
		
		if (sel.offsetTop < editor.intellisense.windowElement.scrollTop) {
			editor.intellisense.windowElement.scrollTop = sel.offsetTop;
		}
	},
	
	accept: function() {
		var sel = editor.intellisense.windowElement.getElementsByClassName('selected');
		if (sel.length == 0) return;
		sel = sel[0];
		for (var i = 0; i < editor.intellisense.hintCache.length; i++) {
			editor.backspace();
		}
		editor.insert(sel.getAttribute('data-code'));
		editor.intellisense.dismiss();
	},
	
	hintCache: '',
	currentVisibleItems: 0,
	filterHints: function() {
		var lis = editor.intellisense.windowElement.getElementsByTagName('li');
		var visibleItems = 0;
		var selectedVisible = false;
		for (var i = 0; i < lis.length; i++) {
			if (lis[i].textContent.toLowerCase().indexOf(editor.intellisense.hintCache) === -1) {
				lis[i].style.display = "none";
			} else {
				lis[i].style.display = "";
				visibleItems++;
				if (lis[i].classList.contains('selected')) {
					selectedVisible = true;
				}
				lis[i].innerHTML = lis[i].textContent.replace(new RegExp('(' + editor.intellisense.preg_quote(editor.intellisense.hintCache) + ')', 'gi'), '<u>$1</u>');
			}
		}
		
		var firstactive = -1;
		var foundselected = false;
		if (!selectedVisible) {
			var active = editor.intellisense.windowElement.getElementsByClassName('active');
			if (active.length > 0) {
				active[0].classList.remove('active');
			}
			
			for (var i = 0; i < lis.length; i++) {
			lis[i].classList.remove('selected');
			}
			for (var i = 0; i < lis.length; i++) {
				if (lis[i].style.display !== "none") {
					firstactive = i;
					if (lis[i].textContent.substr(0, editor.intellisense.hintCache.length).toLowerCase() == editor.intellisense.hintCache) {
						lis[i].classList.add('selected');
						foundselected = true;
						break;
					}
				}
			}
		}
		if (!foundselected && firstactive !== -1) {
			lis[firstactive].classList.add('active');
		}
		
		var ul = editor.intellisense.windowElement.getElementsByTagName('ul')[0];
		if (ul.offsetHeight < editor.intellisense.windowElement.offsetHeight) {
			editor.intellisense.windowElement.style.height = ul.offsetHeight;
		} else {
			editor.intellisense.windowElement.style.height = "";
		}
		
		var elmessage = editor.intellisense.windowElement.getElementsByClassName('emptylist')[0];
		if (visibleItems === 0) {
			elmessage.style.display = "block";
			editor.intellisense.windowElement.style.height = elmessage.offsetHeight;
		} else {
			elmessage.style.display = '';
		}
		
		editor.intellisense.currentVisibleItems = visibleItems;
		return visibleItems;
	},
	
	catchKey: function(e) {
		if (event.keyCode == 8 /* backspace */) {
			if (editor.intellisense.hintCache == "") {
				editor.intellisense.dismiss();
				return false;
			} else {
				editor.intellisense.hintCache = editor.intellisense.hintCache.substr(0, editor.intellisense.hintCache.length - 1);
				editor.intellisense.filterHints();
				return false;
			}
		}
	
		if (editor.intellisense.currentVisibleItems === 0) {
			editor.intellisense.dismiss();
			return false;
		}
		
		if (event.keyCode == 37 /* left */) {
			editor.intellisense.dismiss();
			return false;
		}
		
		if (event.keyCode == 39 /* right */) {
			editor.intellisense.dismiss();
			return false;
		}
		
		if (event.keyCode == 38 /* up */) {
			editor.intellisense.up();
			return true;
		}
		
		if (event.keyCode == 40 /* down */) {
			editor.intellisense.down();
			return true;
		}
		
		if (event.keyCode == 13 /* return */) {
			editor.intellisense.accept();
			return true;
		}
		
		if (event.keyCode == 32 /* space */) {
			editor.intellisense.accept();
			return false;
		}
		
		if (event.keyCode == 27 /* escape */) {
			editor.intellisense.dismiss();
			return true;
		}
		
		if (event.keyCode == 16 /* shift */) {
			return false;
		}
		
		if ((event.keyCode >= 48 && event.keyCode <= 57) || (event.keyCode >= 65 && event.keyCode <= 90)) {
			// this was alphanumeric
			editor.intellisense.hintCache += String.fromCharCode(event.keyCode).toLowerCase();
			editor.intellisense.filterHints();
			return false;
		} else {
			editor.intellisense.dismiss();
		}
		
		return false;
	},
	
	preg_quote: function(str) {
		return (str+'').replace(/([\\\.\+\*\?\[\^\]\$\(\)\{\}\=\!\<\>\|\:])/g, "\\$1");
	}

	
};