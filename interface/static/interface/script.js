// code pour rendre le formulaire d'upload responsive...
const form = document.querySelector("form");
form.reset();
fileInput = form.querySelector(".file-input")
progressArea = document.querySelector(".progress-area");
uploadedArea = document.querySelector(".uploaded-area");
console.log("Hello3");
form.addEventListener("click", ()=>{
    console.log("test eventlistener")
    fileInput.click();
});

fileInput.onchange = (e)=>{
    console.log("test on change")
    document.querySelector(".progress-area").style.display = "block";
    let file = e.target.files[0];
    console.log(e.target.files[0]/length);
    if (file){
        let fileName = file.name;
        if (fileName.length >=12 ){
            var splitname = fileName.split('.')
            fileName = splitname[0].substring(0,12)+"... ."+splitname[1];
        }
        console.log(fileName);
        uploadFile(fileName);
        console.log("upload appelé");
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
                                            <span class="name" id="filename">${name} • en cours</span>
                                            <span class="percent" id = "percent">${fileloaded} %</span>
                                        </div>
                                        <div class="progress-bar">
                                            <div class="progress" style="width:${fileloaded}%"></div>
                                        </div>
                                    </div>
                                </li>`;

            progressArea.innerHTML = progressHTML;
            console.log(loaded, progressEvent.total);
            if (loaded === progressEvent.total){
                progressArea.innerHTML = ""; // on enlève le ficher des fichiers en cours de téléchargement et on l'ajoute dans la liste de 
                // ceux qui ont été téléchargé
                var uploadHTML = `<li class="row">
                                    <div class="content">
                                        <img src="/static/interface/csv.png" alt="csv" />
                                        <div class="details">
                                            <span class="name">${name} • terminé</span>
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
