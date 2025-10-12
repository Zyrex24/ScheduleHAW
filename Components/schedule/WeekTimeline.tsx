"use client";

import React from "react";

export default function WeekTimeline({ weeks }: { weeks: number[] }) {
  // Semester weeks: 41-52 (fall 2024) + 1-4 (winter/spring 2025)
  const allWeeks = Array.from(Array(12).keys()).map(i => i + 41).concat([1, 2, 3, 4]);

  return (
    <div className="flex gap-[2px] h-2">
      {allWeeks.map((week) => {
        const isActive = weeks.includes(week);
        return (
          <div
            key={week}
            className="flex-1 border border-black"
            style={{
              backgroundColor: isActive ? "#8AC926" : "#000000",
            }}
            title={`Week ${week}${isActive ? " (active)" : ""}`}
          />
        );
      })}
    </div>
  );
}