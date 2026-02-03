import { useState } from 'react';
import { usePipelineStore } from '../store/usePipelineStore';
import { useBatchStore } from '../store/useBatchStore';
import { createBatchConfig } from '../mock/generators';

const CopilotConsole = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const runPipeline = usePipelineStore((state) => state.runPipeline);
  const bumpVersion = usePipelineStore((state) => state.bumpVersion);
  const addBatch = useBatchStore((state) => state.addBatch);

  const handleSubmit = () => {
    if (!input.trim()) return;
    const config = createBatchConfig();
    addBatch(config);
    bumpVersion();
    runPipeline();
    setOutput(
      [
        'Plan:',
        `• Ingest ${config.scenario} samples`,
        '• Calibrate synchrony + contact map',
        '• Generate twin pass with noise injection',
        '• Run QA gate + Bench',
        '',
        'Config Preview:',
        `scenario: ${config.scenario}`,
        `seed: ${config.seed}`,
        `version: ${config.versionId}`,
        `hash: ${config.configHash}`,
        '',
        'Why:',
        'Targeting low-latency alignment while preserving EEG phase coherence.',
      ].join('\n'),
    );
    setInput('');
  };

  return (
    <div className="copilot-console">
      <div className="copilot-title">Copilot</div>
      <div className="copilot-input">
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Describe the batch you want to build..."
        />
        <button className="action-btn" onClick={handleSubmit}>
          Generate
        </button>
      </div>
      <pre className="copilot-output">{output || 'Awaiting instruction...'}</pre>
    </div>
  );
};

export default CopilotConsole;
