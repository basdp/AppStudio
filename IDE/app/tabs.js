function get_active_editor() {
    var editor = null;
    var alliframes = content.querySelectorAll("iframe");
    Array.prototype.forEach.call(alliframes, function(el, i) {
        if (el.style.display != 'none') editor = el;
    });
    return editor;
}

function new_tab(filename, title, open, editor) {
	open = open === undefined ? true : open;
	editor = editor === undefined ? get_editor_for_filename(filename) : editor;
    title = title === undefined ? filename : title;
    
	var tabbar = document.getElementById('tabbar');
	var tab = document.createElement('li');
	var icon = document.createElement('img');
	icon.src = get_icon_for_filename(filename);
	var close = document.createElement('div');
	close.classList.add('closebutton');
	close.addEventListener('mousedown', function(e) {
		e.stopPropagation();
	});
    var titlenode = document.createTextNode(title);
    
	tab.appendChild(icon);
	tab.appendChild(titlenode);
	tab.appendChild(close);
	
	tab.setAttribute('data-filename', filename);
	
	var iframe = document.createElement('iframe');
	iframe.src = editor.url;
	iframe.setAttribute('data-filename', filename);
	var content = document.getElementById('content');
	content.appendChild(iframe);
	
	var selecttab = function () {
		var alltabs = tabbar.querySelectorAll("li");
		Array.prototype.forEach.call(alltabs, function(el, i) {
			el.classList.remove('selected');
		});
		
		var alliframes = content.querySelectorAll("iframe");
		Array.prototype.forEach.call(alliframes, function(el, i) {
			el.style.display = 'none';
		});
		
		var alltoolbars = document.querySelectorAll("#toolbar div");
		Array.prototype.forEach.call(alltoolbars, function(el, i) {
			el.style.display = 'none';
		});
		
		tab.classList.add('selected');
		iframe.style.display = 'block';
		document.getElementById('emptycontent').style.display = "none";
		var toolbar = document.querySelector("#toolbar div." + editor.toolbar);
		if (toolbar) toolbar.style.display = 'block';
	}
	
	tab.addEventListener('mousedown', selecttab);
    tab.select = selecttab;
    tab.iframe = iframe;
	
	close.addEventListener('click', function() {
		var previoustab = null;
		if (tab.classList.contains('selected')) {
			previoustab = tab.previousElementSibling;
			document.getElementById('emptycontent').style.display = "block";
		}
		tabbar.removeChild(tab);
		content.removeChild(iframe);
		if (previoustab) {
			previoustab.dispatchEvent(new Event('mousedown'));
		} else {
            var toolbar = document.querySelector("#toolbar div." + editor.toolbar);
            if (toolbar) toolbar.style.display = "none";
        }
	});
	
	tabbar.appendChild(tab);
	if (open) {
		selecttab();
	}
    
    iframe.contentWindow.addEventListener('DOMContentLoaded', function(){
        iframe.contentWindow.tabmanager = {
            require: require,
            toolbar: document.querySelector("#toolbar div." + editor.toolbar),
            editor: editor,
            
            setTitle: function(title) {
                titlenode.textContent = title;
            },
            
            setDirty: function(isdirty) {
                if (isdirty) {
                    tab.classList.add('dirty');
                } else {
                    tab.classList.remove('dirty');
                }
            },
        };
        iframe.contentWindow.dispatchEvent(new CustomEvent('tabmanageravailable', { 'detail': { 'require': require } } ));
        iframe.contentWindow.dispatchEvent(new CustomEvent('openlocation', { 'detail': { 'location': filename, 'require': require, 'toolbar': document.querySelector("#toolbar div." + editor.toolbar) } } ));
    });
}

function get_tab(filename) {
	var tabbar = document.getElementById('tabbar');
    var tab = null;
    var alltabs = tabbar.querySelectorAll("li");
    Array.prototype.forEach.call(alltabs, function(el, i) {
        if (el.getAttribute('data-filename') == filename) tab = el;
    });
    return tab;
}

function tab_exists(filename) {
    return !(get_tab(filename) === null);   
}

function select_tab(filename) {
    var tab = get_tab(filename);
    if (tab === null) return false;
    
    tab.select(); 
    
    return true;
}
