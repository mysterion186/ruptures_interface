import {processData} from './commun.js'

// partie pour récuperrer les liens des fichiers se trouvant dans le serveur, 
// pour pouvoir faire une requête et les afficher après
var getUrl = window.location;
var baseUrl = getUrl .protocol + "//" + getUrl.host + "/" ;
var filename = document.querySelectorAll(".filename");

// on rend chaque "fichier" clickable, lorsqu'on clique cela affiche le graphique, la fonction qui fait ça prend en paramètre l'url du fichier
filename.forEach(elt => elt.addEventListener('click', ()=>{reset_page();choosed_file(elt.id);makeplot(baseUrl+elt.id);}));

// fonction pour télécharger le fichier csv + créer le graphique
function makeplot(filename) {
    d3.dsv(' ')(filename, function(data){ processData(data,makePlotly) } );
  };

// fonction qui va créer le graphe
function makePlotly( traces,line_bottom,line_top ){
    var plotDiv = document.getElementById("myDiv"); // position à laquelle va s'afficher le graphe dans la page HTML
    // objet layout qui contient le titre et par la suite les barres verticales qui représentent les labels
    var layout = { 
        title : "test",
        hovermode:'closest',
        shapes: []};
    const folder_val = document.getElementById("folder_val"); // on choppe le dossier de la session
    const selected_file = document.querySelector(".choosed");
    axios.get(`prediction/coord/${folder_val.innerHTML}/train/${selected_file.innerHTML}`).then((response) => {
        const label_array = response["data"]["array"];
        for (var i = 0; i < label_array.length; i++){
            layout["shapes"].push({
                'type': 'line',
                'x0':label_array[i],
                'y0':line_bottom,
                'x1':label_array[i],
                'y1':line_top,
                'line': {
                    'color': 'black',
                     dash: 'dot',
                    'width':3,
                }
            })
            create_label(layout,"left","right"); // fonction qui va ajouter le dernier label à la page html
            event_listener_label("label_coordinate",layout);
        }
        Plotly.redraw('myDiv');
    });

    Plotly.newPlot('myDiv', traces,layout,{editable: true,}); // code plotly pour afficher le graph dans la page HTMl
    
    // event sur le graph, à chaque clique on ajoute une barre verticale à l'endroit en question 
    plotDiv.on('plotly_click', function(data){
        var pts = '';
        for(var i=0; i < data.points.length; i++){
            layout["shapes"].push({
                'type': 'line',
                'x0':data.points[i].x,
                'y0':line_bottom,
                'x1':data.points[i].x,
                'y1':line_top,
                'line': {
                    'color': 'black',
                     dash: 'dot',
                    'width':3,
                }
            })
            Plotly.redraw('myDiv'); // maj du graph
        }
        create_label(layout,"left","right"); // fonction qui va ajouter le dernier label à la page html
        event_listener_label("label_coordinate",layout);
    });
    // fonction qui va à chaque fois que la souris est sûr le graphe va mettre à jour les valeurs des labels sur la page HTML
    plotDiv.addEventListener("mouseover", () =>{
        update_coordinate(layout);
    })
};

// fonction pour ajouter les différents events sur les coordonnées (suppression + changement de couleur de la ligne)
function event_listener_label(class_name,layout){
    var label_x = document.querySelectorAll("."+class_name);
    // label_x.forEach(elt => elt.addEventListener("click",() =>{delete_label(layout,elt.id);Plotly.redraw('myDiv');})); // on ajoute la possibilité de supprimer sur les labels en cliquant sur la valeur + maj du graph en enlevant ce label
    // valeurs pour connaître la taille à donner aux labels (pour pas qu'ils soient trop petits ou trop grands) ici ils feront la "taille du signal"
    // event pour changer la couleurs des barres verticales pour les identifier plus facilement
    label_x.forEach(elt => elt.addEventListener("mouseover",()=>{
        delete_cross("cross"); // suppression des croix
        change_color(elt.id,"blue",layout); // changement de couleur de la ligne verticale
        const cross = document.getElementById("cross_"+elt.id); // on cherche à afficher la croix 
        cross.innerHTML = "&#10060;"
        cross.addEventListener("click",()=>{delete_label(layout,elt.id);Plotly.redraw('myDiv');})
    }))
    label_x.forEach(elt => elt.addEventListener("mouseleave",()=>{change_color(elt.id,"black",layout);}))
}

// fonction pour mettre à jour les coordonnées sur la page HTML
function update_coordinate(layout) {
    var coordinates = document.querySelectorAll(".label_coordinate");
    var crosses = document.querySelectorAll(".cross");
    // console.log(crosses);
    // il doit y avoir autant de coordonnées que de croix 
    for (var i = 0; i<layout["shapes"].length; i++){
        var coordinates = document.querySelectorAll(".label_coordinate");
        layout["shapes"][i]["x0"] = Math.round(layout["shapes"][i]["x0"]);
        layout["shapes"][i]["x1"] = Math.round(layout["shapes"][i]["x1"]);
        if (coordinates[i] !== undefined){
            if (coordinates[i].id !== layout["shapes"][i]["x0"] ){
                coordinates[i].innerHTML = 'Label au point : '+layout["shapes"][i]["x0"];
                coordinates[i].id = layout["shapes"][i]["x0"];
                crosses[i].id = "cross_"+layout["shapes"][i]["x0"];
            }
        }
    }
}

// fonction pour ajouter les coordonnées d'un nouveau label sur la page HTML
function create_label(layout,id_name,id_name_2){
    var display = document.getElementById(id_name);
    var display_r = document.getElementById(id_name_2);
    var result = "";
    var result_r = "";
    if (layout["shapes"].length >0 ){
        result += '<div id='+layout["shapes"][layout["shapes"].length -1 ]["x0"]+' class="label_coordinate">Label au point : '+layout["shapes"][layout["shapes"].length -1 ]["x0"] +'</div>';
        result_r = '<div id=cross_'+layout["shapes"][layout["shapes"].length -1 ]["x0"]+' class="cross"></div>';
        display.innerHTML +=result;
        display_r.innerHTML+=result_r;
    }
    
}

// fonction pour supprimer un label du graphique et de la page HTML
function delete_label(layout,elt_id){
    for (var i=0; i < layout["shapes"].length; i++){
        var id_value = parseInt(elt_id);
        if (layout["shapes"][i]["x0"] === id_value){
            layout["shapes"].splice(i, 1);
        }
    }
    var x_coord = document.getElementById(elt_id);
    x_coord.parentNode.removeChild(x_coord);
    var coord_cross = document.getElementById("cross_"+elt_id);
    coord_cross.parentNode.removeChild(coord_cross);
}

// fonction pour supprimer l'affichage des croix
function delete_cross(class_name){
    const crosses = document.querySelectorAll("."+class_name);
    for (var i=0; i < crosses.length; i++){
        crosses[i].innerHTML = "";
    }
}
// fonction pour changer la couleur des barres verticales
function change_color(elt_id, color,layout){
    for (var i=0; i < layout["shapes"].length; i++){
        if (layout["shapes"][i]["x0"]===parseInt(elt_id)) {
            layout["shapes"][i]["line"]["color"] = color;
            if(layout["shapes"][i]["line"]["color"]==="black"){
                layout["shapes"][i]["line"]["width"]-= 3;
            }
            else {
                layout["shapes"][i]["line"]["width"]+= 3;
            }
        }
    }
    Plotly.redraw('myDiv'); // maj du graph
}

// fonction dont le but est de supprimer les lables sur le côté 
function reset_page(){
    set_validation_text();
    delete_cross();
    const labels_zone = document.querySelectorAll(".label_coordinate");
    const choosed_file = document.querySelector(".choosed");
    if (choosed_file !== null) {
        choosed_file.classList.remove("choosed");
    }
    for (var i=0; i<labels_zone.length; i++) {
        labels_zone[i].parentNode.removeChild(labels_zone[i]);
    }
    const coord_cross = document.querySelectorAll(".cross");
    for (var i = 0; i <coord_cross.length; i++){
        coord_cross[i].parentNode.removeChild(coord_cross[i]);
    }
    Plotly.purge('myDiv');
}

function choosed_file(file_id){
    const filename = document.getElementById(file_id);
    filename.classList.add("choosed");
}

const validation_button = document.getElementById("validation");
validation_button.addEventListener("click",()=>{
    if (validation_button.innerHTML === "Valider les labels"){
        validation();
    }
    else {
        window.location.href=baseUrl+"prediction";
        console.log('changement de page');
    }
    })
function validation(){
    // on choppe le fichier 'actif'
    const choosed_file = document.querySelector(".choosed");
    const file_id = choosed_file.id;
    choosed_file.classList.remove("choosed"); // on lui enlève la couleur orange
    choosed_file.classList.add("done"); // on supprime la possibilité de cliquer sur ce fichier

    const labels = document.querySelectorAll(".label_coordinate");
    var labels_array = []
    for (var i=0; i < labels.length; i++){
        labels_array.push(labels[i].id);
    }
    send_data(file_id,labels_array);
    reset_page(); // on reset la page après avoir validé
}

// fonction pour envoyer les données au backend 
function send_data(filename,label_array){
    axios.post('add',{
        filename : filename,
        labels : label_array
    }).then((response) => {
        console.log(response);
    })
}
// fonction pour mettre à jour le texte du bouton validation
function set_validation_text() {
    const filename = document.querySelectorAll(".filename");
    const processed = document.querySelectorAll(".done");
    const validation_button = document.getElementById("validation");
    if (processed.length === filename.length){
        validation_button.innerHTML = "Entraîner le modèle";
    }
}

function redirect(){
    var url = baseUrl+"/prediction";
    window.location(url);
}