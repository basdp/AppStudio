function recalculateFullHeights() {
    var bgs = document.querySelectorAll(".full-height");
    Array.prototype.forEach.call(bgs, function(el, i) {
        var rect = el.getBoundingClientRect();
        el.style.height = window.innerHeight - rect.top;
    });
}

window.addEventListener('load', function(){
    recalculateFullHeights();
});

window.addEventListener('resize', function(){
    recalculateFullHeights();
});