const form = document.querySelector("form");
fileInput = form.querySelector(".file-input")
progressArea = form.querySelector(".progress-area");
uploadedArea = form.querySelector(".uploaded-area");

form.addEventListener("click", ()=>{
    fileInput.click();
});

fileInput.onchange = (e)=>{
    let file = e.target.files[0];
    if (file){
        let fileName = file.name;
        uploadFile(fileName);
    }
};

function uploadFile(name){
    
}