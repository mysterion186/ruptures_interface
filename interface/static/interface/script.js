import {uploadFile,init_form } from './commun.js'

var getUrl = window.location;
var baseUrl = getUrl .protocol + "//" + getUrl.host + "/" ;


// initialisation des events listener du formulaire 
const temp = init_form();
const form = temp[0], fileInput = temp[1];

// fonction pour réduire la taille des fichiers dans l'espace réservée à l'affichage
fileInput.onchange = (e)=>{
    document.querySelector(".progress-area").style.display = "block";
    let file = e.target.files[0];
    if (file){
        let fileName = file.name;
        if (fileName.length >=12 ){
            var splitname = fileName.split('.')
            fileName = splitname[0].substring(0,12)+"... ."+splitname[1];
        }
        uploadFile(fileName,form);
    }
};


// fonction dont le but est de s'assurer que les fichiers labels sont envoyé par paire json-csv
function validate_paire(){

    const uploaded_file = document.querySelectorAll(".name"); // on choppe tous les fichiers qui ont été téléversés
    var csv_array = [];
    var json_array = [];
    // boucle pour obtenir le nom des fichiers + séparation entre fichiers csv et json
    for (var i = 0; i <uploaded_file.length; i++) {
        var name = uploaded_file[i].innerText;
        var raw_name = name.split(".");
        var ext = raw_name[raw_name.length -1];
        var clean_name = raw_name.slice(0, raw_name.length-1).join('.');
        if (ext==="json"){
            json_array.push(clean_name);
        }
        else if (ext==="csv"){
            csv_array.push(clean_name);
        }
    }
    if (csv_array.length !== json_array.length){
        return false;
    }
    else if (json_array.length===0){
        console.log("Cas où il n'y a que des fichiers non labellisé, on va sur la page label");
        // window.location.href = baseUrl+"label";
    }
    else {
        var correct_files = [];
        var wrong_json = [];
        var wrong_csv = [];
        for (var i = 0; i < json_array.length; i++) {
            if (csv_array.find(elt => elt===json_array[i]) !== undefined) {
                correct_files.push(json_array[i]);
            }
            else{
                wrong_json.push(json_array[i]);
                wrong_csv.push(csv_array[i]);
            }
        }
        if (correct_files.length === json_array.length && correct_files.length >1){
            console.log(correct_files);
            console.log("On doit aller à la page prédictions")
            window.location.href = baseUrl+"prediction";
        }
        else{
            console.log(wrong_json,wrong_csv);
            return false;
        }
    }
}

const label_valide = document.querySelector("#labelise");
label_valide.addEventListener("click",()=>{console.log(validate_paire());});


// Get the modal
var modal = document.getElementById("myModal");

// Get the button that opens the modal
var btn = document.getElementById("labelise"); // bouton pour vérifier si les paires sont respectées

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// When the user clicks the button, open the modal 
btn.onclick = function() {
  modal.style.display = "block";
}

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
    axios.get('delete').then((response)=>{console.log(response);});
    modal.style.display = "none";
    window.location.reload(); 
}
