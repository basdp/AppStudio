// Create an empty menu
var menu = new gui.Menu();

// Add some items
menu.append(new gui.MenuItem({ label: 'Item A' }));
menu.append(new gui.MenuItem({ label: 'Item B' }));
menu.append(new gui.MenuItem({ type: 'separator' }));
menu.append(new gui.MenuItem({ label: 'Item C' }));

var menuHelp = new gui.Menu();

// Add some items
menuHelp.append(new gui.MenuItem({ label: 'Quick Start' }));
menuHelp.append(new gui.MenuItem({ label: 'Documentation' }));
menuHelp.append(new gui.MenuItem({ label: 'API References' }));
menuHelp.append(new gui.MenuItem({ type: 'separator' }));
menuHelp.append(new gui.MenuItem({ label: 'Check for Updates' }));
menuHelp.append(new gui.MenuItem({ label: 'About' }));

// Iterate menu's items
for (var i = 0; i < menu.items.length; ++i) {
  console.log(menu.items[i]);
}
function openmenu(name, el) {
    var rect = el.getBoundingClientRect();
    var menu = window.menu;
    if (name == "help") {
        menu = menuHelp;
    }
    menu.popup(rect.left, rect.bottom);
}