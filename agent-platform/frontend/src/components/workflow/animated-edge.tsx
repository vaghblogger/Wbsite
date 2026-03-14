"use client";

import { memo } from "react";
import {
  BaseEdge,
  getSmoothStepPath,
  type EdgeProps,
} from "@xyflow/react";

function AnimatedEdgeComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style,
  data,
}: EdgeProps) {
  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 16,
  });

  const isActive = (data as { active?: boolean })?.active;

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          ...style,
          stroke: isActive ? "rgba(139, 92, 246, 0.6)" : "rgba(113, 113, 122, 0.3)",
          strokeWidth: isActive ? 2 : 1.5,
          transition: "stroke 0.3s, stroke-width 0.3s",
        }}
      />
      {isActive && (
        <circle r="3" fill="#8b5cf6" opacity="0.8">
          <animateMotion dur="1.2s" repeatCount="indefinite" path={edgePath} />
        </circle>
      )}
    </>
  );
}

export const AnimatedEdge = memo(AnimatedEdgeComponent);
