"use client";
import {
  ReactFlow,
  Background,
  Controls,
  type Node,
  type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useApp } from "@/Components/app/Providers";
import { curriculum } from "@/lib/data/loaders";
import {
  deriveModuleState,
  requirementModules,
  evaluateRequirement,
  planningAvailability,
} from "@/lib/domain/requirements";
export default function Graph({ select }: { select: (id: string) => void }) {
  const { profile, locale, mt, dataset } = useApp();
  const rows = new Map<number, number>();
  const nodes: Node[] = curriculum.modules.map((m) => {
    const semester = m.recommendedSemester || 8,
      row = rows.get(semester) || 0;
    rows.set(semester, row + 1);
    const state = deriveModuleState(m.id, curriculum, profile);
    const availability = planningAvailability(
      m.id,
      curriculum,
      profile,
      dataset,
    );
    return {
      id: m.id,
      position: { x: (semester - 1) * 225, y: row * 130 },
      data: {
        label: (
          <>
            <strong>{m.id.toUpperCase()}</strong>
            <br />
            {m.name[locale]}
            <br />
            <small>
              {m.credits ?? "?"} ECTS · {mt("badge." + state.primaryBadge)}
              <br />
              {availability === "unknown"
                ? mt("common.unknown")
                : availability === "completed"
                  ? mt("badge.completed")
                  : mt("map." + availability)}
            </small>
          </>
        ),
      },
      style: {
        background:
          availability === "blocked"
            ? "#ffdfd6"
            : state.primaryBadge === "completed"
              ? "#d9efd6"
              : state.primaryBadge === "exam_only"
                ? "#dce7ff"
                : state.primaryBadge === "needs_review"
                  ? "#fff0bb"
                  : availability === "recommendedCourse"
                    ? "#dfff90"
                    : "#fff",
      },
    };
  });
  for (const m of curriculum.milestones)
    nodes.push({
      id: "milestone:" + m.id,
      position: { x: 900, y: 1000 },
      data: {
        label: (
          <>
            <strong>{m.name[locale]}</strong>
            <br />
            {mt(
              "truth." +
                evaluateRequirement(m.requirement, curriculum, profile),
            )}
          </>
        ),
      },
      style: { background: "#dfff5e" },
    });
  const edges: Edge[] = curriculum.rules.flatMap((r) =>
    requirementModules(r.requirement, curriculum).map((source) => ({
      id: r.id + source,
      source,
      target: r.target.id,
      style: {
        stroke: r.strength === "hard" ? "#161616" : "#58709d",
        strokeWidth: 2,
        strokeDasharray: r.strength === "recommended" ? "6 4" : undefined,
      },
      label: r.strength === "recommended" ? "~" : undefined,
    })),
  );
  for (const m of curriculum.milestones)
    for (const source of requirementModules(m.requirement, curriculum))
      edges.push({
        id: "milestone:" + m.id + source,
        source,
        target: "milestone:" + m.id,
        style: { stroke: "#70802b", strokeDasharray: "2 4" },
      });
  return (
    <div className="degree-graph">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        minZoom={0.15}
        maxZoom={2}
        nodesDraggable={false}
        nodesConnectable={false}
        onNodeClick={(_, node) => {
          if (!node.id.startsWith("milestone:")) select(node.id);
        }}
        onNodeDoubleClick={(_, node) => {
          if (!node.id.startsWith("milestone:")) select(node.id);
        }}
        aria-label={locale === "de" ? "Studienverlaufsgraph" : "Degree graph"}
      >
        <Background gap={20} />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}
