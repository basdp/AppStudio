var project = {
	name: "",
	location: "",
    dirty: false,
    filename: null,
	children: [],
};
        
function new_project(name, location) {
	var fs = require('fs');
    
	name = name.trim();
	if (name == "") {
		show_messagebox("Name cannot be empty");
		return false;	
	}
    
    if (!/^[a-zA-Z0-9\.\-\_\ ]+$/.test(name)) {
        show_messagebox("Name contains illegal characters.\nPlease only use alphanumeric characters, space, dot (.), dash (-) and underscore (_)");
        return false;
    }
	
	location = location.trim();
	if (location == "") {
		show_messagebox("Location cannot be empty");
		return false;	
	}
    
    if (!/^[a-zA-Z0-9\.\-\_]+$/.test(location)) {
        show_messagebox("Location contains illegal characters.\nPlease only use alphanumeric characters,  dot (.), dash (-) and underscore (_)");
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
    
    location = fs.realpathSync(location);

	project.name = name;
	project.location = location;
    project.filename = null;
	project.children = [];

	rebuild_project_treeview();
    
    project.dirty = true;

	return true;
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
		node.addEventListener('dblclick', function() {
			project_open_file(file.location);
		});
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
    project.dirty = true;
	return true;
}

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
    project.dirty = true;
	return true;
}

function project_open() {
	var chooser = document.getElementById("fileOpenDialog");
	chooser.setAttribute("accept", ".proj");
    chooser.addEventListener("change", function(evt) {
        project_loadprojectfile(this.value);
    }, false);

    chooser.click();  
}

function project_loadprojectfile(filename) {
    var fs = require('fs');
    var json = fs.readFileSync(filename);
    window.project = JSON.parse(json);
    project.dirty = false;
    project.filename = filename;
    rebuild_project_treeview();
    setTitle(project.name);
    
    var path = require("path");
    
    project.ternServer = new tern.Server({
        defs: [require('tern/defs/ecma5')],
        plugins: { 
            'doc_comment': true 
        },
        getFile: function(name) {
            return fs.readFileSync(path.resolve(project.location, name), "utf8");
        },
        
    });
    
    project.children.forEach(function(file) {
        if (file.children === null && file.location.substr(file.location.length - 3, 3).toLowerCase() == '.js') {
            project.ternServer.addFile(file.location);
        }
    });
}

function project_getJSON() {
    var dat = JSON.stringify(project);
    var proj = JSON.parse(dat);
    delete proj.dirty;
    delete proj.filename;
    dat = JSON.stringify(proj);
    return dat;
}

function project_save() {
	if (project.filename === null) {
        project_save_as();
    } else {
        fs.writeFile(project.filename, project_getJSON(), function(err) {
			if (err) {
				show_messagebox("Could not write to file " + project.filename);
			} else {
                project.dirty = false;
            }
		});
    }
}

function project_save_as() {
	var chooser = document.getElementById("fileSaveDialog");
	chooser.setAttribute("accept", ".proj");
    chooser.addEventListener("change", function(evt) {
		var filename = this.value;
		var fs = require('fs');
		fs.writeFile(this.value, project_getJSON(), function(err) {
			if (err) {
				show_messagebox("Could not write to file " + filename);
			} else {
                project.dirty = false;
                project.filename = filename;
            }
		});
    }, false);

    chooser.click();  
}

function file_save() {
    var editor = get_active_editor();
    editor.contentWindow.dispatchEvent(new CustomEvent('save', { 'detail': { require: require } } ));
}

function file_save_as() {
    var editor = get_active_editor();
    var chooser = document.getElementById("fileSaveDialog");
	
    editor.contentWindow.dispatchEvent(new CustomEvent('saveas', { 'detail': { chooser: chooser, require: require } } ));
}

function project_open_file(filename) {
    var title = filename;
    if (filename.indexOf('/') !== -1) {
        title = filename.substr(filename.lastIndexOf('/') + 1);   
    }
    
    if (tab_exists(filename)) {
        select_tab(filename);
    } else {
        new_tab(filename, title);
    }
}


if (window.require !== undefined) {
    
    var projectFolderAddMenu = new gui.Menu();
    projectFolderAddMenu.append(new gui.MenuItem({ label: 'New Item...', click: function(e) { openToolWindow('newitem.html', 800, 500); } }));
    projectFolderAddMenu.append(new gui.MenuItem({ label: 'Existing Item...' }));
    projectFolderAddMenu.append(new gui.MenuItem({ label: 'New Folder', click: function(e) { var folder = prompt("Folder name:"); if (folder) project_add_folder(folder); } }));

    var projectFolderMenu = new gui.Menu();
    projectFolderMenu.append(new gui.MenuItem({ label: 'New', submenu: projectFolderAddMenu }));
    projectFolderMenu.append(new gui.MenuItem({ type: 'separator' }));
    projectFolderMenu.append(new gui.MenuItem({ label: 'Delete' }));
    projectFolderMenu.append(new gui.MenuItem({ label: 'Rename' }));
    projectFolderMenu.append(new gui.MenuItem({ type: 'separator' }));
    projectFolderMenu.append(new gui.MenuItem({ label: 'Properties' }));
    function project_open_folder_contextmenu(e) {
        var target = e.target;
        if (e.target.nodeName.toLowerCase() === 'img') {
            target = target.parentElement;
        }
        lastFolderLocation = target.getAttribute('data-location');
        projectFolderMenu.popup(e.pageX, e.pageY);
    }

    var lastFileLocation = null;

    var projectFileMenu = new gui.Menu();
    projectFileMenu.append(new gui.MenuItem({ label: 'Open', click: function(e) { project_open_file(lastFileLocation); } }));
    projectFileMenu.append(new gui.MenuItem({ type: 'separator' }));
    projectFileMenu.append(new gui.MenuItem({ label: 'Delete' }));
    projectFileMenu.append(new gui.MenuItem({ label: 'Rename' }));
    projectFileMenu.append(new gui.MenuItem({ type: 'separator' }));
    projectFileMenu.append(new gui.MenuItem({ label: 'Properties' }));
    function project_open_file_contextmenu(e) {
        lastFileLocation = e.target.getAttribute('data-location');
        projectFileMenu.popup(e.pageX, e.pageY);
    }

    require('tern/plugin/doc_comment');
    var tern = require('tern');
    
}
