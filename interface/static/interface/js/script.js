import {uploadFile,init_form,display_file} from './commun.js'

var getUrl = window.location;
var baseUrl = getUrl .protocol + "//" + getUrl.host + "/" ;


// init event listener for the form
const temp = init_form();
const form = temp[0], fileInput = temp[1];

// fonction pour réduire la taille des fichiers dans l'espace réservée à l'affichage
// event listener to send file to the backend and display the name of the selected file
fileInput.onchange = (e)=>{
    document.querySelector(".progress-area").style.display = "block";
    let file_list = e.target.files;
    // on rend le bouton "passer à l'étape suivante clickable" 
    const next_step = document.querySelector(".done");
    if (next_step !== null){
        next_step.classList.remove("done");
    }
    for (var i=0; i<file_list.length; i++){
        var file = file_list[i];
        console.log(file);
        if (file){
            let fileName = file.name;
            if (fileName.length >=12 ){
                var splitname = fileName.split('.')
                fileName = splitname[0].substring(0,12)+"... ."+splitname[1];
            }
            display_file(fileName);
        }
    }
    uploadFile(form);
};


