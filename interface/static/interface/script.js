const form = document.querySelector("form");
form.reset();
fileInput = form.querySelector(".file-input")
progressArea = document.querySelector(".progress-area");
uploadedArea = document.querySelector(".uploaded-area");
console.log("Hello3");
form.addEventListener("click", ()=>{
    console.log("test eventlistener")
    fileInput.click();
});

fileInput.onchange = (e)=>{
    console.log("test on change")
    document.querySelector(".progress-area").style.display = "block";
    let file = e.target.files[0];
    console.log(e.target.files[0]/length);
    if (file){
        let fileName = file.name;
        if (fileName.length >=12 ){
            var splitname = fileName.split('.')
            fileName = splitname[0].substring(0,12)+"... ."+splitname[1];
        }
        console.log(fileName);
        uploadFile(fileName);
        console.log("upload appelé");
    }
};

// sub_button = document.querySelector(".submit_button");
// sub_button.addEventListener("click",()=>{
//     console.log("fichier envoyé");
// })

function uploadFile(name){
    var formData = new FormData(form);
    var config = {
        onUploadProgress: (progressEvent) => {
            // var filename = document.querySelector("#filename");
            // var file_percent = document.querySelector(".progress");
            // filename.innerHTML = formData.get("myfile")["name"];
            // file_percent.style.width = Math.round( (progressEvent.loaded * 100) / progressEvent.total ).toString()+"%";
            // console.log(Math.round( (progressEvent.loaded * 100) / progressEvent.total ));
            var fileloaded = (Math.round( (progressEvent.loaded * 100) / progressEvent.total ));
            var loaded = progressEvent.loaded;
            var progressHTML = `<li class="row">         
                                    <img src="/static/interface/csv.png" alt="csv" />
                                    <div class="content">
                                        <div class="details">
                                            <span class="name" id="filename">${name} • en cours</span>
                                            <span class="percent" id = "percent">${fileloaded} %</span>
                                        </div>
                                        <div class="progress-bar">
                                            <div class="progress" style="width:${fileloaded}%"></div>
                                        </div>
                                    </div>
                                </li>`;

            progressArea.innerHTML = progressHTML;
            console.log(loaded, progressEvent.total);
            if (loaded === progressEvent.total){
                progressArea.innerHTML = "";
                var uploadHTML = `<li class="row">
                                    <div class="content">
                                        <img src="/static/interface/csv.png" alt="csv" />
                                        <div class="details">
                                            <span class="name">${name} • terminé</span>
                                            <span class="size">${progressEvent.total}</span>
                                        </div>
                                    </div>
                                    <img src="/static/interface/check.png" alt="check" />
                                </li>`;
    
                uploadedArea.insertAdjacentHTML("afterbegin",uploadHTML);
            }
        }
    };
    axios.post('',formData, config);
}
