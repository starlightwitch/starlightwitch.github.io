function addActiveClass(classSelector) {
    let activeItem = document.querySelectorAll(classSelector);

    for (let i = 0; i < activeItem.length; i++) {
        activeItem[i].className += " active";
    }
}