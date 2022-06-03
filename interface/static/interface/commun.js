// fichier qui va contenir les fonctions qui seront souvent utilisées 

// function that will display uploaded files on the right side 
function display_file(name,home=true){
    if (home) { // case we want to display uploaded file in the home page
        var uploadedArea = document.querySelector(".uploaded-area");
        var uploadHTML = `<li class="row">
                                        <div class="content">
                                            <img src="/static/interface/csv.png" alt="csv" />
                                            <div class="details">
                                                <span class="name">${name}</span>
                                            </div>
                                        </div>
                                        <img src="/static/interface/check.png" alt="check" />
                                    </li>`;
                    uploadedArea.insertAdjacentHTML("afterbegin",uploadHTML);
    }
    else {
        const folder_val = document.getElementById("folder_val"); // on choppe le dossier de la session
        var fileArea = document.getElementById("label_predict");
        const detect_ext = name.split(".");
        // console.log(detect_ext[detect_ext.length-1]);
        if (detect_ext[detect_ext.length-1]==="csv"){
            var predict_name = `<h1 class="filename" id="media/${folder_val.innerHTML}/test/${name}">${name}</a></h1>`;
            fileArea.innerHTML +=predict_name;
        }
        else {
            var predict_name = `<h1 class="filename done" id="media/${folder_val.innerHTML}/test/${name}">${name}</a></h1>`;
            fileArea.innerHTML +=predict_name;
        }
    }
}    

// fonction qui va uploader le fichier sur le serveur + afficher le fichier en cours de téléchargement et tous ceux téléchargé
function uploadFile(form,post_url=''){
    var formData = new FormData(form);
    axios.post(post_url,formData); // envoie du fichier au serveur
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

// fonction qui va lire et créer 2 arrays qui contiennent les valeurs des abscisses et ordonnées
function processData(allRows,func) {
    const columns = Object.keys(allRows[0]); // on choppe le nom des colonnes 
    var traces = Array(columns.length); // on crée un array vide avec le bon nombre de colonne
    // on initialise l'objet traces 
    for (var i = 0; i < traces.length; i++) {
        traces[i] = { x : [],y : [],type:'scatter'};
    }
    for (var i=0; i<allRows.length; i++) { // boucle sur les lignes du fichier
        for (var k=0; k<columns.length;k++){
            var row = allRows[i];
            traces[k]["y"].push(row[columns[k]]);
            traces[k]["x"].push(i);
            traces[k]["name"] = columns[k];
        }
    }

    // boucle pour déterminer la plus grande et la plus petite valeur du fichier csv 
    var line_top = 0;
    var line_bottom = 0;
    for (var i=0; i<traces.length; i++){
        var temp_top = Math.max.apply(Math,traces[i]['y']);
        var temp_bottom = Math.min.apply(Math, traces[i]['y']) ; 
        // console.log("temp ",temp_top, temp_bottom); 
        if (temp_top > line_top) {
            line_top = temp_top;
        }
        if (line_bottom > temp_bottom) {
            line_bottom = temp_bottom;
        }
    }
    func( traces,line_bottom,line_top ); // appel à la fonction qui prend en paramètre absisse et ordonnées pour créer le graph
}

export {uploadFile,init_form,processData,display_file};