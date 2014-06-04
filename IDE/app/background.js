function recalculateBackgroundOffsets() {
    var bgs = document.querySelectorAll(".bg-dark, .bg-light");
    Array.prototype.forEach.call(bgs, function(el, i) {
        var rect = el.getBoundingClientRect();
        el.style.backgroundPositionX = -rect.left;
        el.style.backgroundPositionY = -rect.top;
    });
}

window.addEventListener('load', function(){
    recalculateBackgroundOffsets();
});

window.addEventListener('resize', function(){
    recalculateBackgroundOffsets();
});