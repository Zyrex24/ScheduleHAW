"use client";

import React from "react";
import { motion } from "framer-motion";
import WeekTimeline from "./WeekTimeline";

const moduleColors = {
  database: { bg: "#00D9FF", text: "#000000" },
  digital: { bg: "#00D9FF", text: "#000000" },
  microcontroller: { bg: "#7209B7", text: "#FFFFFF" },
  signals: { bg: "#7209B7", text: "#FFFFFF" },
  electronics: { bg: "#8AC926", text: "#000000" },
  electrical: { bg: "#8AC926", text: "#000000" },
  software: { bg: "#FF006E", text: "#FFFFFF" },
  math: { bg: "#FF006E", text: "#FFFFFF" },
  economics: { bg: "#FB5607", text: "#FFFFFF" },
  management: { bg: "#FB5607", text: "#FFFFFF" },
  intercultural: { bg: "#FFBE0B", text: "#000000" },
  default: { bg: "#FFBE0B", text: "#000000" }
};

export default function ScheduleBlock({ block, showWeekFilter }) {
  const getModuleColor = (moduleType) => {
    return moduleColors[moduleType] || moduleColors.default;
  };

  const colors = getModuleColor(block.module_type);

  return (
    <motion.div
      
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      
      className="relative h-full p-3"
      style={{
        backgroundColor: colors.bg,
        border: "4px solid #000000",
        boxShadow: "8px 8px 0px #000000",
        color: colors.text,
      }}
    >
      <div className="flex flex-col h-full">
        <div className="font-bold text-sm mb-1 uppercase tracking-tight">
          {block.code}
        </div>
        <div className="text-xs font-medium mb-2 line-clamp-2">
          {block.full_name}
        </div>
        <div className="text-xs mb-1">
          <span className="font-bold">📍</span> {block.location}
        </div>
        <div className="text-xs mb-1">
          <span className="font-bold">👤</span> {block.instructors}
        </div>
        {block.weeks && !showWeekFilter && (
          <div className="text-xs font-bold mb-2">
            Weeks: {block.weeks}
          </div>
        )}
        
        {!showWeekFilter && block.weeks_array && (
          <div className="mt-auto pt-2">
            <WeekTimeline weeks={block.weeks_array} />
          </div>
        )}
      </div>
    </motion.div>
  );
}