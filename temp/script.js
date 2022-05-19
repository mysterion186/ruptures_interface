

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
    d3.csv(filename, function(data){ processData(data) } );
  };

function processData(allRows) {

    console.log(allRows);
    var x = [], y = [], standard_deviation = [];

    for (var i=0; i<allRows.length; i++) {
        row = allRows[i];
        // console.log(row);
        console.log(row["Valeur"]);
        y.push( row["Valeur"] );
        x.push( i );
    }
    console.log( 'X',x, 'Y',y, 'SD',standard_deviation );
    makePlotly( x, y, standard_deviation );
}

function makePlotly( x, y, standard_deviation ){
    var plotDiv = document.getElementById("myDiv");
    const line_top = Math.max.apply(Math, y);
    const line_bottom = Math.min.apply(Math, y) ;   // 1 
    console.log(line_top, line_bottom);
    var traces = [{
        x: x,
        y: y
    }];

    var layout = { 
        title : "test",
        hovermode:'closest',
        shapes: []};
    
    console.log(layout["shapes"]);

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
makeplot("1.csv");

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
