import { useCallback, useMemo, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  Connection,
  Edge,
  Node,
  useNodesState,
  useEdgesState,
} from 'reactflow';
import 'reactflow/dist/style.css';

type NodeStatus = 'idle' | 'running' | 'done' | 'failed';
type FlowNodeData = { label: string };

const initialNodes: Node<FlowNodeData>[] = [
  { id: '1', position: { x: 50, y: 60 }, data: { label: 'Source' }, type: 'input' },
  { id: '2', position: { x: 230, y: 20 }, data: { label: 'Calibrate' }, type: 'default' },
  { id: '3', position: { x: 230, y: 120 }, data: { label: 'BodySim' }, type: 'default' },
  { id: '4', position: { x: 430, y: 70 }, data: { label: 'NeuroSim' }, type: 'default' },
  { id: '5', position: { x: 630, y: 70 }, data: { label: 'QA' }, type: 'default' },
  { id: '6', position: { x: 820, y: 70 }, data: { label: 'Export' }, type: 'output' },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2' },
  { id: 'e1-3', source: '1', target: '3' },
  { id: 'e2-4', source: '2', target: '4' },
  { id: 'e3-4', source: '3', target: '4' },
  { id: 'e4-5', source: '4', target: '5' },
  { id: 'e5-6', source: '5', target: '6' },
];

const Canvas = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [activeNode, setActiveNode] = useState<Node<FlowNodeData> | null>(initialNodes[0]);
  const [nodeStatus, setNodeStatus] = useState<Record<string, NodeStatus>>({});

  const handleConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const runSelected = () => {
    if (!activeNode) return;
    setNodeStatus((state) => ({ ...state, [activeNode.id]: 'running' }));
    setTimeout(() => {
      setNodeStatus((state) => ({ ...state, [activeNode.id]: 'done' }));
    }, 900);
  };

  const runDownstream = () => {
    const ids = nodes.map((node) => node.id);
    ids.forEach((id, index) => {
      setTimeout(() => {
        setNodeStatus((state) => ({ ...state, [id]: 'running' }));
        setTimeout(() => {
          setNodeStatus((state) => ({ ...state, [id]: 'done' }));
        }, 700);
      }, index * 300);
    });
  };

  const library = useMemo(
    () => [
      'Source',
      'Calibrate',
      'BodySim',
      'NeuroSim',
      'Noise',
      'QA',
      'Bench',
      'Export',
    ],
    [],
  );

  return (
    <div className="page canvas">
      <div className="canvas-layout">
        <aside className="panel">
          <h3>Node Library</h3>
          <div className="list-grid">
            {library.map((item) => (
              <button key={item} className="list-btn">
                {item}
              </button>
            ))}
          </div>
        </aside>
        <section className="canvas-stage">
          <div className="canvas-actions">
            <button className="action-btn" onClick={runSelected}>
              Run Selected
            </button>
            <button className="action-btn ghost" onClick={runDownstream}>
              Run Downstream
            </button>
          </div>
          <ReactFlow
            nodes={nodes.map((node) => ({
              ...node,
              style: {
                borderRadius: 12,
                border:
                  nodeStatus[node.id] === 'running'
                    ? '1px solid #6df0ff'
                    : nodeStatus[node.id] === 'done'
                    ? '1px solid #66f2a4'
                    : '1px solid #1c2a33',
                background: '#0e151b',
                color: '#dbe7f3',
                padding: 10,
              },
              data: { label: node.data.label },
            }))}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={handleConnect}
            onNodeClick={(_, node) => setActiveNode(node)}
            fitView
          >
            <Background gap={18} color="#15212b" />
            <MiniMap />
            <Controls />
          </ReactFlow>
        </section>
        <aside className="panel inspector">
          <h3>Inspector</h3>
          <div className="inspector-block">
            <span>Node</span>
            <strong>{activeNode?.data.label || 'None'}</strong>
            <span>Status</span>
            <strong>{activeNode ? nodeStatus[activeNode.id] || 'idle' : 'idle'}</strong>
          </div>
          <div className="inspector-block">
            <h4>Params</h4>
            <textarea
              defaultValue={`{\n  "sample_rate": 512,\n  "window": 30,\n  "noise": 0.12\n}`}
            />
          </div>
          <div className="inspector-block">
            <h4>Evidence</h4>
            <div className="evidence-mini" />
          </div>
          <div className="inspector-block">
            <h4>Logs</h4>
            <p className="muted">running calibrate → neuroSim → QA</p>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Canvas;
