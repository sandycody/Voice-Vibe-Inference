const startButton = document.getElementById('startButton');
const stopButton = document.getElementById('stopButton');

let mediaRecorder;
let audioChunks = [];

// WebSocket connection to the backend
const socket = io.connect('http://' + document.domain + ':' + location.port);

startButton.addEventListener('click', () => {
    startRecording();
    startButton.style.display = 'none';
    stopButton.style.display = 'block';
});

stopButton.addEventListener('click', () => {
    stopRecording();
    startButton.style.display = 'block';
    stopButton.style.display = 'none';
});

async function startRecording() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
            audioChunks.push(e.data);
        }
    };

    mediaRecorder.start();
}

function stopRecording() {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
        mediaRecorder.onstop = () => {
            // Convert audioChunks to a Blob
            const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
            console.log(audioBlob)

            // Send the audio data to the backend using socket.io

            socket.emit('audio', audioBlob);

            // Reset audioChunks
            audioChunks = [];
        }
    }
}

// Get the response from the backend
socket.on('response', function (data) {
    console.log(data)
});