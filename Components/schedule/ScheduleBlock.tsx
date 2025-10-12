"use client";

import React from "react";
import { motion } from "framer-motion";
import WeekTimeline from "./WeekTimeline";
import { ScheduleBlockType } from "@/Entities/ScheduleBlock";

const moduleColors: { [key: string]: { bg: string; text: string } } = {
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

interface ScheduleBlockProps {
  block: ScheduleBlockType;
  showWeekFilter: boolean;
  isCompact?: boolean;
}

export default function ScheduleBlock({ block, showWeekFilter, isCompact = false }: ScheduleBlockProps) {
  const getModuleColor = (moduleType: string) => {
    return moduleColors[moduleType] || moduleColors.default;
  };

  const colors = getModuleColor(block.module_type);

  return (
    <motion.div
      
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      
      className={`relative h-full ${isCompact ? 'p-2' : 'p-3'}`}
      style={{
        backgroundColor: colors.bg,
        border: isCompact ? "3px solid #000000" : "4px solid #000000",
        boxShadow: isCompact ? "4px 4px 0px #000000" : "8px 8px 0px #000000",
        color: colors.text,
      }}
    >
      <div className="flex flex-col h-full">
        <div className={`font-bold ${isCompact ? 'text-xs' : 'text-sm'} mb-1 uppercase tracking-tight`}>
          {block.code}
        </div>
        <div className={`${isCompact ? 'text-[10px]' : 'text-xs'} font-medium mb-1 ${isCompact ? 'line-clamp-1' : 'line-clamp-2'}`}>
          {block.full_name}
        </div>
        <div className={`${isCompact ? 'text-[9px]' : 'text-xs'} mb-1 truncate`}>
          <span className="font-bold">📍</span> {block.location}
        </div>
        {!isCompact && (
          <div className="text-xs mb-1 truncate">
            <span className="font-bold">👤</span> {block.instructors}
          </div>
        )}
        {block.weeks && !showWeekFilter && !isCompact && (
          <div className="text-xs font-bold mb-2">
            Weeks: {block.weeks}
          </div>
        )}
        
        {!showWeekFilter && block.weeks_array && !isCompact && (
          <div className="mt-auto pt-2">
            <WeekTimeline weeks={block.weeks_array} />
          </div>
        )}
        
        {/* Compact mode: show time range */}
        {isCompact && (
          <div className="text-[9px] font-bold mt-auto">
            {block.start_time}-{block.end_time}
          </div>
        )}
      </div>
    </motion.div>
  );
}