"use client";

import { useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  type Node,
  type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { CustomNode } from "./custom-node";
import { AnimatedEdge } from "./animated-edge";
import type { AgentWorkflow, NodeStatus } from "@/types";

const nodeTypes = { custom: CustomNode };
const edgeTypes = { animated: AnimatedEdge };

interface WorkflowCanvasProps {
  workflow: AgentWorkflow;
  nodeStates: Record<string, NodeStatus>;
}

export function WorkflowCanvas({ workflow, nodeStates }: WorkflowCanvasProps) {
  const nodes: Node[] = useMemo(
    () =>
      workflow.nodes.map((n) => ({
        id: n.id,
        type: "custom",
        position: n.position,
        data: {
          label: n.label,
          status: nodeStates[n.id] || "idle",
        },
      })),
    [workflow.nodes, nodeStates]
  );

  const edges: Edge[] = useMemo(() => {
    const runningOrCompleted = new Set(
      Object.entries(nodeStates)
        .filter(([, s]) => s === "running" || s === "completed")
        .map(([id]) => id)
    );

    return workflow.edges.map((e, i) => ({
      id: `e-${i}`,
      source: e.source,
      target: e.target,
      type: "animated",
      data: {
        active: runningOrCompleted.has(e.source) && runningOrCompleted.has(e.target),
      },
    }));
  }, [workflow.edges, nodeStates]);

  return (
    <div className="h-full w-full rounded-xl border border-white/[0.06] bg-zinc-900/50 overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        proOptions={{ hideAttribution: true }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        panOnDrag={false}
        zoomOnScroll={false}
        zoomOnDoubleClick={false}
        minZoom={0.5}
        maxZoom={1.5}
      >
        <Background gap={20} size={1} color="rgba(255,255,255,0.03)" />
        <Controls
          showInteractive={false}
          className="!bg-zinc-900 !border-zinc-800 !rounded-lg !shadow-xl"
        />
      </ReactFlow>
    </div>
  );
}
