const audioCtx = new AudioContext()
const audioEl = document.querySelector('audio')
const canvasEl = document.querySelector('canvas')
const canvasCtx = canvasEl.getContext('2d')
const playPauseBtn = document.querySelector('.play-pause')
const seekBar = document.querySelector('.seekbar')
const volumeBar = document.querySelector('.volume')


const pauseIcon = `<span class="material-icons">pause</span>`
const playIcon = `<span class="material-icons">play_arrow</span>`
const replayIcon = `<span class="material-icons">replay</span>`


const width = canvasEl.clientWidth
const height = canvasEl.clientHeight
seekBar.value = 0
volumeBar.value = 100

let audioState = {
    isReplay: false,
    isPaused: false
}

playPauseBtn.addEventListener('click', togglePlayPause)

audioEl.addEventListener('timeupdate', setProgress)
audioEl.addEventListener('ended', onEnd)
audioEl.addEventListener('canplay', setDuration)
seekBar.addEventListener('input', onSeek)
volumeBar.addEventListener('input', onVolumeSeek)

const source = audioCtx.createMediaElementSource(audioEl)
const analyser = audioCtx.createAnalyser()
analyser.fftSize = 256

source.connect(analyser)
analyser.connect(audioCtx.destination)

const bufferLength = analyser.frequencyBinCount
const dataArray = new Uint8Array(bufferLength)

function draw() {
    analyser.getByteFrequencyData(dataArray)
    canvasCtx.fillStyle = 'rgb(2,2,2)'
    canvasCtx.fillRect(0, 0, width, height)

    const barWidth = (width / bufferLength) * 2.5
    let barHeight
    let x = 0

    for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i] / 2.8
        canvasCtx.fillStyle = 'rgb(50,50,200)'
        canvasCtx.fillRect(x, height - barHeight, barWidth, barHeight)

        x += barWidth + 1
    }
    requestAnimationFrame(draw)
}
draw()

function togglePlayPause() {
    audioCtx.resume().then(() => {
        if (audioState.isPaused) {
            playPauseBtn.innerHTML = pauseIcon
            audioEl.play()
        } else {
            if (audioState.isReplay) {
                playPauseBtn.innerHTML = pauseIcon
                audioEl.play()
                audioState.isReplay = false
                return
            }
            playPauseBtn.innerHTML = playIcon
            audioEl.pause()
        }
        audioState.isPaused = !audioState.isPaused
    })
}

function setProgress() {
    seekBar.value = audioEl.currentTime
}

function setDuration() {
    seekBar.max = audioEl.duration
}

function onEnd() {
    playPauseBtn.innerHTML = replayIcon
    audioEl.currentTime = 0
    seekBar.value = 0
    audioState.isReplay = true
}

function onSeek(e) {
    audioEl.currentTime = e.target.value
}

function onVolumeSeek(e) {
    audioEl.volume = e.target.value / 100
}