var getUrl = window.location;
var baseUrl = getUrl .protocol + "//" + getUrl.host + "/" ;


// code pour rendre le formulaire d'upload responsive...
const form = document.querySelector("form");
form.reset();
fileInput = form.querySelector(".file-input")
progressArea = document.querySelector(".progress-area");
uploadedArea = document.querySelector(".uploaded-area");
form.addEventListener("click", ()=>{
    fileInput.click();
});

fileInput.onchange = (e)=>{
    document.querySelector(".progress-area").style.display = "block";
    let file = e.target.files[0];
    if (file){
        let fileName = file.name;
        if (fileName.length >=12 ){
            var splitname = fileName.split('.')
            fileName = splitname[0].substring(0,12)+"... ."+splitname[1];
        }
        uploadFile(fileName);
    }
};

// fonction qui va uploader le fichier sur le serveur + afficher le fichier en cours de téléchargement et tous ceux téléchargé
function uploadFile(name){
    var formData = new FormData(form);
    var config = {
        // partei pour ajouter une barre de chargement, le fichier en cours de téléchargement et la liste des fichiers téléchargé
        onUploadProgress: (progressEvent) => {
            // on indique qu'on est entrain de télécharger le fichier (affichage d'une barre de progression)
            var fileloaded = (Math.round( (progressEvent.loaded * 100) / progressEvent.total ));
            var loaded = progressEvent.loaded;
            var progressHTML = `<li class="row">         
                                    <img src="/static/interface/csv.png" alt="csv" />
                                    <div class="content">
                                        <div class="details">
                                            <span class="name" id="filename">${name}</span>
                                            <span class="percent" id = "percent">${fileloaded} %</span>
                                        </div>
                                        <div class="progress-bar">
                                            <div class="progress" style="width:${fileloaded}%"></div>
                                        </div>
                                    </div>
                                </li>`;

            progressArea.innerHTML = progressHTML;
            if (loaded === progressEvent.total){
                progressArea.innerHTML = ""; // on enlève le ficher des fichiers en cours de téléchargement et on l'ajoute dans la liste de 
                // ceux qui ont été téléchargé
                var uploadHTML = `<li class="row">
                                    <div class="content">
                                        <img src="/static/interface/csv.png" alt="csv" />
                                        <div class="details">
                                            <span class="name">${name}</span>
                                            <span class="size">${progressEvent.total}</span>
                                        </div>
                                    </div>
                                    <img src="/static/interface/check.png" alt="check" />
                                </li>`;
    
                uploadedArea.insertAdjacentHTML("afterbegin",uploadHTML);
            }
        }
    };
    axios.post('',formData, config); // envoie du fichier au serveur
}

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
            window.location.href = baseUrl+"prediction"
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
var btn = document.getElementById("labelise");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// When the user clicks the button, open the modal 
btn.onclick = function() {
  modal.style.display = "block";
}

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
  modal.style.display = "none";
}
