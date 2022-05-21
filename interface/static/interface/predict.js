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
    axios.post('prediction/signal',formData, config); // envoie du fichier au serveur
}