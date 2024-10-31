const { createFFmpeg, fetchFile } = FFmpeg;
const ffmpeg = createFFmpeg({
    log: true,
    logger: ({ type, message }) => {
      if (type === 'info') console.log(`[ffmpeg info]: ${message}`);
      else if (type === 'fferr') console.error(`[ffmpeg error]: ${message}`);
    },
  });
  // Function to add a new alert message to the log container
function addAlertMessage(message, type) {
    // Create a new div element with Bootstrap alert classes
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} mt-2`;
    alertDiv.role = 'alert';
    alertDiv.innerText = message;

    // Append the new alert message to the logContainer
    document.getElementById('logContainer').appendChild(alertDiv);

    // Remove the alert after a few seconds (optional)
    setTimeout(() => {
        alertDiv.remove();
    }, 3000); // 3000ms = 3 seconds
}

// Example of using the function to add messages
addAlertMessage('Processing started...', 'primary');
addAlertMessage('Loading data...', 'info');
addAlertMessage('Operation successful!', 'success');
addAlertMessage('Warning: Check your input.', 'warning');
addAlertMessage('Error: Something went wrong!', 'danger');

document.getElementById('createVideoButton').addEventListener('click', async () => {
    const imageFile = document.getElementById('imageUpload').files[0];
    const audioFile = document.getElementById('audioUpload').files[0];
    const logContainer = document.getElementById('logContainer');
    logContainer.innerHTML = "";  // Clear log on each new process

    if (!imageFile || !audioFile) {
        alert('Please upload both an image and an audio file.');
        return;
    }

    // Load ffmpeg
    if (!ffmpeg.isLoaded()) {
        await ffmpeg.load();
    }

    // Write files to ffmpeg file system
    ffmpeg.FS('writeFile', 'image.jpg', await fetchFile(imageFile));
    ffmpeg.FS('writeFile', 'audio.mp3', await fetchFile(audioFile));

    // Display processing messages
    logMessage("Processing... Please wait.");

    // Run ffmpeg command to create video from image and audio
    await ffmpeg.run(
        '-loop', '1',
        '-i', 'image.jpg',
        '-i', 'audio.mp3',
        '-c:v', 'libx264',
        '-preset', 'ultrafast',
        '-pix_fmt', 'yuv420p',
        '-s', '640x360',
        '-c:a', 'aac',
        '-b:a', '128k',
        '-shortest',
        'output.mp4'
    );

    // Read the resulting video file
    const data = ffmpeg.FS('readFile', 'output.mp4');

    // Create a URL for the video and set it to download link
    const videoBlob = new Blob([data.buffer], { type: 'video/mp4' });
    const url = URL.createObjectURL(videoBlob);
    const downloadLink = document.getElementById('downloadLink');
    downloadLink.href = url;
    downloadLink.download = 'audiobook.mp4';
    downloadLink.style.display = 'inline';
    downloadLink.textContent = 'Download Video';

    logMessage("Processing completed!");
});

// Append messages to log container
function logMessage(message) {
    const logContainer = document.getElementById('logContainer');
    const logEntry = document.createElement('div');
    logEntry.textContent = message;
    logContainer.appendChild(logEntry);
    logContainer.scrollTop = logContainer.scrollHeight;  // Auto-scroll to the latest message
}
