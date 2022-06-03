// files that will contains all function that are used in several js files

// function that will display uploaded files on the right side 
function display_file(name,home=true){
    if (home) { // case we want to display uploaded file in the home page
        var uploadedArea = document.querySelector(".uploaded-area");
        var uploadHTML = `<li class="row">
                                        <div class="content">
                                            <img src="/static/interface/img/csv.png" alt="csv" />
                                            <div class="details">
                                                <span class="name">${name}</span>
                                            </div>
                                        </div>
                                        <img src="/static/interface/img/check.png" alt="check" />
                                    </li>`;
                    uploadedArea.insertAdjacentHTML("afterbegin",uploadHTML);
    }
    else {
        const folder_val = document.getElementById("folder_val"); // on choppe le dossier de la session
        var fileArea = document.getElementById("label_predict");
        const detect_ext = name.split(".");
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

// function that is used to send form to the 'post_url' value
function uploadFile(form,post_url=''){
    var formData = new FormData(form);
    axios.post(post_url,formData); // envoie du fichier au serveur
}


function init_form(){
    // code to get the upload form responsive...
    const form = document.querySelector("form");
    form.reset();
    var fileInput = document.querySelector(".file-input");
    form.addEventListener("click", ()=>{
        fileInput.click();
    });
    return [form,fileInput];
}


// function that takes 2 arrays that contain x et y data
function processData(allRows,func) {
    const columns = Object.keys(allRows[0]); // get columns name
    var traces = Array(columns.length); // empty array according to the number of columns
    // initialisation of the object traces
    for (var i = 0; i < traces.length; i++) {
        traces[i] = { x : [],y : [],type:'scatter'};
    }
    for (var i=0; i<allRows.length; i++) { // loop over files
        for (var k=0; k<columns.length;k++){
            var row = allRows[i];
            traces[k]["y"].push(row[columns[k]]);
            traces[k]["x"].push(i);
            traces[k]["name"] = columns[k];
        }
    }

    // loop to check the biggest and the lowest value in the csv file (to draw later the labels line)
    var line_top = 0;
    var line_bottom = 0;
    for (var i=0; i<traces.length; i++){
        var temp_top = Math.max.apply(Math,traces[i]['y']);
        var temp_bottom = Math.min.apply(Math, traces[i]['y']) ; 
        if (temp_top > line_top) {
            line_top = temp_top;
        }
        if (line_bottom > temp_bottom) {
            line_bottom = temp_bottom;
        }
    }
    func( traces,line_bottom,line_top ); // call function that takes the traces object and plot the chart 
}

export {uploadFile,init_form,processData,display_file};