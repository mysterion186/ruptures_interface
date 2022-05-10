// partie pour récuperrer les liens des fichiers se trouvant dans le serveur, 
// pour pouvoir faire une requête et les afficher après
var getUrl = window.location;
var baseUrl = getUrl .protocol + "//" + getUrl.host + "/" ;
var filename = document.querySelectorAll(".filename");

// on rend chaque "fichier" clickable, lorsqu'on clique cela affiche le graphique, la fonction qui fait ça prend en paramètre l'url du fichier
filename.forEach(elt => elt.addEventListener('click', ()=>{makeplot(baseUrl+elt.id);}));

// fonction pour télécharger le fichier csv + créer le graphique
function makeplot(filename) {
    d3.csv(filename, function(data){ processData(data) } );
  };

// fonction qui va lire et créer 2 arrays qui contiennent les valeurs des abscisses et ordonnées
function processData(allRows) {

    console.log(allRows);
    var x = [], y = [], standard_deviation = [];

    for (var i=0; i<allRows.length; i++) {
        row = allRows[i];
        // console.log(row);
        // console.log(row["Valeur"]);
        y.push( row["Valeur"] );
        x.push( i );
    }
    // console.log( 'X',x, 'Y',y, 'SD',standard_deviation );
    makePlotly( x, y, standard_deviation ); // appel à la fonction qui prend en paramètre absisse et ordonnées pour créer le graph
}
// fonction qui va créer le graphe
function makePlotly( x, y, standard_deviation ){
    var plotDiv = document.getElementById("myDiv"); // position à laquelle va s'afficher le graphe dans la page HTML
    // var label_x = document.querySelectorAll(".label_coordinate") // position à laquelle va s'afficher les labels 
    // label_x.forEach(elt => elt.addEventListener("click",() =>{delete_label(layout,elt.id);Plotly.redraw('myDiv');})) // on ajoute la possibilité de supprimer sur les labels en cliquant sur la valeur + maj du graph en enlevant ce label
    // valeurs pour connaître la taille à donner aux labels (pour pas qu'ils soient trop petits ou trop grands) ici ils feront la "taille du signal"
    const line_top = Math.max.apply(Math, y);
    const line_bottom = Math.min.apply(Math, y) ;   // 1 
    // console.log(line_top, line_bottom);
    // code plotly pour indiquer quel array correspond à quoi
    var traces = [{
        x: x,
        y: y
    }];

    // objet layout qui contient le titre et par la suite les barres verticales qui représentent les labels
    var layout = { 
        title : "test",
        hovermode:'closest',
        shapes: []};
    
    // console.log(layout["shapes"]);

    Plotly.newPlot('myDiv', traces,layout,{editable: true,}); // code plotly pour afficher le graph dans la page HTMl
    
    // event sur le graph, à chaque clique on ajoute une barre verticale à l'endroit en question 
    plotDiv.on('plotly_click', function(data){
        var pts = '';
        for(var i=0; i < data.points.length; i++){
            pts = 'x = '+data.points[i].x +'\ny = '+
            data.points[i].y.toPrecision(4) + '\n\n';
            // console.log("Vous voulez ajouter une rupture au point : ",data.points[i].x );
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
            // var coordinates = document.querySelectorAll(".label_coordinate");
            // console.log("plotly ",coordinates, coordinates.length);
            Plotly.redraw('myDiv'); // maj du graph
        }
        create_label(layout,"xcoords","label_coordinate"); // fonction qui va ajouter le dernier label à la page html
        // on recharge les labels à chaque instant pour être sûr d'être toujours à jour
        var label_x = document.querySelectorAll(".label_coordinate");
        label_x.forEach(elt => elt.addEventListener("click",() =>{delete_label(layout,elt.id);Plotly.redraw('myDiv');})); // on ajoute la possibilité de supprimer sur les labels en cliquant sur la valeur + maj du graph en enlevant ce label
        // valeurs pour connaître la taille à donner aux labels (pour pas qu'ils soient trop petits ou trop grands) ici ils feront la "taille du signal"
        // console.log(layout["shapes"]);
    });
    // button qui va valider les labels 
    valide = document.getElementById("validation")
    valide.addEventListener("click",()=>{  
        var label = [];
        for (var i = 0; i < layout["shapes"].length; i++){
            label.push(layout["shapes"][i]["x0"]);
        }
        label.sort(function(a, b) {
            return a - b;
          });;
        console.log(label);
    })
    // fonction qui va à chaque fois que la souris est sûr le graphe va mettre à jour les valeurs des labels sur la page HTML
    plotDiv.addEventListener("mouseover", () =>{
        update_coordinate(layout,"xcoords");
    })
};


// fonction pour mettre à jour les coordonnées sur la page HTML
function update_coordinate(layout,id_name) {
    var display = document.getElementById(id_name);
    var tag = document.createElement("p");
    var coordinates = document.querySelectorAll(".label_coordinate");
    // console.log("func ",coordinates);
    for (var i = 0; i<layout["shapes"].length; i++){
        layout["shapes"][i]["x0"] = Math.round(layout["shapes"][i]["x0"]);
        layout["shapes"][i]["x1"] = Math.round(layout["shapes"][i]["x1"]);
        if (coordinates[i].id !== layout["shapes"][i]["x0"]){
            coordinates[i].innerHTML = layout["shapes"][i]["x0"];
            coordinates[i].id = layout["shapes"][i]["x0"];
        }
    }
}

// fonction pour ajouter les coordonnées d'un nouveau label sur la page HTML
function create_label(layout,id_name,class_name){
    var display = document.getElementById(id_name);
    var result = "";
    if (layout["shapes"].length >0 ){
        result += '<p id='+layout["shapes"][layout["shapes"].length -1 ]["x0"]+' class="label_coordinate">'+layout["shapes"][layout["shapes"].length -1 ]["x0"] +'</p>';
        display.innerHTML +=result;
    
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
    console.log(layout["shapes"]);
}