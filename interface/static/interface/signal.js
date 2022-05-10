var getUrl = window.location;
var baseUrl = getUrl .protocol + "//" + getUrl.host + "/" ;
var filename = document.querySelectorAll(".filename");

filename.forEach(elt => elt.addEventListener('click', ()=>{makeplot(baseUrl+elt.id);}));



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
    var label_x = document.querySelectorAll(".label_coordinate")
    label_x.forEach(elt => elt.addEventListener("click",() =>{delete_label(layout,elt.id);Plotly.redraw('myDiv');}))
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
            var coordinates = document.querySelectorAll(".label_coordinate");
            console.log("plotly ",coordinates, coordinates.length);
            Plotly.redraw('myDiv');
        }
        create_label(layout,"xcoords","label_coordinate");
        var label_x = document.querySelectorAll(".label_coordinate")
        label_x.forEach(elt => elt.addEventListener("click",() =>{delete_label(layout,elt.id);Plotly.redraw('myDiv');}))
        console.log(layout["shapes"]);
    });

    plotDiv.addEventListener("mouseover", () =>{
        update_coordinate(layout,"xcoords");
    })
};



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

function create_label(layout,id_name,class_name){
    var display = document.getElementById(id_name);
    var result = "";
    if (layout["shapes"].length >0 ){
        result += '<p id='+layout["shapes"][layout["shapes"].length -1 ]["x0"]+' class="label_coordinate">'+layout["shapes"][layout["shapes"].length -1 ]["x0"] +'</p>';
        display.innerHTML +=result;
    
    }
    
}

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