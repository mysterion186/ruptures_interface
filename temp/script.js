
// display_from_origin();
// const display = document.getElementById("affiche");
// display.addEventListener("click", () => {
//     console.log('click');
//     const load = document.getElementById("loading");
//     load.style.display = "none";
//     const content = document.getElementById("content");
//     content.style.display = "inline";
// })

// var myPlot = document.getElementById('myDiv'),
//     N = 16,
//     x = d3.range(N),
//     y = d3.range(N).map( d3.random.normal() ),
//     data = [ { x:x, y:y, type:'scatter',
//             mode:'markers', marker:{size:16} } ],
//     layout = {
//         hovermode:'closest',
//         title:'Click on Points'
//      };

// Plotly.newPlot('myDiv', data, layout);

// myPlot.on('plotly_click', function(data){
//     var pts = '';
//     for(var i=0; i < data.points.length; i++){
//         pts = 'x = '+data.points[i].x +'\ny = '+
//             data.points[i].y.toPrecision(4) + '\n\n';
//     }
//     alert('Closest point clicked:\n\n'+pts);
// });

function makeplot(filename) {
    d3.dsv(' ')(filename, function(data){ processData(data) } );
  };

function processData(allRows) {

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
        
        // console.log(row);
        // console.log("Valeur 0 : ",row["Valeur0"],"Valeur 1 : ",row["Valeur1"])
        // console.log(row["Valeur"]);
        // y.push( row["Valeur"] );
        // x.push( i );
    }

    // boucle pour déterminer la plus grande et la plus petite valeur du fichier csv 
    var line_top = 0;
    var line_bottom = 0;
    for (var i=0; i<traces.length; i++){
        var temp_top = Math.max.apply(Math,traces[i]['y']);
        var temp_bottom = Math.min.apply(Math, traces[i]['y']) ; 
        console.log("temp ",temp_top, temp_bottom); 
        if (temp_top > line_top) {
            line_top = temp_top;
        }
        if (line_bottom > temp_bottom) {
            line_bottom = temp_bottom;
        }
    }
    console.log(columns); 
    console.log(typeof traces[0]["y"][0]);
    console.log( traces,line_bottom,line_top); 
    // console.log( 'X',x, 'Y',y, 'SD',standard_deviation );
    makePlotly( traces,line_bottom,line_top );
}

function makePlotly(traces,line_bottom,line_top ){
    var plotDiv = document.getElementById("myDiv");
    // const line_top = Math.max.apply(Math, y);
    // const line_bottom = Math.min.apply(Math, y) ;   // 1 
    // console.log(line_top, line_bottom);
    // var traces = [{
    //     x: x,
    //     y: y
    // }];

    var layout = { 
        title : "test",
        hovermode:'closest',
        shapes: []};
    
    console.log(layout["shapes"]);
    // var trace1 = {
    //     x: [1, 2, 3, 4],
    //     y: [10, 15, 13, 17],
    //     type: 'scatter'
    //   };
      
    //   var trace2 = {
    //     x: [1, 2, 3, 4],
    //     y: [16, 5, 11, 9],
    //     type: 'scatter'
    //   };
      
    //   var data = [trace1, trace2];
    //   console.log(data);
    //   Plotly.newPlot('myDiv', data);

    Plotly.newPlot('myDiv', traces,layout,{editable: true,});
    

    plotDiv.on('plotly_click', function(data){
        var pts = '';
        for(var i=0; i < data.points.length; i++){
            pts = 'x = '+data.points[i].x +'\ny = '+
            data.points[i].y.toPrecision(4) + '\n\n';
            console.log("Vous voulez ajouter une rupture au point : ",data.points[i].x );
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
            Plotly.redraw('myDiv');
        }
    });
};


// // function to process csv file
// var temp = [];
// d3.csv("1.csv", function(data){ processData(data, (x) => {
//     temp = x;
// }) } );

// function processData(allRows, fn){
//     var x = [], y = [], standard_deviation = [];
//     for (var i=0; i<allRows.length; i++) {
//         row = allRows[i];
//         // console.log(row);
//         // console.log(row["Valeur"]);
//         y.push( row["Valeur"] );
//         x.push( i );
//     }
//     fn(x);
// }

makeplot("2.csv");