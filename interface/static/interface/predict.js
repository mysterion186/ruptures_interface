var getUrl = window.location;
var baseUrl = getUrl .protocol + "//" + getUrl.host + "/" ;

// const display = document.getElementById("affiche");
// display.addEventListener("click", () => {
//     console.log('click');
//     const load = document.getElementById("loading");
//     load.style.display = "none";
//     const content = document.getElementById("content");
//     content.style.display = "inline";
// })

console.log("appelle axios ",baseUrl+'train')
axios(baseUrl+'train').then((response) => {
    console.log(response);
    const load = document.getElementById("loading");
    load.style.display = "none";
    const content = document.getElementById("content");
    content.style.display = "inline";
    const pen_section = document.getElementById("penalite");
    var pen_json = response["data"]["body"];
    for (var key in pen_json) {
        pen_section.innerHTML +='<div class="pen_value">'+key+' : '+pen_json[key] +'</div>';
    }
});