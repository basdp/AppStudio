function htmlEncode(encode) {
    var div = document.createElement('div');
    div.textContent = encode;
    return div.innerHTML;
}

function htmlDecode(decode) {
    var div = document.createElement('div');
    div.innerHTML = decode;
    return div.textContent;
}

function show_messagebox(text, title, buttons, callback) {
    if (title === undefined) {
        fs = require('fs')
        json = JSON.parse(fs.readFileSync('package.json', 'utf8'))
        title = json.name;
    }
    
    if (buttons === undefined) {
        buttons = [{ title: 'OK', value: true, default: true }];
    }
    
    text = htmlEncode(text);
    text = text.replace(/\n/g, '<br>');
    
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
		win.window.document.getElementById('text').innerHTML = text;
        win.window.document.getElementsByTagName('title')[0].textContent = title;
        win.window.initButtons(buttons);
        win.window.callback = callback;
	});

}
