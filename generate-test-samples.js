// Generate synthetic drum samples for testing
// Run this in the console: await import('./generate-test-samples.js')

export async function generateTestSamples() {
  console.log('%c[Test Samples] Generating synthetic drums...', 'color: #ffaa00; font-size: 14px');

  const ctx = new AudioContext();
  const sampleRate = ctx.sampleRate;

  // Helper: Generate audio buffer
  function createBuffer(duration, generator) {
    const buffer = ctx.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);
    generator(data, sampleRate);
    return buffer;
  }

  // Helper: Convert buffer to WAV blob
  function bufferToWav(buffer) {
    const numChannels = buffer.numberOfChannels;
    const length = buffer.length * numChannels * 2;
    const arrayBuffer = new ArrayBuffer(44 + length);
    const view = new DataView(arrayBuffer);

    // WAV header
    const writeString = (offset, string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + length, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numChannels * 2, true);
    view.setUint16(32, numChannels * 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, length, true);

    // Audio data
    let offset = 44;
    for (let i = 0; i < buffer.length; i++) {
      for (let channel = 0; channel < numChannels; channel++) {
        const sample = Math.max(-1, Math.min(1, buffer.getChannelData(channel)[i]));
        view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
        offset += 2;
      }
    }

    return new Blob([arrayBuffer], { type: 'audio/wav' });
  }

  // Generate kick drum
  const kick = createBuffer(0.5, (data, sr) => {
    for (let i = 0; i < data.length; i++) {
      const t = i / sr;
      const env = Math.exp(-t * 12);
      const freq = 150 * Math.exp(-t * 40);
      data[i] = Math.sin(2 * Math.PI * freq * t) * env * 0.8;
    }
  });

  // Generate snare drum
  const snare = createBuffer(0.3, (data, sr) => {
    for (let i = 0; i < data.length; i++) {
      const t = i / sr;
      const env = Math.exp(-t * 20);
      const tone = Math.sin(2 * Math.PI * 180 * t) * 0.3;
      const noise = (Math.random() * 2 - 1) * 0.7;
      data[i] = (tone + noise) * env * 0.6;
    }
  });

  // Generate hi-hat
  const hihat = createBuffer(0.15, (data, sr) => {
    for (let i = 0; i < data.length; i++) {
      const t = i / sr;
      const env = Math.exp(-t * 40);
      const noise = (Math.random() * 2 - 1);
      data[i] = noise * env * 0.4;
    }
  });

  // Generate percussion (tom)
  const tom = createBuffer(0.4, (data, sr) => {
    for (let i = 0; i < data.length; i++) {
      const t = i / sr;
      const env = Math.exp(-t * 10);
      const freq = 220 * Math.exp(-t * 30);
      data[i] = Math.sin(2 * Math.PI * freq * t) * env * 0.7;
    }
  });

  // Convert to WAV files
  const samples = [
    { name: 'kick-808.wav', buffer: kick, category: 'kick' },
    { name: 'snare-acoustic.wav', buffer: snare, category: 'snare' },
    { name: 'hihat-closed.wav', buffer: hihat, category: 'hat' },
    { name: 'tom-low.wav', buffer: tom, category: 'perc' }
  ];

  const files = samples.map(s => {
    const blob = bufferToWav(s.buffer);
    const file = new File([blob], s.name, { type: 'audio/wav' });
    return { file, category: s.category };
  });

  console.log(`%c✓ Generated ${files.length} test samples`, 'color: #00ff00');
  console.log('Samples:', samples.map(s => s.name));

  return files;
}

// Auto-load function
window.loadTestSamples = async () => {
  if (!window.drumMachine || !window.drumMachine.audioNodes) {
    console.error('Load drum machine first!');
    return;
  }

  console.log('%c[Test Samples] Loading into drum machine...', 'color: #ffaa00');

  const { audioNodes, params } = window.drumMachine;
  const testFiles = await generateTestSamples();

  // Manually load each sample
  for (const { file, category } of testFiles) {
    const arrayBuffer = await file.arrayBuffer();
    const ctx = audioNodes.nodes.masterGain.context;

    // Verify audio
    await ctx.decodeAudioData(arrayBuffer.slice(0));

    // Store in IndexedDB
    const sampleId = `test-${category}-${Date.now()}`;
    const sampleData = {
      id: sampleId,
      name: file.name.replace('.wav', ''),
      category: category,
      arrayBuffer: arrayBuffer,
      uploadDate: Date.now()
    };

    // Use the global storeSample function (need to expose it)
    const request = indexedDB.open('drum-machine-samples', 1);
    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction(['samples'], 'readwrite');
      const store = tx.objectStore('samples');
      store.put(sampleData);
    };

    // Add to params
    params.samples.push({
      id: sampleId,
      name: sampleData.name,
      category: category,
      bufferId: sampleId,
      volume: 0.8,
      pan: 0,
      pitch: 0
    });
  }

  // Create tracks
  const pattern = params.patterns[0];
  pattern.tracks = [];

  params.samples.forEach(sample => {
    pattern.tracks.push({
      sampleId: sample.id,
      steps: new Array(16).fill(0),
      length: 16,
      velocity: new Array(16).fill(127),
      offset: 0,
      volume: 0.8,
      mute: false,
      solo: false
    });
  });

  // Update UI
  document.getElementById('dm-drop-zone').style.display = 'none';
  document.getElementById('dm-sample-browser').style.display = 'block';
  document.getElementById('dm-sequencer').style.display = 'block';

  console.log('%c✓ Test samples loaded! Reload page to see them.', 'color: #00ff00; font-size: 14px');
  alert('Test samples loaded! Reload the page to see the drum machine with samples.');
};

console.log('%c[Test Samples] Ready! Run: await loadTestSamples()', 'color: #00ff00; font-size: 12px');
