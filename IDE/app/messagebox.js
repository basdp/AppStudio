function show_messagebox(text, title, buttons, callback) {
    if (title === undefined) {
        fs = require('fs')
        json = JSON.parse(fs.readFileSync('package.json', 'utf8'))
        title = json.name;
    }
    
    if (buttons === undefined) {
        buttons = [{ title: 'OK', value: true, default: true }];
    }
    
	var win = gui.Window.open("messagebox.html", { 
		position: 'center', 
		width: 300, 
		height: 100,
		resizable: false,
		show_in_taskbar: dialogShowInTaskbar(),
		frame: true, 
		toolbar: false,
		focus: true,
		show: false
	});
    
	win.on('loaded', function(){
		win.show();
		win.window.document.getElementById('text').textContent = text;
        win.window.document.getElementsByTagName('title')[0].textContent = title;
        win.window.initButtons(buttons);
        win.window.callback = callback;
	});

}
