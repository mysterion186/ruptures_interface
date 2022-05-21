import {uploadFile,init_form } from './commun.js'
var getUrl = window.location;
var baseUrl = getUrl .protocol + "//" + getUrl.host + "/" ;

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


// initialisation des events listener du formulaire 
const temp = init_form();
const form = temp[0], fileInput = temp[1];

fileInput.onchange = (e)=>{
    document.querySelector(".progress-area").style.display = "block";
    let file = e.target.files[0];
    if (file){
        let fileName = file.name;
        // if (fileName.length >=12 ){
        //     var splitname = fileName.split('.')
        //     fileName = splitname[0].substring(0,12)+"... ."+splitname[1];
        // }
        uploadFile(fileName,form,'prediction/signal',false);
    }
};
