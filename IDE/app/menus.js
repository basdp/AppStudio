function openToolWindow(url, width, height) {
	var win = gui.Window.open(url, { 
		position: 'center', 
		width: width, 
		height: height,
		resizable: false,
		show_in_taskbar: false,
		frame: true, 
		toolbar: false,
		focus: true,
		show: false
	});
	win.on('loaded', function(){
		win.show();
	   	if (win.window.haveParent !== undefined) {
			win.window.haveParent(window);
		}
	});
}

// Create an empty menu
var menu = new gui.Menu();
menu.append(new gui.MenuItem({ label: 'Item A' }));
menu.append(new gui.MenuItem({ label: 'Item B' }));
menu.append(new gui.MenuItem({ type: 'separator' }));
menu.append(new gui.MenuItem({ label: 'Item C' }));

var menuFile = new gui.Menu();
var menuFileNew = new gui.Menu();
menuFileNew.append(new gui.MenuItem({ label: 'Project', click: function() { openToolWindow('newproject.html', 800, 500); }}));
menuFile.append(new gui.MenuItem({ label: 'New', submenu: menuFileNew }));
menuFile.append(new gui.MenuItem({ label: 'Open Project...', click: function() { project_open(); } }));
menuFile.append(new gui.MenuItem({ label: 'Save Project', click: function() { project_save(); } }));
menuFile.append(new gui.MenuItem({ type: 'separator' }));
menuFile.append(new gui.MenuItem({ label: 'Check for Updates' }));
menuFile.append(new gui.MenuItem({ label: 'Exit', click: function() { window.close(); } }));

var menuHelp = new gui.Menu();
menuHelp.append(new gui.MenuItem({ label: 'Quick Start' }));
menuHelp.append(new gui.MenuItem({ label: 'Documentation' }));
menuHelp.append(new gui.MenuItem({ label: 'API References' }));
menuHelp.append(new gui.MenuItem({ type: 'separator' }));
menuHelp.append(new gui.MenuItem({ label: 'Open Debug Inspector', click: function() { require('nw.gui').Window.get().showDevTools() } }));
menuHelp.append(new gui.MenuItem({ type: 'separator' }));
menuHelp.append(new gui.MenuItem({ label: 'Check for Updates' }));
menuHelp.append(new gui.MenuItem({ label: 'About', click: function() { show_messagebox("AppStudio by Bas du Pré"); } }));

function openmenu(name, el) {
    var rect = el.getBoundingClientRect();
    var menu = window.menu;
    if (name == "help") menu = menuHelp;
    if (name == "file") menu = menuFile;
    menu.popup(rect.left, rect.bottom);
}
