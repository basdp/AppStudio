var FH_fullheightBottomMargin = 0;

function recalculateFullHeights() {
    var bgs = document.querySelectorAll(".full-height");
    Array.prototype.forEach.call(bgs, function(el, i) {
        var rect = el.getBoundingClientRect();
        el.style.height = window.innerHeight - rect.top - FH_fullheightBottomMargin;
    });
}

function setFullHeightBottomMargin(val) {
	FH_fullheightBottomMargin = val;
	recalculateFullHeights();
}

window.addEventListener('load', function(){
    recalculateFullHeights();
});

window.addEventListener('resize', function(){
    recalculateFullHeights();
});