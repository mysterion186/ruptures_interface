const display = document.getElementById("affiche");
display.addEventListener("click", () => {
    console.log('click');
    const load = document.getElementById("loading");
    load.style.display = "none";
    const content = document.getElementById("content");
    content.style.display = "inline";
})