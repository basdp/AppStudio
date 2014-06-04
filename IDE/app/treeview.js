window.addEventListener('DOMContentLoaded', function(){
    var treeviews = document.querySelectorAll(".treeview");
    Array.prototype.forEach.call(treeviews, function(el, i) {
        // expandable nodes
        var subtrees = el.querySelectorAll("li > ul");
        Array.prototype.forEach.call(subtrees, function(el, i) {
            var expandableNode = el.parentElement;
            expandableNode.addEventListener('dblclick', function(e) {
                if (e.y < expandableNode.getBoundingClientRect().top + 20) {
                    if (expandableNode.classList.contains("closed")) {
                        // open the node
                        expandableNode.classList.remove("closed");
                    } else {
                        expandableNode.classList.add("closed");
                    }
                }
                e.stopPropagation();
            });
            expandableNode.addEventListener('mouseup', function(e) {
                if (e.x < expandableNode.getBoundingClientRect().left) {
                    if (expandableNode.classList.contains("closed")) {
                        // open the node
                        expandableNode.classList.remove("closed");
                    } else {
                        expandableNode.classList.add("closed");
                    }
                }
                e.stopPropagation();
            });
        });
        
        // node selection
        var allitems = el.querySelectorAll("li");
        Array.prototype.forEach.call(allitems, function(el, i) {
            el.addEventListener('mousedown', function(e) {
                if (e.y > el.getBoundingClientRect().top + 20 || e.x < el.getBoundingClientRect().left) {
                    return false;
                }
                
                Array.prototype.forEach.call(allitems, function(el, i) {
                    el.classList.remove('selected');
                });
                el.classList.add('selected');
                e.stopPropagation();
            });
        });
    });
});
