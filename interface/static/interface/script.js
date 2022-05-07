const form = document.querySelector("form");
form.reset();
fileInput = form.querySelector(".file-input")
progressArea = form.querySelector(".progress-area");
uploadedArea = form.querySelector(".uploaded-area");
console.log("Hello1");
form.addEventListener("click", ()=>{
    console.log("test eventlistener")
    fileInput.click();
});

fileInput.onchange = (e)=>{
    console.log("test on change")
    let file = e.target.files[0];
    console.log(e.target.files[0]/length);
    if (file){
        let fileName = file.name;
        console.log(fileName);
        uploadFile();
        console.log("upload appelé");
    }
};
// sub_button = document.querySelector(".submit_button");
// sub_button.addEventListener("click",()=>{
//     console.log("fichier envoyé");
// })

function uploadFile(){
    var formData = new FormData(form);
    var config = {
        onUploadProgress: (progressEvent) => {
            var filename = document.querySelector("#filename");
            var file_percent = document.querySelector(".progress");
            filename.innerHTML = formData.get("myfile")["name"];
            file_percent.style.width = Math.round( (progressEvent.loaded * 100) / progressEvent.total ).toString()+"%";
            console.log();
        }
    };
    axios.post('',formData, config);
}
