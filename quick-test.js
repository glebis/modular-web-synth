// QUICK TEST - Copy/paste this entire script into Chrome Console

(async () => {
  console.clear();
  console.log('%c=== DRUM MACHINE QUICK TEST ===', 'color: #00ff00; font-size: 18px; font-weight: bold');

  let passed = 0, failed = 0;

  const pass = (msg) => { console.log(`%c✓ ${msg}`, 'color: #00ff00'); passed++; };
  const fail = (msg) => { console.error(`✗ ${msg}`); failed++; };

  try {
    // Test 1: Import module
    console.log('\n%c1. Module Import', 'color: #ffaa00; font-size: 14px; font-weight: bold');
    const module = (await import('./modules/drum-machine.js')).default;
    pass(`Loaded: ${module.name} v${module.version}`);
    pass(`ID: ${module.id}`);

    // Test 2: Structure
    console.log('\n%c2. Module Structure', 'color: #ffaa00; font-size: 14px; font-weight: bold');
    module.audio ? pass('audio section exists') : fail('audio section missing');
    module.ui ? pass('ui section exists') : fail('ui section missing');
    module.state ? pass('state section exists') : fail('state section missing');
    module.lifecycle ? pass('lifecycle section exists') : fail('lifecycle section missing');

    // Test 3: Audio nodes
    console.log('\n%c3. Audio Nodes', 'color: #ffaa00; font-size: 14px; font-weight: bold');
    const ctx = new AudioContext();
    const nodes = module.audio.createNodes(ctx);
    nodes.input ? pass('input node created') : fail('input node missing');
    nodes.output ? pass('output node created') : fail('output node missing');
    nodes.nodes.masterGain ? pass('masterGain node created') : fail('masterGain missing');

    // Test 4: Defaults
    console.log('\n%c4. State Defaults', 'color: #ffaa00; font-size: 14px; font-weight: bold');
    const def = module.state.defaults;
    def.bpm === 120 ? pass('BPM: 120') : fail(`BPM: ${def.bpm}`);
    def.masterVolume === 0.8 ? pass('Master: 0.8') : fail(`Master: ${def.masterVolume}`);
    Array.isArray(def.patterns) ? pass('patterns array exists') : fail('patterns not array');
    Array.isArray(def.samples) ? pass('samples array exists') : fail('samples not array');

    // Test 5: State toggling
    console.log('\n%c5. State Toggling', 'color: #ffaa00; font-size: 14px; font-weight: bold');
    const params = { ...def };

    params.bpm = 140;
    params.bpm === 140 ? pass('BPM toggle: 120 → 140') : fail('BPM toggle failed');

    params.masterVolume = 0.5;
    params.masterVolume === 0.5 ? pass('Volume toggle: 0.8 → 0.5') : fail('Volume toggle failed');

    params.playing = true;
    params.playing === true ? pass('Playing toggle: false → true') : fail('Playing toggle failed');

    params.patterns.push({ id: 'test', name: 'Test', length: 8, tracks: [] });
    params.patterns.length === 2 ? pass('Pattern added: 1 → 2') : fail('Pattern add failed');

    params.currentPattern = 1;
    params.currentPattern === 1 ? pass('Current pattern: 0 → 1') : fail('Pattern toggle failed');

    params.samples.push({ id: 'kick-1', name: 'Kick', category: 'kick', bufferId: 'kick-1', volume: 0.8, pan: 0, pitch: 0 });
    params.samples.length === 1 ? pass('Sample added: 0 → 1') : fail('Sample add failed');

    // Test 6: Save/Load
    console.log('\n%c6. Save/Load State', 'color: #ffaa00; font-size: 14px; font-weight: bold');
    const saved = module.state.save(params);
    saved.bpm === 140 ? pass('Saved BPM: 140') : fail(`Saved BPM: ${saved.bpm}`);
    saved.patterns.length === 2 ? pass('Saved 2 patterns') : fail(`Saved ${saved.patterns.length} patterns`);

    // Test 7: IndexedDB
    console.log('\n%c7. IndexedDB', 'color: #ffaa00; font-size: 14px; font-weight: bold');
    const dbReq = indexedDB.open('drum-machine-samples', 1);
    dbReq.onsuccess = () => {
      const db = dbReq.result;
      pass('IndexedDB opened');
      db.objectStoreNames.contains('samples') ? pass('samples store exists') : fail('samples store missing');
    };
    dbReq.onerror = () => fail(`IndexedDB error: ${dbReq.error}`);

    // Summary
    setTimeout(() => {
      console.log('\n%c=== SUMMARY ===', 'color: #00ff00; font-size: 16px; font-weight: bold');
      console.log(`%c✓ Passed: ${passed}`, 'color: #00ff00; font-size: 14px');
      failed > 0 && console.log(`%c✗ Failed: ${failed}`, 'color: #ff0000; font-size: 14px');

      console.log('\n%cInspect state:', 'color: #ffaa00');
      console.log('params:', params);
      console.log('saved:', saved);
      console.log('module:', module);
    }, 500);

  } catch (error) {
    fail(`CRITICAL ERROR: ${error.message}`);
    console.error(error);
  }
})();
