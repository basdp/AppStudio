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

