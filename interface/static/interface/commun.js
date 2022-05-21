// fichier qui va contenir les fonctions qui seront souvent utilisées 

// fonction qui va uploader le fichier sur le serveur + afficher le fichier en cours de téléchargement et tous ceux téléchargé
function uploadFile(name,form,post_url='',accueil=true){
    var formData = new FormData(form);
    var config = {
        // partei pour ajouter une barre de chargement, le fichier en cours de téléchargement et la liste des fichiers téléchargé
        onUploadProgress: (progressEvent) => {
            // on indique qu'on est entrain de télécharger le fichier (affichage d'une barre de progression)
            var fileloaded = (Math.round( (progressEvent.loaded * 100) / progressEvent.total ));
            var loaded = progressEvent.loaded;
            if (accueil){ // on exécute ce code uniquement sur la page index.html
                var progressArea = document.querySelector(".progress-area");
                var uploadedArea = document.querySelector(".uploaded-area");
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
            else{
                console.log('dans le elsse')
            }
        }
    };
    axios.post(post_url,formData, config); // envoie du fichier au serveur
}


function init_form(){
    // code pour rendre le formulaire d'upload responsive...
    const form = document.querySelector("form");
    form.reset();
    var fileInput = document.querySelector(".file-input");
    form.addEventListener("click", ()=>{
        fileInput.click();
    });
    return [form,fileInput];
}

export {uploadFile,init_form};