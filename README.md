# EverSelf — Digital Twin System Demo

EverSelf is a front-end only demo that emulates a digital twin control platform. It highlights the 3D Twin Preview as the brand anchor, implements BUILD/LIVE modes, and runs a mock event bus with replayable telemetry and state transitions.

## Quick Start

```bash
npm install
npm run dev
```

Open the printed URL (usually http://localhost:5173).

## Product Experience

### BUILD Mode

- **Cockpit** (default): 3D Twin Preview, overlay toggles, HUD gauges, Loop Ring, Copilot batch builder, and evidence drawer.
- **Canvas**: DAG flow editor with runnable nodes (React Flow).
- **Foundry**: Scenario library + batch creation + QA gate / factory line views.
- **Bench**: Robustness field heatmap with linked preview.
- **Compare**: Session pair comparison + calibration actions.
- **Lab / Memory / Settings**: Supporting views for experiments, replay, and privacy controls.

### LIVE Mode

- **Live Twin**: Live HUD + stage. Locked until score threshold and QA streak are met (demo unlock).
- **Capture / Coach / Memory / Settings**: Companion tooling panels.

## Mock Data & State Machine

The mock event bus simulates telemetry and twin state updates:

- **Telemetry**: every 500ms (quality, latency, dropout, score, gap, coverage, confidence)
- **Twin state**: every 1s (posture, heatmaps, force vectors, covariance topology)
- **Replay**: last 60s stored in a ring buffer, replayable in Cockpit

Pipeline stages (front-end state machine):

```
IDLE → INGESTING → CALIBRATING → GENERATING → QA_CHECKING → BENCHMARKING → READY_FOR_LIVE
```

Failures are tagged with root-cause labels (e.g., `sync_drift`, `eeg_line_noise`, `contact_model_mismatch`).

## Project Structure

```
src/
  app/            # routing and layout shell
  components/     # shared UI components (stage, HUD, loop ring, etc.)
  mock/           # event bus + mock generators
  pages/          # BUILD / LIVE pages
  store/          # Zustand slices (telemetry/twin/pipeline/ui/batches)
  styles/         # design tokens + global styling
```

## Notes

- Pure front-end demo, no backend required.
- All data is mocked but designed to feel like a real system with state transitions.
