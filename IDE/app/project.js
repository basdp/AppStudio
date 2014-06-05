var project = {
	name: "",
	location: "",
	children: [
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
	project.children = [];

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
	if (file.children !== null) {
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
	if (file.children !== null && file.children.length > 0) {
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
	project.children.forEach(function(file, i) {
		add_file_to_tree(file, projectUl);
	});
	var ul = document.querySelector(".projecttree .treeview");
	ul.innerHTML = "";
	ul.appendChild(projectNode);

	activate_treeview(ul);
}

function get_node_for_path(path) {
	if (project.location === path) return project;
	
	var returnNode = null;
	function traverse(file, i) {
		if (file.location === path) { returnNode = file; return; }		
		if (file.children !== null) {
			file.children.forEach(traverse);
		}
	}
	project.children.forEach(traverse);
	return returnNode;
}

var lastFolderLocation = '';
function project_add_file(filename) {
	var fs = require('fs');
	if (fs.existsSync(lastFolderLocation + "/" + filename)) {
		show_messagebox(lastFolderLocation + "/" + filename + " already exists!");
		return false;
	}
	
	fs.writeFileSync(lastFolderLocation + "/" + filename, "");
	if (!fs.existsSync(lastFolderLocation + "/" + filename)) {
		show_messagebox("Could not create file " + lastFolderLocation + "/" + filename);
		return false;
	}
	
	var foldernode = get_node_for_path(lastFolderLocation);
	foldernode.children.push({ name: filename, location: lastFolderLocation + "/" + filename, children: null });
	
	rebuild_project_treeview();
	return true;
}

var lastFolderLocation = '';
function project_add_folder(filename) {
	var fs = require('fs');
	if (fs.existsSync(lastFolderLocation + "/" + filename)) {
		show_messagebox(lastFolderLocation + "/" + filename + " already exists!");
		return false;
	}
	
	fs.mkdirSync(lastFolderLocation + "/" + filename);
	if (!fs.existsSync(lastFolderLocation + "/" + filename)) {
		show_messagebox("Could not create folder " + lastFolderLocation + "/" + filename);
		return false;
	}
	
	var foldernode = get_node_for_path(lastFolderLocation);
	foldernode.children.push({ name: filename, location: lastFolderLocation + "/" + filename, children: [] });
	
	rebuild_project_treeview();
	return true;
}

function project_open() {
	var chooser = document.getElementById("fileOpenDialog");
	chooser.setAttribute("accept", ".proj");
    chooser.addEventListener("change", function(evt) {
		var fs = require('fs');
    	var json = fs.readFileSync(this.value);
		window.project = JSON.parse(json);
		rebuild_project_treeview();
    }, false);

    chooser.click();  
}

function project_save() {
	var chooser = document.getElementById("fileSaveDialog");
	chooser.setAttribute("accept", ".proj");
    chooser.addEventListener("change", function(evt) {
		var filename = this.value;
    	var dat = JSON.stringify(project);
		var fs = require('fs');
		fs.writeFile(this.value, dat, function(err) {
			if (err) {
				show_messagebox("Could not write to file " + filename);
			}
		});
    }, false);

    chooser.click();  
}

var projectFolderAddMenu = new gui.Menu();
projectFolderAddMenu.append(new gui.MenuItem({ label: 'New Item...', click: function(e) { openToolWindow('newitem.html', 800, 500); } }));
projectFolderAddMenu.append(new gui.MenuItem({ label: 'Existing Item...' }));
projectFolderAddMenu.append(new gui.MenuItem({ label: 'New Folder' }));

var projectFolderMenu = new gui.Menu();
projectFolderMenu.append(new gui.MenuItem({ label: 'New', submenu: projectFolderAddMenu }));
projectFolderMenu.append(new gui.MenuItem({ type: 'separator' }));
projectFolderMenu.append(new gui.MenuItem({ label: 'Delete' }));
projectFolderMenu.append(new gui.MenuItem({ label: 'Rename' }));
projectFolderMenu.append(new gui.MenuItem({ type: 'separator' }));
projectFolderMenu.append(new gui.MenuItem({ label: 'Properties' }));
function project_open_folder_contextmenu(e) {
	lastFolderLocation = e.target.getAttribute('data-location');
	projectFolderMenu.popup(e.pageX, e.pageY);
}

var projectFileMenu = new gui.Menu();
projectFileMenu.append(new gui.MenuItem({ label: 'Open' }));
projectFileMenu.append(new gui.MenuItem({ type: 'separator' }));
projectFileMenu.append(new gui.MenuItem({ label: 'Delete' }));
projectFileMenu.append(new gui.MenuItem({ label: 'Rename' }));
projectFileMenu.append(new gui.MenuItem({ type: 'separator' }));
projectFileMenu.append(new gui.MenuItem({ label: 'Properties' }));
function project_open_file_contextmenu(e) {
	projectFileMenu.popup(e.pageX, e.pageY);
}
