import {uploadFile,init_form,processData } from './commun.js'
var getUrl = window.location;
var baseUrl = getUrl .protocol + "//" + getUrl.host + "/" ;

const folder_val = document.getElementById("folder_val"); // on choppe le dossier de la session
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
    let file = e.target.files[0];
    if (file){
        let fileName = file.name;
        uploadFile(fileName,form,'prediction/signal',false);
    }
};

// fait appel au back pour lancer le code alpin_predict 
const prediction_button = document.getElementById("prediction");
prediction_button.addEventListener("click", () => {
    const file_predict = document.querySelectorAll(".filename");
    file_predict.forEach(elt => elt.addEventListener('click', ()=>{reset_page();reset_choosed_file();choosed_file(elt.id);makeplot(baseUrl+elt.id);}));
    axios.get("prediction/predict").then((response)=>{console.log(response);});
});

// fonction pour indiquer qu'on vient de cliquer sur un fichier
function choosed_file(file_id){
    const filename = document.getElementById(file_id);
    filename.classList.add("choosed");
}

// fonction pour réinitialiser les fichiers 'séléctioné' 
function reset_choosed_file(){
    const choosed = document.querySelectorAll(".choosed");
    for (let i=0; i<choosed.length; i++){
        choosed[i].classList.remove("choosed");
    }
}
// fonction pour pré-process le signal sélectionné
function makeplot(filename) {
    d3.csv(filename, function(data){ processData(data,makePlotly) } );
  };
// fonction qui va afficher les graphiques 
function makePlotly( x, y ){
    const plotDiv = document.getElementById("myDiv");
    const line_top = Math.max.apply(Math, y);
    const line_bottom = Math.min.apply(Math, y) ;   // 1 
    const display = document.getElementById("xcoords");
    const select_file = document.querySelector(".choosed"); // récuperration du fichiers choisi
    var layout = { 
        title : "test",
        hovermode:'closest',
        shapes: []};
    // code plotly pour indiquer quel array correspond à quoi
    axios.get(`prediction/coord/${folder_val.innerHTML}/${select_file.innerHTML}`).then((response)=>{
        const label_value = response["data"]["array"];
        for (let i=0; i< label_value.length;i++){
            layout["shapes"].push({
                'type': 'line',
                'x0':label_value[i],
                'y0':line_bottom,
                'x1':label_value[i],
                'y1':line_top,
                'line': {
                    'color': 'black',
                    dash: 'dot',
                    'width':3,
                }
            })
            var result = '<div id='+layout["shapes"][i]["x0"]+' class="label_coordinate">Label au point : '+layout["shapes"][i]["x0"] +'</div>';
            display.innerHTML +=result;
        }
        Plotly.redraw('myDiv');
    });
    var traces = [{
        x: x,
        y: y
    }];
    
    Plotly.newPlot('myDiv', traces,layout,{editable: false,}); // code plotly pour afficher le graph dans la page HTMl
}

// fonction pour reset la page
function reset_page(){
    const labels_zone = document.querySelectorAll(".label_coordinate");
    const choosed_file = document.querySelector(".choosed");
    for (var i=0; i<labels_zone.length; i++) {
        labels_zone[i].parentNode.removeChild(labels_zone[i]);
    }
}