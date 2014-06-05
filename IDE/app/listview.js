window.addEventListener('DOMContentLoaded', function(){
    var treeviews = document.querySelectorAll(".listview");
    Array.prototype.forEach.call(treeviews, function(el, i) {      
        var allitems = el.querySelectorAll("li");
        Array.prototype.forEach.call(allitems, function(el, i) {
            el.addEventListener('mousedown', function(e) {
                Array.prototype.forEach.call(allitems, function(el, i) {
                    el.classList.remove('selected');
                });
                el.classList.add('selected');
                e.stopPropagation();
            });
        });
    });
});
