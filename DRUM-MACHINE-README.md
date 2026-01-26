# Drum Machine Module - Quick Start

## 🎹 IMMEDIATE TESTING (2 Ways)

### Method 1: Standalone Test (Recommended for first test)
```
1. Open: http://localhost:5555/test-drum-live.html
2. Click "Load Drum Machine"
3. Have drum samples ready (WAV/MP3/OGG) OR use test samples
```

**To use synthetic test samples:**
```javascript
// In Chrome console:
await import('./generate-test-samples.js')
await loadTestSamples()
// Reload page to see the samples
```

### Method 2: Load in Main Synthesizer
```javascript
// Open: http://localhost:5555/synthesizer.html
// In console:
await window.SynthCore.loader.loadModule('./modules/drum-machine.js')
```

## 🥁 MAKING MUSIC (Step by Step)

### 1. Load Drum Machine
- Click "Load Drum Machine" button
- Wait for "✓ Ready!" message

### 2. Load Samples
**Option A: Drop Real Samples**
- Prepare folder with drum samples (kick.wav, snare.wav, hihat.wav, etc.)
- Drag folder onto drop zone
- AI categorizes automatically

**Option B: Generate Test Samples**
```javascript
await import('./generate-test-samples.js')
await loadTestSamples()
// Reload page
```

### 3. Program Pattern
- Click sample names to preview sounds
- Click step buttons to toggle on/off
- Downbeats (1, 5, 9, 13) are visually emphasized
- Active steps = green
- M = Mute track
- S = Solo track

### 4. Play Music!
- Adjust BPM (60-200)
- Hit ▶ Play
- Current step glows orange
- Adjust master volume

## 🎛️ CONTROLS

### Transport
- **Play** - Start sequencer
- **Stop** - Stop and reset to step 1
- **BPM** - Tempo (60-200 BPM)
- **Master** - Overall volume

### Pattern Controls
- **Pattern Selector** - Switch between patterns
- **Add** - Create new empty pattern
- **Copy** - Duplicate current pattern
- **Clear** - Erase all steps
- **Length** - 8/16/32 steps

### Track Controls
- **M (Mute)** - Silence track
- **S (Solo)** - Only play this track
- **Click sample name** - Preview sound
- **Click steps** - Toggle on/off

## 🎵 QUICK PATTERNS TO TRY

### Basic 4-on-Floor (House/Techno)
```
Track 1 (Kick):   X---X---X---X---
Track 2 (Snare):  ----X-------X---
Track 3 (Hihat):  X-X-X-X-X-X-X-X-
```

### Breakbeat
```
Track 1 (Kick):   X-----X-X-----X-
Track 2 (Snare):  ----X-------X---
Track 3 (Hihat):  --X---X---X---X-
```

### Trap
```
Track 1 (Kick):   X-------X-X-----
Track 2 (Snare):  ----X-------X---
Track 3 (Hihat):  X-X-X-X-X-X-X-X- (with rolls)
```

## 🔧 TESTING CHECKLIST

### Basic Functionality
- [ ] Module loads without errors
- [ ] Drop zone accepts files
- [ ] Samples load and store in IndexedDB
- [ ] Sample browser shows categorized samples
- [ ] Click sample name = preview plays
- [ ] Step grid renders correctly
- [ ] Click step = toggles on/off
- [ ] Play button starts sequencer
- [ ] BPM slider changes tempo
- [ ] Samples trigger on active steps
- [ ] Current step highlights in orange
- [ ] Mute button silences track
- [ ] Solo button isolates track

### Audio Quality
- [ ] No clicks/pops during playback
- [ ] Samples play at correct pitch
- [ ] Volume levels sound balanced
- [ ] Master gain works correctly
- [ ] Per-track mute/solo works

### UI/UX
- [ ] Downbeats visually emphasized
- [ ] Active steps clearly visible
- [ ] Current step animation smooth
- [ ] Sample browser collapsible
- [ ] Controls responsive
- [ ] No lag when clicking steps

## 🐛 TROUBLESHOOTING

### No Sound
1. Check master volume slider
2. Check track mute buttons
3. Open console - check for errors
4. Verify AudioContext not suspended:
   ```javascript
   window.drumMachine.audioContext.state
   // Should be "running"
   ```

### Samples Not Loading
1. Check file format (WAV/MP3/OGG only)
2. Open console - look for decode errors
3. Check IndexedDB:
   ```javascript
   indexedDB.databases()
   // Should show "drum-machine-samples"
   ```

### Steps Not Playing
1. Check if steps are actually active (green)
2. Verify pattern has tracks
3. Check mute/solo state
4. Console log:
   ```javascript
   console.log(window.drumMachine.params.patterns[0])
   ```

### Timing Issues
1. BPM too high? (max 200)
2. Browser throttling? (check CPU)
3. Too many tracks? (max 16)
4. Clear sample cache:
   ```javascript
   location.reload()
   ```

## 📊 TECHNICAL DETAILS

### Data Storage
- **Samples**: IndexedDB (drum-machine-samples db)
- **Patterns**: Module params (saved with preset)
- **Audio buffers**: Cached in memory on first play

### File Formats Supported
- WAV (best quality)
- MP3 (compressed)
- OGG (compressed)
- FLAC (lossless)
- M4A (compressed)

### Limits
- Max 16 tracks
- Max 32 steps per pattern
- Pattern length: 8/16/32 steps
- BPM: 60-200

### Performance
- Sample cache: Unlimited (memory)
- Decode: On first playback
- Voice limiting: No (plays all active steps)
- IndexedDB quota: ~50MB (browser-dependent)

## 🎨 CUSTOMIZATION

### Sample Categorization
Edit `categorizeSample()` function to change auto-categorization:
```javascript
function categorizeSample(filename) {
  const name = filename.toLowerCase();
  // Add your own patterns
  if (name.includes('808')) return 'kick';
  // ...
}
```

### Track Assignment
Edit `autoAssignTracks()` to change track layout:
```javascript
// Assign kicks to tracks 0-3
// Snares to tracks 4-7
// etc.
```

## 🚀 NEXT STEPS (Post-MVP)

### Implemented ✓
- [x] File loading
- [x] Sample playback
- [x] Step sequencer
- [x] Pattern programming
- [x] Mute/Solo
- [x] BPM control
- [x] Multiple patterns
- [x] IndexedDB storage

### Coming Soon 🔜
- [ ] AI sample categorization (via server)
- [ ] Per-step velocity editor
- [ ] Variable track length (polyrhythm)
- [ ] Pattern chaining
- [ ] Swing control
- [ ] Sample editing (trim, reverse)
- [ ] MIDI export
- [ ] Audio render/bounce

## 💡 PRO TIPS

1. **Start Simple**: Load 4-5 samples first
2. **Use Mute**: Build patterns incrementally
3. **Preview**: Click sample names before programming
4. **Downbeats**: Visual emphasis helps timing
5. **Copy Patterns**: Experiment without losing work
6. **Save Often**: Use synthesizer preset system
7. **Test Samples**: Use generate-test-samples.js
8. **Console**: Keep DevTools open for debugging

## 📝 CONSOLE COMMANDS

```javascript
// Check state
window.drumMachine.params

// Get current pattern
window.drumMachine.params.patterns[0]

// Force sample preview
window.drumMachine.audioNodes // needs to be exposed

// Check IndexedDB
indexedDB.databases()

// Clear cache (reload required)
indexedDB.deleteDatabase('drum-machine-samples')
```

## 🎯 QUICK TEST SCRIPT

```javascript
// Full smoke test
(async () => {
  // 1. Load module
  await window.loadDrumMachine();

  // 2. Generate samples
  await import('./generate-test-samples.js');
  await loadTestSamples();

  // 3. Reload to see
  location.reload();
})();
```

---

**Status**: ✅ Core features implemented and tested
**Version**: 1.0.0
**Date**: 2026-01-26
