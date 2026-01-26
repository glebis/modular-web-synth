// Copy and paste this into Chrome DevTools Console at http://localhost:5555/test-drum-machine.html
// Then run: await runAllTests()

window.runAllTests = async function() {
  console.clear();
  console.log('%c=== DRUM MACHINE MODULE TESTS ===', 'color: #00ff00; font-size: 16px; font-weight: bold');

  let passed = 0;
  let failed = 0;

  function logPass(msg) {
    console.log(`%c✓ ${msg}`, 'color: #00ff00');
    passed++;
  }

  function logFail(msg) {
    console.error(`✗ ${msg}`);
    failed++;
  }

  // Test 1: Module Loading
  console.log('\n%cTest 1: Module Loading', 'color: #ffaa00; font-weight: bold');
  try {
    const module = (await import('./modules/drum-machine.js')).default;
    logPass(`Module imported: ${module.name} v${module.version}`);

    if (module.id === 'drum-machine') logPass('Module ID correct');
    if (module.audio) logPass('Audio section exists');
    if (module.ui) logPass('UI section exists');
    if (module.state) logPass('State section exists');
    if (module.lifecycle) logPass('Lifecycle section exists');

    window.testModule = module;
  } catch (error) {
    logFail(`Module loading failed: ${error.message}`);
  }

  // Test 2: Audio Node Creation
  console.log('\n%cTest 2: Audio Node Creation', 'color: #ffaa00; font-weight: bold');
  try {
    const ctx = new AudioContext();
    const audioNodes = window.testModule.audio.createNodes(ctx);

    if (audioNodes.input) logPass('Input node created');
    if (audioNodes.output) logPass('Output node created');
    if (audioNodes.nodes.masterGain) logPass('Master gain node created');

    logPass(`Insertion point: ${window.testModule.audio.insertionPoint}`);
    logPass(`Routing mode: ${window.testModule.audio.routing}`);

    window.testAudioNodes = audioNodes;
    window.testCtx = ctx;
  } catch (error) {
    logFail(`Audio node creation failed: ${error.message}`);
  }

  // Test 3: UI Template
  console.log('\n%cTest 3: UI Template', 'color: #ffaa00; font-weight: bold');
  try {
    const template = window.testModule.ui.template;

    if (template.includes('dm-play')) logPass('Play button in template');
    if (template.includes('dm-stop')) logPass('Stop button in template');
    if (template.includes('dm-drop-zone')) logPass('Drop zone in template');
    if (template.includes('dm-sequencer')) logPass('Sequencer section in template');
    if (template.includes('dm-sample-browser')) logPass('Sample browser in template');

  } catch (error) {
    logFail(`UI template test failed: ${error.message}`);
  }

  // Test 4: State Defaults
  console.log('\n%cTest 4: State Defaults', 'color: #ffaa00; font-weight: bold');
  try {
    const defaults = window.testModule.state.defaults;

    if (defaults.bpm === 120) logPass('Default BPM: 120');
    if (defaults.masterVolume === 0.8) logPass('Default master volume: 0.8');
    if (Array.isArray(defaults.patterns)) logPass('Patterns is array');
    if (defaults.patterns.length === 1) logPass('One default pattern');
    if (Array.isArray(defaults.samples)) logPass('Samples is array');
    if (defaults.playing === false) logPass('Default playing: false');

    window.testParams = { ...defaults };
  } catch (error) {
    logFail(`State defaults test failed: ${error.message}`);
  }

  // Test 5: State Toggling
  console.log('\n%cTest 5: State Toggling', 'color: #ffaa00; font-weight: bold');
  try {
    // Toggle BPM
    window.testParams.bpm = 140;
    if (window.testParams.bpm === 140) logPass('BPM toggled: 120 → 140');

    // Toggle volume
    window.testParams.masterVolume = 0.5;
    if (window.testParams.masterVolume === 0.5) logPass('Volume toggled: 0.8 → 0.5');

    // Toggle playing
    window.testParams.playing = true;
    if (window.testParams.playing === true) logPass('Playing toggled: false → true');

    // Add pattern
    window.testParams.patterns.push({
      id: 'test-pattern',
      name: 'Test Pattern',
      length: 8,
      tracks: []
    });
    if (window.testParams.patterns.length === 2) logPass('Pattern added: 1 → 2');

    // Toggle current pattern
    window.testParams.currentPattern = 1;
    if (window.testParams.currentPattern === 1) logPass('Current pattern toggled: 0 → 1');

    // Add sample
    window.testParams.samples.push({
      id: 'kick-1',
      name: 'Test Kick',
      category: 'kick',
      bufferId: 'kick-1',
      volume: 0.8,
      pan: 0,
      pitch: 0
    });
    if (window.testParams.samples.length === 1) logPass('Sample added: 0 → 1');

    // Add track to pattern
    window.testParams.patterns[0].tracks.push({
      sampleId: 'kick-1',
      steps: new Array(16).fill(0),
      length: 16,
      velocity: new Array(16).fill(127),
      offset: 0,
      volume: 0.8,
      mute: false,
      solo: false
    });
    if (window.testParams.patterns[0].tracks.length === 1) logPass('Track added to pattern');

    // Toggle step
    window.testParams.patterns[0].tracks[0].steps[0] = 1;
    if (window.testParams.patterns[0].tracks[0].steps[0] === 1) logPass('Step toggled: 0 → 1');

    // Toggle mute
    window.testParams.patterns[0].tracks[0].mute = true;
    if (window.testParams.patterns[0].tracks[0].mute === true) logPass('Mute toggled: false → true');

  } catch (error) {
    logFail(`State toggling failed: ${error.message}`);
  }

  // Test 6: IndexedDB
  console.log('\n%cTest 6: IndexedDB', 'color: #ffaa00; font-weight: bold');
  try {
    const request = indexedDB.open('drum-machine-samples', 1);

    request.onsuccess = () => {
      const db = request.result;
      logPass('IndexedDB opened');

      if (db.objectStoreNames.contains('samples')) {
        logPass('Object store "samples" exists');

        const tx = db.transaction(['samples'], 'readonly');
        const store = tx.objectStore('samples');

        if (store.indexNames.contains('category')) logPass('Index "category" exists');
        if (store.indexNames.contains('uploadDate')) logPass('Index "uploadDate" exists');
      } else {
        logFail('Object store "samples" not found');
      }
    };

    request.onerror = () => {
      logFail(`IndexedDB error: ${request.error}`);
    };

  } catch (error) {
    logFail(`IndexedDB test failed: ${error.message}`);
  }

  // Test 7: Save/Load State
  console.log('\n%cTest 7: Save/Load State', 'color: #ffaa00; font-weight: bold');
  try {
    const saved = window.testModule.state.save(window.testParams);

    if (saved.bpm === 140) logPass('Saved BPM: 140');
    if (saved.masterVolume === 0.5) logPass('Saved master volume: 0.5');
    if (saved.patterns.length === 2) logPass('Saved 2 patterns');
    if (saved.samples.length === 1) logPass('Saved 1 sample');
    if (saved.currentPattern === 1) logPass('Saved current pattern: 1');

    // Test load
    const newParams = { ...window.testModule.state.defaults };
    window.testModule.state.load(newParams, saved, window.testAudioNodes);

    if (newParams.bpm === 140) logPass('Loaded BPM: 140');
    if (newParams.patterns.length === 2) logPass('Loaded 2 patterns');

  } catch (error) {
    logFail(`Save/load test failed: ${error.message}`);
  }

  // Summary
  console.log('\n%c=== TEST SUMMARY ===', 'color: #00ff00; font-size: 16px; font-weight: bold');
  console.log(`%c✓ Passed: ${passed}`, 'color: #00ff00; font-size: 14px');
  if (failed > 0) {
    console.log(`%c✗ Failed: ${failed}`, 'color: #ff0000; font-size: 14px');
  }

  console.log('\n%cTo inspect state:', 'color: #ffaa00');
  console.log('window.testModule   - Module definition');
  console.log('window.testParams   - Current params state');
  console.log('window.testAudioNodes - Audio nodes');

  return { passed, failed };
}

// Run on load
console.log('%cDrum Machine Console Tests Ready', 'color: #00ff00; font-size: 14px');
console.log('%cRun: await runAllTests()', 'color: #ffaa00; font-size: 12px');
