function show_messagebox(text) {
	var win = gui.Window.open("messagebox.html", { 
		position: 'center', 
		width: 300, 
		height: 100,
		resizable: false,
		show_in_taskbar: false,
		frame: true, 
		toolbar: false,
		focus: true
	});
	win.on('loaded', function(){
		win.window.document.getElementById('text').textContent = text;
	});

}