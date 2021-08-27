let video = document.querySelector("video");
let videoBtn = document.querySelector("#record");
let capBtn = document.querySelector("#capture");
let filters = document.querySelectorAll(".filters");
let body = document.querySelector("body");
let zoomIn = document.querySelector(".zoom-in");
let zoomOut = document.querySelector(".zoom-out");
let constraints = { video: true, audio: true };
let mediaRecorder;
let isRecording = false;
let chunks = [];
let filterColor = "";
let minZoom = 1;
let maxZoom = 3;
let currentZoom = 1;

zoomIn.addEventListener('click', function () {
    let currentScale = video.style.transform.split("(")[1].split(")")[0];
    if (currentScale > maxZoom) {
        return;
    }
    else {
        currentZoom = Number(currentScale) + 0.1;
        video.style.transform = `scale(${currentZoom})`;
    }
})

zoomOut.addEventListener('click', function () {
    if (currentZoom > minZoom) {
        currentZoom -= 0.1;
        video.style.transform = `scale(${currentZoom})`;
    }
})


videoBtn.addEventListener('click', function () {

    let recorderDiv = document.querySelector(".record-button-div");
    if (isRecording) {
        mediaRecorder.stop();
        isRecording = false;
        recorderDiv.classList.remove("record-animation");
    }
    else {
        currentZoom = 1;
        video.style.transform = `scale(1)`;
        filter = "";
        removeFilter();
        mediaRecorder.start();
        isRecording = true;
        recorderDiv.classList.add("record-animation");
    }
});

for (let i = 0; i < filters.length; i++) {
    filters[i].addEventListener('click', function (e) {
        filterColor = e.currentTarget.style.backgroundColor;
        removeFilter();
        applyFilter(filterColor);
    })
};

function applyFilter(filterColor) {
    let filterDiv = document.createElement("div");
    filterDiv.classList.add("filter-div");
    filterDiv.style.backgroundColor = filterColor;
    body.appendChild(filterDiv);
}

function removeFilter() {
    let filterDiv = document.querySelector(".filter-div");
    if (filterDiv) {
        filterDiv.remove();
    }
}

capBtn.addEventListener('click', function () {
    let captureDiv = document.querySelector(".capture-button-div");
    captureDiv.classList.add("capture-animation");
    setTimeout(function () {
        captureDiv.classList.remove("capture-animation");
    }, 700);
    capture();
})

// NAVIGATOR IS BROWSER FUNCTION TO GET ACCESS TO CAMERA AND MIC. MEDIADEVICES CONTAINS HARDWARE OF THE DEVICES
// GETUSERMEDIA FUNCTION TO GET PERMISSION OF DEVICES AND RETURNS A PROMISE.
// WHEN PERMISSION IS GRANTED PROMISE IS RESOLVED ELSE IT IS REJECTED.

navigator.mediaDevices.getUserMedia(constraints).then(function (mediaStream) {
    video.srcObject = mediaStream;
    mediaRecorder = new MediaRecorder(mediaStream);

    mediaRecorder.addEventListener('dataavailable', function (e) {
        chunks.push(e.data);
    })

    mediaRecorder.addEventListener('stop', function () {
        let blob = new Blob(chunks, { type: "video/mp4" });
        chunks = [];
        let url = URL.createObjectURL(blob); //CREATES REFERNCE TO OBJECT
        let a = document.createElement("a");
        a.href = url;
        a.download = "video.mp4";
        a.click();
        a.remove();
    });
});

function capture() {
    let c = document.createElement('canvas');
    c.width = video.videoWidth;
    c.height = video.videoHeight;
    let ctx = c.getContext('2d');
    ctx.translate(c.width / 2, c.height / 2);
    ctx.scale(currentZoom, currentZoom);
    ctx.translate(-c.width / 2, -c.height / 2);
    ctx.drawImage(video, 0, 0);
    if (filterColor != "") {
        ctx.fillStyle = filterColor;
        ctx.fillRect(0, 0, c.width, c.height);
    }
    let a = document.createElement("a");
    a.download = "image.jpg";
    a.href = c.toDataURL(); //CREATES URL FROM DATA
    a.click();
    a.remove();
}