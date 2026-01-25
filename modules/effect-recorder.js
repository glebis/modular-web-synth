// Audio Recorder module with record, pause, stop, and WAV download

export default {
  id: "effect-recorder",
  name: "Audio Recorder",
  version: "1.0.0",

  audio: {
    createNodes: (ctx) => {
      // Create pass-through node for recording
      const inputNode = ctx.createGain();
      const outputNode = ctx.createGain();

      inputNode.gain.value = 1.0;
      outputNode.gain.value = 1.0;

      // Connect input to output for pass-through
      inputNode.connect(outputNode);

      return {
        input: inputNode,
        output: outputNode,
        nodes: {
          input: inputNode,
          output: outputNode
        }
      };
    },
    insertionPoint: "pre-master",
    routing: "series"
  },

  ui: {
    container: "custom-controls",
    template: `
      <style>
        .recorder-container {
          padding: 20px;
          background: #0a0a0a;
          border: 2px solid #00ff00;
          border-radius: 8px;
        }

        .recorder-status {
          text-align: center;
          margin-bottom: 20px;
          padding: 15px;
          background: #1a1a1a;
          border-radius: 6px;
          position: relative;
          overflow: hidden;
        }

        .recorder-status-text {
          font-size: 24px;
          font-weight: bold;
          color: #00ff00;
          text-transform: uppercase;
          letter-spacing: 2px;
          position: relative;
          z-index: 2;
        }

        .recorder-status.recording .recorder-status-text {
          color: #ff0000;
          text-shadow: 0 0 10px #ff0000, 0 0 20px #ff0000;
          animation: pulse 1s ease-in-out infinite;
        }

        .recorder-status.paused .recorder-status-text {
          color: #ffaa00;
          text-shadow: 0 0 10px #ffaa00;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.05); }
        }

        .recording-indicator {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg,
            transparent 0%,
            rgba(255, 0, 0, 0.1) 50%,
            transparent 100%);
          animation: scan 2s linear infinite;
          opacity: 0;
          z-index: 1;
        }

        .recorder-status.recording .recording-indicator {
          opacity: 1;
        }

        @keyframes scan {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        .recording-timer {
          font-size: 32px;
          font-family: 'Courier New', monospace;
          color: #00ff00;
          text-align: center;
          margin: 15px 0;
          letter-spacing: 3px;
          text-shadow: 0 0 5px #00ff00;
        }

        .recorder-status.recording .recording-timer {
          color: #ff0000;
          text-shadow: 0 0 10px #ff0000;
        }

        .recorder-buttons {
          display: flex;
          gap: 10px;
          justify-content: center;
          flex-wrap: wrap;
          margin-bottom: 15px;
        }

        .recorder-btn {
          padding: 12px 24px;
          font-size: 16px;
          font-weight: bold;
          border: 2px solid #00ff00;
          background: #1a1a1a;
          color: #00ff00;
          cursor: pointer;
          border-radius: 4px;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 1px;
          min-width: 100px;
        }

        .recorder-btn:hover:not(:disabled) {
          background: #00ff00;
          color: #0a0a0a;
          box-shadow: 0 0 15px #00ff00;
          transform: translateY(-2px);
        }

        .recorder-btn:active:not(:disabled) {
          transform: translateY(0);
        }

        .recorder-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
          border-color: #555;
          color: #555;
        }

        .recorder-btn.record {
          border-color: #ff0000;
          color: #ff0000;
        }

        .recorder-btn.record:hover:not(:disabled) {
          background: #ff0000;
          color: #fff;
          box-shadow: 0 0 15px #ff0000;
        }

        .recorder-btn.pause {
          border-color: #ffaa00;
          color: #ffaa00;
        }

        .recorder-btn.pause:hover:not(:disabled) {
          background: #ffaa00;
          color: #0a0a0a;
          box-shadow: 0 0 15px #ffaa00;
        }

        .recorder-btn.stop {
          border-color: #00aaff;
          color: #00aaff;
        }

        .recorder-btn.stop:hover:not(:disabled) {
          background: #00aaff;
          color: #0a0a0a;
          box-shadow: 0 0 15px #00aaff;
        }

        .recorder-btn.download {
          border-color: #00ff00;
          color: #00ff00;
        }

        .recorder-info {
          text-align: center;
          color: #00ff00;
          font-size: 12px;
          margin-top: 10px;
          opacity: 0.7;
        }

        .recording-visualizer {
          height: 60px;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          gap: 3px;
          margin: 15px 0;
          padding: 10px;
          background: #000;
          border-radius: 4px;
          border: 1px solid #00ff00;
        }

        .visualizer-bar {
          width: 4px;
          background: linear-gradient(to top, #00ff00, #00ff0066);
          border-radius: 2px;
          transition: height 0.1s ease;
          height: 5px;
        }

        .recorder-status.recording .visualizer-bar {
          background: linear-gradient(to top, #ff0000, #ff000066);
          animation: bounce 0.6s ease-in-out infinite;
        }

        @keyframes bounce {
          0%, 100% { height: 5px; }
          50% { height: calc(5px + var(--bar-height)); }
        }
      </style>

      <div class="recorder-container">
        <h2 style="color: #00ff00; text-align: center; margin-bottom: 20px;">Audio Recorder</h2>

        <div class="recorder-status" id="recorder-status">
          <div class="recording-indicator"></div>
          <div class="recorder-status-text" id="recorder-status-text">READY</div>
        </div>

        <div class="recording-timer" id="recorder-timer">00:00:00</div>

        <div class="recording-visualizer" id="recorder-visualizer">
          ${Array.from({length: 20}, (_, i) => `<div class="visualizer-bar" style="--bar-height: ${Math.random() * 50}px;"></div>`).join('')}
        </div>

        <div class="recorder-buttons">
          <button class="recorder-btn record" id="recorder-record">● Record</button>
          <button class="recorder-btn pause" id="recorder-pause" disabled>❚❚ Pause</button>
          <button class="recorder-btn stop" id="recorder-stop" disabled>■ Stop</button>
          <button class="recorder-btn download" id="recorder-download" disabled>↓ Download</button>
        </div>

        <div class="recorder-info" id="recorder-info">
          Ready to record. Click Record to start capturing audio.
        </div>
      </div>
    `,
    bindEvents: (audioNodes, params) => {
      const recordBtn = document.getElementById('recorder-record');
      const pauseBtn = document.getElementById('recorder-pause');
      const stopBtn = document.getElementById('recorder-stop');
      const downloadBtn = document.getElementById('recorder-download');
      const statusEl = document.getElementById('recorder-status');
      const statusText = document.getElementById('recorder-status-text');
      const timerEl = document.getElementById('recorder-timer');
      const infoEl = document.getElementById('recorder-info');
      const visualizerBars = document.querySelectorAll('.visualizer-bar');

      let mediaRecorder = null;
      let audioChunks = [];
      let startTime = 0;
      let elapsedTime = 0;
      let timerInterval = null;
      let isPaused = false;
      let animationFrame = null;

      // Get audio context and create media stream
      const ctx = audioNodes.input.context;
      const destination = ctx.createMediaStreamDestination();
      audioNodes.input.connect(destination);

      // Format time display
      const formatTime = (seconds) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
      };

      // Update timer
      const updateTimer = () => {
        if (!isPaused) {
          const currentElapsed = elapsedTime + (Date.now() - startTime) / 1000;
          timerEl.textContent = formatTime(currentElapsed);
        }
      };

      // Animate visualizer bars
      const animateVisualizer = () => {
        visualizerBars.forEach(bar => {
          const height = Math.random() * 50;
          bar.style.setProperty('--bar-height', `${height}px`);
        });
        if (mediaRecorder && mediaRecorder.state === 'recording') {
          animationFrame = requestAnimationFrame(animateVisualizer);
        }
      };

      // Record button
      recordBtn.addEventListener('click', () => {
        if (!mediaRecorder || mediaRecorder.state === 'inactive') {
          // Start new recording
          audioChunks = [];
          mediaRecorder = new MediaRecorder(destination.stream);

          mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
              audioChunks.push(event.data);
            }
          };

          mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
            params.recordedBlob = audioBlob;
            downloadBtn.disabled = false;
            statusText.textContent = 'STOPPED';
            statusEl.className = 'recorder-status';
            infoEl.textContent = `Recording complete: ${formatTime(elapsedTime)} - Click Download to save`;
            if (animationFrame) {
              cancelAnimationFrame(animationFrame);
            }
          };

          mediaRecorder.start();
          startTime = Date.now();
          elapsedTime = 0;
          isPaused = false;
          timerInterval = setInterval(updateTimer, 100);

          statusText.textContent = 'RECORDING';
          statusEl.className = 'recorder-status recording';
          recordBtn.disabled = true;
          pauseBtn.disabled = false;
          stopBtn.disabled = false;
          downloadBtn.disabled = true;
          infoEl.textContent = 'Recording in progress... Audio is being captured.';

          animateVisualizer();
        } else if (isPaused) {
          // Resume recording
          mediaRecorder.resume();
          startTime = Date.now();
          isPaused = false;

          statusText.textContent = 'RECORDING';
          statusEl.className = 'recorder-status recording';
          recordBtn.disabled = true;
          pauseBtn.disabled = false;
          infoEl.textContent = 'Recording resumed...';

          animateVisualizer();
        }
      });

      // Pause button
      pauseBtn.addEventListener('click', () => {
        if (mediaRecorder && mediaRecorder.state === 'recording') {
          mediaRecorder.pause();
          elapsedTime += (Date.now() - startTime) / 1000;
          isPaused = true;

          statusText.textContent = 'PAUSED';
          statusEl.className = 'recorder-status paused';
          recordBtn.disabled = false;
          pauseBtn.disabled = true;
          infoEl.textContent = 'Recording paused. Click Record to resume.';

          if (animationFrame) {
            cancelAnimationFrame(animationFrame);
          }
        }
      });

      // Stop button
      stopBtn.addEventListener('click', () => {
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
          mediaRecorder.stop();
          elapsedTime += (Date.now() - startTime) / 1000;

          if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
          }

          recordBtn.disabled = false;
          pauseBtn.disabled = true;
          stopBtn.disabled = true;
        }
      });

      // Download button
      downloadBtn.addEventListener('click', () => {
        if (params.recordedBlob) {
          const url = URL.createObjectURL(params.recordedBlob);
          const a = document.createElement('a');
          a.style.display = 'none';
          a.href = url;
          a.download = `recording_${new Date().toISOString().replace(/[:.]/g, '-')}.wav`;
          document.body.appendChild(a);
          a.click();
          setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }, 100);
          infoEl.textContent = 'Download started! File saved as WAV format.';
        }
      });

      // Store cleanup function
      params.cleanup = () => {
        if (timerInterval) {
          clearInterval(timerInterval);
        }
        if (animationFrame) {
          cancelAnimationFrame(animationFrame);
        }
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
          mediaRecorder.stop();
        }
      };
    }
  },

  state: {
    defaults: {
      recordedBlob: null,
      cleanup: null
    },
    save: (params) => ({
      // Don't save recorded audio in presets
    }),
    load: (params, saved, audioNodes) => {
      // Nothing to restore
    }
  },

  lifecycle: {
    onLoad: (ctx) => {
      console.log('[Recorder] Module loaded');
    },
    onConnect: (ctx) => {
      console.log('[Recorder] Audio graph connected');
    },
    onUnload: (ctx) => {
      console.log('[Recorder] Module unloading');
      // Cleanup any active recording
      const params = this.state.defaults;
      if (params.cleanup) {
        params.cleanup();
      }
    }
  }
};
