function makeplot(filename) {
    d3.dsv(' ')(filename, function(data){ processData(data,makePlotly) } );
  };

// fonction qui va lire et créer 2 arrays qui contiennent les valeurs des abscisses et ordonnées
function processData(allRows,func) {
    const columns = Object.keys(allRows[0]); // on choppe le nom des colonnes 
    var traces = Array(columns.length); // on crée un array vide avec le bon nombre de colonne
    // on initialise l'objet traces 
    for (var i = 0; i < traces.length; i++) {
        traces[i] = { x : [],y : [], type:'scatter'};
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

function makePlotly(traces,line_bottom,line_top ){
    var plotDiv = document.getElementById("myDiv");

    var layout = { 
        title : "test",
        // hovermode:'closest',
        shapes: [],
        // dragmode:"select",
    
    };
    
    console.log(traces);
    var trace1 = {
        type: 'scatter',
        x: [1, 2, 3, 4], 
        y: [10, 15, 13, 17],
        name:"t1"
      };
      var trace2 = {
        type: 'scatter',
        x: [1, 2, 3, 4], 
        y: [16, 5, 11, 9],
        name:"t2"
      };
      var data = [trace1, trace2];
      console.log(data);
      Plotly.newPlot('myDiv', data,layout,{editable:true});
      
      var graphDiv = document.getElementById("myDiv");
      console.log("test");
      graphDiv.on('plotly_selected', function(eventData) {
        var xRange = eventData.range.x;
        var yRange = eventData.range.y;
        console.log("x0 = ",xRange[0]," x1 = ",xRange[1]," y0 = ",yRange[0]," y1 = ",yRange[1]);
      });

    // Plotly.newPlot('myDiv', traces,layout,{editable: true,});
    

    

    // // code pour créer une zone sur le graphique
    // plotDiv.on('plotly_selected', function(eventData) {
    //     var xRange = eventData.range.x;
    //     var yRange = eventData.range.y;
    //     console.log("x0 = ",xRange[0]," x1 = ",xRange[1]," y0 = ",yRange[0]," y1 = ",yRange[1]);
    //     // trait vertical en x0
    //     layout["shapes"].push({
    //         'x0':xRange[0],
    //         'y0':yRange[0],
    //         'x1':xRange[0],
    //         'y1':yRange[1],
    //         'markers': {
    //             'color': 'red',
    //              dash: 'dot',
    //             'width':3,
    //         }
    //     })
        
    //     Plotly.redraw('myDiv');
    // });

    plotDiv.on('plotly_click', function(data){
        var pts = '';
        for(var i=0; i < data.points.length; i++){
            pts = 'x = '+data.points[i].x +'\ny = '+
            data.points[i].y.toPrecision(4) + '\n\n';
            console.log("Vous voulez ajouter une rupture au point : ",data.points[i].x );
            layout["shapes"].push({
                'x0':data.points[i].x,
                'y0':line_bottom,
                'x1':data.points[i].x,
                'y1':line_top,
                'markers': {
                    'color': 'black',
                     dash: 'dot',
                    'width':3,
                }
            })
            Plotly.redraw('myDiv');
        }
    });
};

makeplot("976/train/2.csv");