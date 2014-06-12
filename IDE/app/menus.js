function dialogShowInTaskbar() {
    if (process.platform === 'darwin') {
        return true; // workaround
    }
    return false;
}

function openToolWindow(url, width, height) {
	var win = gui.Window.open(url, { 
		position: 'center', 
		width: width, 
		height: height,
		resizable: false,
		show_in_taskbar: dialogShowInTaskbar(),
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
if (window.require !== undefined) {
    
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
menuFile.append(new gui.MenuItem({ label: 'Save Current File', click: function() { file_save(); } }));
menuFile.append(new gui.MenuItem({ label: 'Save Current File As...', click: function() { file_save_as(); } }));
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
    

if (process.platform === 'darwin') {
    var menubar = new gui.Menu({ type: 'menubar' });
    gui.Window.get().menu = menubar;
    menubar.insert(new gui.MenuItem({ label: 'File', submenu: menuFile }), 1);
    //menubar.append(new gui.MenuItem({ label: 'Edit', submenu: menuFile }));
    //menubar.append(new gui.MenuItem({ label: 'Project', submenu: menuFile }));
    //menubar.append(new gui.MenuItem({ label: 'Build', submenu: menuFile }));
    //menubar.append(new gui.MenuItem({ label: 'Team', submenu: menuFile }));
    //menubar.append(new gui.MenuItem({ label: 'Tools', submenu: menuFile }));
    menubar.append(new gui.MenuItem({ label: 'Help', submenu: menuHelp }));
}

}