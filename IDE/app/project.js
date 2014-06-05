var project = {
	name: "",
	location: "",
	files: [
		{name: 'test', children: []},
		{name: 'test2', children: [
			{name: 'test3', children: []},
		]},
		{name: 'test4', children: []},
	],
};

function new_project(name, location) {
	var fs = require('fs');

	name = name.trim();
	if (name == "") {
		show_messagebox("Name cannot be empty");
		return false;	
	}
	
	location = location.trim();
	if (location == "") {
		show_messagebox("Location cannot be empty");
		return false;	
	}
	
	if (fs.existsSync(location)) {
		show_messagebox(location + " already exists!");
		return false;
	}

	fs.mkdirSync(location);
	if (!fs.existsSync(location)) {
		show_messagebox("Could not create directory " + location);
		return false;
	}

	project.name = name;
	project.location = location;
	project.files = [];

	rebuild_project_treeview();

	return true;
}

function get_icon_for_filename(filename) {
	var ext = filename.substr(filename.lastIndexOf('.') + 1);
	switch (ext.toLowerCase()) {
		case "js": return 'images/icons/file-js.png';
		case "xml": return 'images/icons/file-xml.png';
		case "des": return 'images/icons/file-des.png';
		case "proj": return 'images/icons/file-proj.png';
		case "config": return 'images/icons/file-config.png';
		default: return 'images/icons/file-unknown.png';
	}
}

function add_file_to_tree(file, parentUl) {
	var node = document.createElement('li');
	var img = document.createElement('img');
	if (file.children.length > 0) {
		// this is a folder
		img.src = 'images/icons/folder.png';
		node.onrightclick = project_open_folder_contextmenu;
	} else {
		img.src = get_icon_for_filename(file.name);
		node.onrightclick = project_open_file_contextmenu;
	}
	node.setAttribute('data-location', file.location);
	node.appendChild(img);
	node.appendChild(document.createTextNode(" " + file.name));
	if (file.children.length > 0) {
		var ul = document.createElement('ul');
		node.appendChild(ul);
		file.children.forEach(function(subfile, i) {
			add_file_to_tree(subfile, ul);
		});
	}
	parentUl.appendChild(node);
}

function rebuild_project_treeview() {
	var projectNode = document.createElement('li');
	projectNode.onrightclick = project_open_folder_contextmenu;
	var img = document.createElement('img');
	img.src = "images/icons/file-project.png";
	projectNode.appendChild(img);
	projectNode.appendChild(document.createTextNode(" " + project.name));
	projectNode.setAttribute('data-location', project.location);
	var projectUl = document.createElement('ul');
	projectNode.appendChild(projectUl);
	project.files.forEach(function(file, i) {
		add_file_to_tree(file, projectUl);
	});
	var ul = document.querySelector(".projecttree .treeview");
	ul.innerHTML = "";
	ul.appendChild(projectNode);

	activate_treeview(ul);
}

var projectFolderMenu = new gui.Menu();
projectFolderMenu.append(new gui.MenuItem({ label: 'Item A' }));
projectFolderMenu.append(new gui.MenuItem({ label: 'Item B' }));
projectFolderMenu.append(new gui.MenuItem({ type: 'separator' }));
projectFolderMenu.append(new gui.MenuItem({ label: 'Item C' }));
function project_open_folder_contextmenu(e) {
	projectFolderMenu.popup(e.pageX, e.pageY);
}

var projectFileMenu = new gui.Menu();
projectFileMenu.append(new gui.MenuItem({ label: 'Item A' }));
function project_open_file_contextmenu(e) {
	projectFileMenu.popup(e.pageX, e.pageY);
}
