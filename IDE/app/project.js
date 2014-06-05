function new_project(name, location) {
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
	
	return true;
}