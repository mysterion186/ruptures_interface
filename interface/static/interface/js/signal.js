import {processData} from './commun.js'

// part to get the files links that are in the server, to make request and plot them later
var getUrl = window.location;
var baseUrl = getUrl .protocol + "//" + getUrl.host + "/" ;
var filename = document.querySelectorAll(".filename");

// turn all file to clickable element + plot the graph
filename.forEach(elt => elt.addEventListener('click', ()=>{reset_page();choosed_file(elt.id);makeplot(baseUrl+elt.id);}));

var filenum = 0;
// plot the first the graphe
filename[filenum].click()


var labels_coordinate = []; // array that will contains either an integer (x position for vertical line) or an array of integer (x position for a zone)


// function to init the plotting part (download data, process it and plot it)
function makeplot(filename) {
    d3.dsv(' ')(filename, function(data){ processData(data,makePlotly) } );
  };

// actual function that plot the graph
function makePlotly( traces,line_bottom,line_top ){
    var plotDiv = document.getElementById("myDiv"); // dom spot where the graph will be plotted
    // object layout that contains the title and the coordinate of labels
    const selected_file = document.querySelector(".choosed");
    var layout = { 
        title : selected_file.innerHTML,
        hovermode:'closest',
        shapes: [], 
        dragmode:"select", // line to allow zone selection 
    };
    const folder_val = document.getElementById("folder_val"); // get the folder_val that is the current session
    axios.get(`prediction/coord/${folder_val.innerHTML}/train/${selected_file.innerHTML}`).then((response) => {
        if (response["data"]["status"] === "success") {
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
                create_label(layout,"left","right"); // functation that display the last label on the dom
                event_listener_label("label_coordinate",layout);
            }
            Plotly.redraw('myDiv');
        }
    });

    Plotly.newPlot('myDiv', traces,layout,{editable: true,}); // plotly code to display the graphe
    
    // event to draw vertical lines 
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
            labels_coordinate.push(data.points[i].x); // on ajoute le points dans notre label, théoriquement il devrait y avoir que 1 point dans un click
            console.log(labels_coordinate);
            Plotly.redraw('myDiv'); // graph update
        }
        // create_label(layout,"left","right"); // function that add the last value to the dom
        create_label(labels_coordinate,"left","right"); // function that add the last value to the dom
        event_listener_label("label_coordinate",layout);
    });

    
// create box 
plotDiv.on('plotly_selected', (eventData) => {
    if (!eventData) return;
    var xRange = eventData.range.x;
    var yRange = eventData.range.y;
    var x0 = Math.round(xRange[0]);
    var x1 = Math.round(xRange[1]);
    var y0 = Math.round(yRange[0]);
    var y1 = Math.round(yRange[1]);
    console.log("x0 = ",x0," x1 = ",x1," y0 = ",typeof y0," y1 = ",y1);
    // trait vertical en x0
    layout["shapes"].push({
        'type': 'line',
        'x0':x0,
        'y0':line_bottom,
        'x1':x0,
        'y1':line_top,
        'line': {
            'color': 'red',
             dash: 'dot',
            'width':3,
        }
    })
    // vertical at x1
    layout["shapes"].push({
        'type': 'line',
        'x0':x1,
        'y0':line_bottom,
        'x1':x1,
        'y1':line_top,
        'line': {
            'color': 'red',
             dash: 'dot',
            'width':3,
        }
    })
    //horizontal at y1
    layout["shapes"].push({
        'type': 'line',
        'x0':x0,
        'y0':line_top,
        'x1':x1,
        'y1':line_top ,
        'line': {
            'color': 'red',
             dash: 'dot',
            'width':3,
        }
    })
    // horizontal at y0
    layout["shapes"].push({
        'type': 'line',
        'x0':x0,
        'y0':line_bottom,
        'x1':x1,
        'y1':line_bottom,
        'line': {
            'color': 'red',
             dash: 'dot',
            'width':3,
        }
    })
    labels_coordinate.push([x0,x1] );
    create_label(labels_coordinate,"left","right"); // function that add the last value to the dom
    event_listener_label("label_coordinate",layout);
    // console.log("liste ",[xRange[0],xRange[1]]);
    // console.log("full ",labels_coordinate);
    Plotly.redraw('myDiv');
});

    // function that each time the mouse is on the graph will update the labels coordinate on the dom
    plotDiv.addEventListener("mouseover", () =>{
        update_coordinate(labels_coordinate,layout);
    })
};

// function to add event on the coordinate (delation + colour changement)
function event_listener_label(class_name,layout){
    var label_x = document.querySelectorAll("."+class_name);
    label_x.forEach(elt => elt.addEventListener("mouseover",()=>{
        delete_cross("cross"); // delete cross
        change_color(elt.id,"blue",layout); // color changement for the line
        const cross = document.getElementById("cross_"+elt.id); // display the cross
        cross.innerHTML = "&#10060;"
        cross.addEventListener("click",()=>{delete_label(layout,elt.id);Plotly.redraw('myDiv');})
    }))
    label_x.forEach(elt => elt.addEventListener("mouseleave",()=>{change_color(elt.id,"black",layout);}))
}


// function to update the coordinate value on the dom
function update_coordinate(label_coord,layout) {
    var coordinates = document.querySelectorAll(".label_coordinate");
    var crosses = document.querySelectorAll(".cross");
    var label_index = 0; // index to apply on the label_coordinate to check if this is a vertical line (point) or a box (2 vertical lines)
    // should be as much cross as coordinate value
    for (var i = 0; i<layout["shapes"].length; i++){
        // console.log("i = ",i," value = ",labels_coordinate[label_index]," layout = ", layout["shapes"][i]);
        var coordinates = document.querySelectorAll(".label_coordinate");
        if (coordinates[i] !== undefined){
            if (typeof labels_coordinate[label_index]==="number"){ // case this is a vertical line
                console.log("Cas ligne verticale");
                layout["shapes"][i]["x0"] = Math.round(layout["shapes"][i]["x0"]);
                layout["shapes"][i]["x1"] = Math.round(layout["shapes"][i]["x1"]);
                label_coord[label_index] = Math.round(layout["shapes"][i]["x0"]);
                
                if (coordinates[label_index].id !== layout["shapes"][i]["x0"] ){
                    coordinates[label_index].innerHTML = 'break at : '+layout["shapes"][i]["x0"];
                    coordinates[label_index].id = layout["shapes"][i]["x0"];
                    console.log(layout["shapes"][i]["x0"]);
                    crosses[label_index].id = "cross_"+layout["shapes"][i]["x0"]; // update the cross id to delete the proper label
                }
            }
            else{ // case this is a break zone  
                
                // console.log(coordinates[label_index].getAttribute("x0"));
                if (coordinates[label_index].getAttribute("x0") !== layout["shapes"][i]["x0"] || coordinates[label_index].getAttribute("x1") !== layout["shapes"][i]["x1"] ){
                    console.log("Cas zone");
                    label_coord[label_index][0] = Math.round(layout["shapes"][i]["x0"]);
                    layout["shapes"][i]["x0"] = Math.round(layout["shapes"][i]["x0"]);
                    label_coord[label_index][1] = Math.round(layout["shapes"][i+1]["x1"]);
                    layout["shapes"][i+1]["x1"] = Math.round(layout["shapes"][i+1]["x1"]);
                    coordinates[label_index].innerHTML = 'break zone : '+layout["shapes"][i]["x0"]+"-"+layout["shapes"][i+1]["x1"];
                    coordinates[label_index].id = layout["shapes"][i]["x0"];
                    crosses[label_index].id = "cross_"+layout["shapes"][i]["x0"]; // update the cross id to delete the proper label
                    coordinates[label_index].setAttribute("x0",layout["shapes"][i]["x0"])
                    coordinates[label_index].setAttribute("x1",layout["shapes"][i+1]["x1"])
                //     console.log("chgmt ",labels_coordinate);
                //     console.log("i ",layout["shapes"][i],"i+1 ",layout["shapes"][i+1],"i+2 ",layout["shapes"][i+2])
                }
                else{
                    console.log("Dans le else du if");
                }
                i = i+3; // skip the 3 next layout values because they correspond to the other vertical line and the horizontal lines
                // label_index++;
            }
            label_index++ ;
        }
        console.log(labels_coordinate);
    }
}


// function to add coordinate on the dom
function create_label(labels_coord,id_name,id_name_2){
    var display = document.getElementById(id_name);
    var display_r = document.getElementById(id_name_2);
    var result = "";
    var result_r = "";
    if (labels_coord.length >0 ){
        if (typeof labels_coord[labels_coord.length -1 ]==='number'){
            console.log("dans le if ",labels_coord[labels_coord.length -1 ])
            result += '<div id='+labels_coord[labels_coord.length -1 ]+' class="label_coordinate">break at : '+labels_coord[labels_coord.length -1 ] +'</div>';
            result_r = '<div id=cross_'+labels_coord[labels_coord.length -1 ]+' class="cross"></div>';
        }
        else {
            console.log("Dans le else ",labels_coord[labels_coord.length -1 ][0]);
            result += '<div id='+labels_coord[labels_coord.length -1 ][0]+' x0='+labels_coord[labels_coord.length -1][0 ]+' x1='+labels_coord[labels_coord.length -1][1]+' class="label_coordinate">break zone : '+ labels_coord[labels_coord.length -1 ][0]+"-" +labels_coord[labels_coord.length -1 ][1]+'</div>';
            result_r = '<div id=cross_'+labels_coord[labels_coord.length -1 ][0]+' class="cross"></div>';
        }
        display.innerHTML +=result;
        display_r.innerHTML+=result_r;
    }
    
}


// functin to delete a label from the graph and the dom
function delete_label(layout,elt_id){
    var id_value = parseInt(elt_id);
    for (var i=0; i < layout["shapes"].length; i++){
        if (layout["shapes"][i]["x0"] === id_value){
            layout["shapes"].splice(i, 1);
        }
    }
    var x_coord = document.getElementById(elt_id);
    if (x_coord !== null){
        x_coord.remove();
        var coord_cross = document.getElementById("cross_"+elt_id);
        coord_cross.remove();
    }
}

// function to stop displaying  crosses
function delete_cross(class_name){
    const crosses = document.querySelectorAll("."+class_name);
    for (var i=0; i < crosses.length; i++){
        crosses[i].innerHTML = "";
    }
}

// function to change lines colour
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
    Plotly.redraw('myDiv'); // update graphe
}

// function that deletes all the labels on the dom
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


// Get the button that opens the modal
var btn = document.getElementById("myBtn");

const validation_button = document.getElementById("validation");
validation_button.addEventListener("click",()=>{
    if (validation_button.innerHTML === "Confirm labels"){
        validation();
        filenum++;
        filename[filenum].click();
    }
    else {
        // window.location.href=baseUrl+"prediction";
        btn.click(); // click on modal to chosse the breakpoints type
    }
    })
function validation(){
    // get the file we're working on
    const choosed_file = document.querySelector(".choosed");
    const file_id = choosed_file.id;
    choosed_file.classList.remove("choosed"); // get rid of the orange border
    choosed_file.classList.add("done"); // remove the possibility to click on it again

    const labels = document.querySelectorAll(".label_coordinate");
    var labels_array = []
    for (var i=0; i < labels.length; i++){
        labels_array.push(labels[i].id);
    }
    send_data(file_id,labels_array);
    reset_page(); // oreset page after we sent data
}

// function to send the data on the backend
function send_data(filename,label_array){
    axios.post('add',{
        filename : filename,
        labels : label_array
    }).then((response) => {
        console.log(response);
    })
}
// founction that calls the modal (to choose the type of ruptures) once every file were treated
function set_validation_text() {
    const filename = document.querySelectorAll(".filename");
    const processed = document.querySelectorAll(".done");
    const validation_button = document.getElementById("validation");
    if (processed.length === filename.length){
        // validation_button.innerHTML = "Train";
        btn.click(); // click on modal to chosse the breakpoints type
    }
}

function redirect(){
    var url = baseUrl+"/prediction";
    window.location(url);
}

// Get the modal
var modal = document.getElementById("myModal");



// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// When the user clicks on the button, open the modal
btn.onclick = function() {
  modal.style.display = "block";
}


