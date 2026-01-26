# AI Drum Machine - Preset System Guide

## ✨ What's New

Complete preset system with **auto-generated names** that describe your pattern's style, complexity, and settings.

---

## 🎯 Quick Start

### Save a Preset
1. Generate sounds (single or kit)
2. Program your pattern (click steps)
3. Adjust BPM and swing
4. Click **"💾 Save Current Preset"**
5. **Optional**: Enter custom name, or leave empty for auto-generation
6. Done! Preset saved with descriptive name

### Load a Preset
1. Open **"💾 Presets"** panel
2. Click any preset card
3. Everything loads: sounds, pattern, BPM, swing
4. Start playing immediately!

---

## 🏷️ Auto-Generated Names

Preset names are **automatically generated** based on your pattern's content:

### Name Format
```
[Style] [Density] [BPM]bpm [Swing]
```

### Examples
- `Trap heavy 140bpm sw50%` - Trap kit, lots of steps, 140 BPM, 50% swing
- `808 medium 120bpm` - 808 kit, moderate density, no swing
- `House full 128bpm sw25%` - House kit, full pattern, 128 BPM, 25% swing
- `5trk sparse 90bpm` - 5 tracks, few steps, 90 BPM
- `Techno empty 135bpm` - Sounds loaded but no pattern yet

### Style Detection
Auto-detects kit style from sound prompts:
- **808** - Classic Roland TR-808
- **Trap** - Modern trap production
- **House** - Four-on-the-floor house
- **Techno** - Minimal techno
- **DnB** - Drum & bass (fast tempo)
- **Lo-Fi** - Degraded vintage character
- **Acoustic** - Natural drum sounds
- **Industrial** - Harsh metallic textures

If no style detected: `5trk` (shows track count instead)

### Density Classification
Based on total active steps across all tracks:
- **empty** - 0 steps (sounds loaded, no pattern)
- **sparse** - 1-10 steps
- **medium** - 11-20 steps
- **full** - 21-30 steps
- **heavy** - 31+ steps

### Additional Info
- **BPM**: Always included (e.g., `120bpm`)
- **Swing**: Only if > 0% (e.g., `sw50%`)

---

## 💾 What Gets Saved

### Complete State
- **All tracks** with sounds and variants
- **All patterns** (if you have multiple)
- **Step data** for each track
- **BPM** and **swing** settings
- **Per-track settings**: mute, solo, volume, length
- **Selected variants** (which v1/v2/v3 is active)

### What Doesn't Get Saved
- Visual UI state (which panels are open)
- Playback position (stops on load)
- Oscilloscope display state

---

## 🎨 Preset Library UI

### Location
Below the sequencer, next to Sounds Library:

```
┌──────────────────────┬──────────────────────┐
│ 📦 Sounds Library    │ 💾 Presets (5)       │
│ (15 sounds)          │                      │
│                      │ Trap heavy 140bpm    │
│ kick (3 variants)    │ sw50%                │
│ snare (3 variants)   │ 5 tracks • 01/26     │
│ [⬇ Download All]     │ [✗]                  │
│                      │                      │
│                      │ 808 medium 120bpm    │
│                      │ 4 tracks • 01/26     │
│                      │ [✗]                  │
│                      │                      │
│                      │ [💾 Save Current]    │
└──────────────────────┴──────────────────────┘
```

### Preset Card Shows
- **Name** (auto-generated or custom)
- **Track count** (how many sounds)
- **BPM**
- **Date & time** saved
- **Delete button** [✗]

### Interactions
- **Click card** → Load preset
- **Hover** → Highlight (orange border)
- **Click [✗]** → Delete preset
- **Click [💾 Save]** → Save new preset

---

## 📝 Custom Names

### Option 1: Auto-Generated (Recommended)
1. Click **"💾 Save Current Preset"**
2. Leave prompt **empty**
3. Press Enter
4. Name generated automatically

### Option 2: Custom Name
1. Click **"💾 Save Current Preset"**
2. Type your name: `"Sunday Jam Session"`
3. Press Enter
4. Preset saved with your name

### Tips for Custom Names
- Keep it short (20 chars max for best display)
- Descriptive names help: `"Intro Beat"`, `"Drop Pattern"`, `"Verse 1"`
- Avoid special characters (can cause issues)

---

## 🔄 Typical Workflow

### Workflow 1: Quick Jam
```
1. Click "Trap Kit" → generates 5 sounds
2. Click steps to program pattern
3. Adjust BPM to 140
4. Add 50% swing
5. Click "💾 Save" → auto-names: "Trap heavy 140bpm sw50%"
6. Keep jamming, modify pattern
7. Save again → new variation saved
```

### Workflow 2: Building a Song
```
1. Generate kick + snare sounds
2. Program intro pattern (sparse)
3. Save: "Intro sparse 120bpm"

4. Add hi-hats, fill out pattern
5. Save: "Trap full 120bpm"

6. Program breakdown (only hi-hats)
7. Save: "Breakdown sparse 120bpm"

8. Now switch between presets during arrangement!
```

### Workflow 3: Sound Design
```
1. Generate 808 kick (3 variants)
2. Test each variant in pattern
3. Save preset per variant: "808 kick v1", "808 kick v2", "808 kick v3"
4. Compare side-by-side by loading presets
5. Pick winner, delete others
```

---

## 🚀 Power User Tips

### 1. Version Control
Save multiple versions of same pattern:
- `Trap heavy 140bpm` (original)
- `Trap heavy 140bpm v2` (with fills)
- `Trap heavy 140bpm final` (cleaned up)

### 2. A/B Testing
Create variations:
- Load preset
- Change one element (BPM, swing, one track)
- Save as new preset
- Compare by loading each

### 3. Template Building
Save empty patterns as templates:
- Generate sounds, don't program steps
- Save: `Trap Kit Template`
- Load when starting new track
- Instant sound palette

### 4. Performance Presets
Save presets for live performance:
- `Set A - Intro`
- `Set A - Verse`
- `Set A - Chorus`
- `Set A - Outro`
- Click to switch during set

### 5. Backup Strategy
Download all sounds separately:
- Presets save pattern data + sounds
- Sounds Library has raw audio
- Download both for complete backup

---

## 🐛 Troubleshooting

### "Preset not found" Error
**Problem**: Deleted from localStorage

**Fix**: Preset is gone, can't recover (use download backup)

### Preset loads but no sounds play
**Problem**: Sound files deleted from localStorage

**Fix**:
1. Check Sounds Library
2. Re-generate missing sounds
3. Save new preset

### Auto-generated name is generic
**Problem**: Not enough context (e.g., "5trk medium 120bpm")

**Fix**: This is normal if sounds don't have style keywords. Either:
- Use custom name
- Or accept generic name (still descriptive)

### Can't save preset - "Storage full"
**Problem**: localStorage quota exceeded

**Fix**:
1. Delete old presets (click [✗])
2. Delete old sounds (Sounds Library)
3. Each preset ~50-200KB depending on audio data

### Preset loads wrong pattern
**Problem**: Multiple patterns, loaded wrong one

**Fix**: Preset saves `currentPattern` index. If you had pattern B selected, that's what loads.

---

## 💡 Best Practices

### DO
- ✅ Save often (no undo yet!)
- ✅ Use descriptive custom names for important patterns
- ✅ Delete old test presets
- ✅ Backup sounds separately via Download
- ✅ Name templates clearly (end with "Template")

### DON'T
- ❌ Rely on presets as only backup (download sounds too!)
- ❌ Save hundreds of presets (will slow down)
- ❌ Use very long names (display cuts off)
- ❌ Forget to clean up storage periodically

---

## 📊 Storage Management

### What Uses Storage
- **Sounds**: ~50-100KB each (base64 audio)
- **Presets**: ~100-300KB each (includes sound refs)
- **Browser limit**: ~5-10MB total for localStorage

### When to Clean Up
Signs you need to delete old data:
- "Storage full" errors
- Slow load times
- Can't save new presets

### What to Delete First
1. Old test presets (experiments)
2. Duplicate sounds (same prompt, different variants)
3. Unused sounds (not in any preset)

### How to Check Usage
```javascript
// In browser console:
const sounds = localStorage.getItem('ai-drum-sounds');
const presets = localStorage.getItem('ai-drum-presets');

console.log('Sounds:', (sounds.length / 1024).toFixed(2), 'KB');
console.log('Presets:', (presets.length / 1024).toFixed(2), 'KB');
console.log('Total:', ((sounds.length + presets.length) / 1024).toFixed(2), 'KB');
```

---

## 🎹 Example Preset Names

### Auto-Generated Examples
```
Trap heavy 140bpm sw50%       # Full trap beat with swing
808 sparse 100bpm             # Minimal 808 pattern
House full 128bpm             # Classic house 4/4
Techno medium 135bpm sw25%    # Techno with slight shuffle
DnB heavy 174bpm              # Fast drum & bass
Lo-Fi empty 85bpm             # Sounds loaded, no pattern yet
Acoustic medium 95bpm         # Live drum pattern
Industrial full 120bpm        # Heavy industrial beat
5trk sparse 110bpm            # Generic 5-track sparse pattern
```

### Custom Name Examples
```
Sunday Jam V1                 # Session naming
Drop Pattern Final            # Song section
Verse Beat - take 3           # Iteration tracking
Intro (no hats)               # Note about arrangement
Experimental Swing            # Descriptive purpose
```

---

## 🔮 Future Enhancements

### Planned Features
- Export preset as MIDI file
- Share presets via URL/code
- Import presets from files
- Preset tags/categories
- Search/filter presets
- Preset templates gallery
- Cloud backup (optional)
- Collaborative preset sharing

---

## 📝 Quick Reference

### Keyboard Shortcuts (Future)
```
Cmd/Ctrl + S    → Save preset
Cmd/Ctrl + O    → Load preset dialog
Cmd/Ctrl + D    → Delete current preset
```

### Console Commands
```javascript
// List all presets
JSON.parse(localStorage.getItem('ai-drum-presets'))

// Save programmatically
savePreset(window.aiDrumAudioNodes, window.aiDrumMachine.params, "My Beat")

// Load preset by ID
loadPreset("1706282400000", window.aiDrumAudioNodes, window.aiDrumMachine.params)

// Generate name for current state
generatePresetName(window.aiDrumMachine.params)
```

---

**Ready to jam!** Save your patterns and never lose a great idea again. 🎵

**Questions?** Check console for debug info or ask for help.
