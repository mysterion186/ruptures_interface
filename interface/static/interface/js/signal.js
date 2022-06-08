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
        shapes: []};
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
            Plotly.redraw('myDiv'); // graph update
        }
        create_label(layout,"left","right"); // function that add the last value to the dom
        event_listener_label("label_coordinate",layout);
    });
    // function that each time the mouse is on the graph will update the labels coordinate on the dom
    plotDiv.addEventListener("mouseover", () =>{
        update_coordinate(layout);
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
function update_coordinate(layout) {
    var coordinates = document.querySelectorAll(".label_coordinate");
    var crosses = document.querySelectorAll(".cross");
    // should be as much cross as coordinate value
    for (var i = 0; i<layout["shapes"].length; i++){
        var coordinates = document.querySelectorAll(".label_coordinate");
        layout["shapes"][i]["x0"] = Math.round(layout["shapes"][i]["x0"]);
        layout["shapes"][i]["x1"] = Math.round(layout["shapes"][i]["x1"]);
        if (coordinates[i] !== undefined){
            if (coordinates[i].id !== layout["shapes"][i]["x0"] ){
                coordinates[i].innerHTML = 'break at : '+layout["shapes"][i]["x0"];
                coordinates[i].id = layout["shapes"][i]["x0"];
                crosses[i].id = "cross_"+layout["shapes"][i]["x0"];
            }
        }
    }
}

// function to add coordinate on the dom
function create_label(layout,id_name,id_name_2){
    var display = document.getElementById(id_name);
    var display_r = document.getElementById(id_name_2);
    var result = "";
    var result_r = "";
    if (layout["shapes"].length >0 ){
        result += '<div id='+layout["shapes"][layout["shapes"].length -1 ]["x0"]+' class="label_coordinate">break at : '+layout["shapes"][layout["shapes"].length -1 ]["x0"] +'</div>';
        result_r = '<div id=cross_'+layout["shapes"][layout["shapes"].length -1 ]["x0"]+' class="cross"></div>';
        display.innerHTML +=result;
        display_r.innerHTML+=result_r;
    }
    
}


// functin to delete a label from the graph and the dom
function delete_label(layout,elt_id){
    for (var i=0; i < layout["shapes"].length; i++){
        var id_value = parseInt(elt_id);
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


