var texteditor = { extension: '.txt', url: '../../Components/CodeEdit/main.html', toolbar: 'tools-text' };
var webbrowsereditor = { extension: '.html', url: 'webbrowser.html', toolbar: 'tools-web' };

var editors = [
	{ extension: '.js', url: '../../Components/CodeEdit/main.html', toolbar: 'tools-js' },
	{ extension: '.xml', url: '../../Components/CodeEdit/main.html', toolbar: 'tools-xml' },
	webbrowsereditor,
    texteditor,
];

function get_editor_for_filename(filename) {
	var ext = filename.substr(filename.lastIndexOf('.')).toLowerCase();
	
	var editor = texteditor;
	
	editors.forEach(function(ed) {
		if (ed.extension == ext) editor = ed;
	});
	
	return editor;
}