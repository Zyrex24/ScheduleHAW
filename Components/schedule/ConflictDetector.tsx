"use client";

import React from "react";
import { ScheduleBlockType } from "@/Entities/ScheduleBlock";
import { AlertTriangle } from "lucide-react";

interface ConflictDetectorProps {
  blocks: ScheduleBlockType[];
}

interface Conflict {
  day: string;
  time: string;
  blocks: ScheduleBlockType[];
  conflictWeeks: number[];
  conflictType: string;
}

export default function ConflictDetector({ blocks }: ConflictDetectorProps) {
  const detectConflicts = (): Conflict[] => {
    const conflicts: Conflict[] = [];
    
    // Group blocks by day and time
    const grouped: { [key: string]: ScheduleBlockType[] } = {};
    
    blocks.forEach(block => {
      const key = `${block.day}-${block.start_time}-${block.end_time}`;
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(block);
    });
    
    // Find conflicts
    Object.entries(grouped).forEach(([key, blockGroup]) => {
      if (blockGroup.length > 1) {
        const [day, startTime, endTime] = key.split('-');
        
        // Find overlapping weeks
        const allWeeks = blockGroup.map(b => b.weeks_array);
        const overlappingWeeks: number[] = [];
        
        // Find weeks that appear in multiple blocks
        const weekCounts: { [week: number]: number } = {};
        allWeeks.forEach(weeks => {
          weeks.forEach(week => {
            weekCounts[week] = (weekCounts[week] || 0) + 1;
          });
        });
        
        Object.entries(weekCounts).forEach(([week, count]) => {
          if (count > 1) {
            overlappingWeeks.push(parseInt(week));
          }
        });
        
        if (overlappingWeeks.length > 0) {
          // Determine conflict type
          const types = blockGroup.map(b => {
            const code = b.code.toLowerCase();
            if (code.includes('l/') || code.includes('lab')) return 'Lab';
            if (code.includes('e/') || code.includes('exercise')) return 'Exercise';
            return 'Lecture';
          });
          
          const uniqueTypes = [...new Set(types)];
          let conflictType = '';
          
          if (uniqueTypes.length === 1) {
            conflictType = `${uniqueTypes[0]} vs ${uniqueTypes[0]}`;
          } else {
            conflictType = types.join(' vs ');
          }
          
          conflicts.push({
            day,
            time: `${startTime} - ${endTime}`,
            blocks: blockGroup,
            conflictWeeks: overlappingWeeks.sort((a, b) => a - b),
            conflictType
          });
        }
      }
    });
    
    return conflicts;
  };
  
  const conflicts = detectConflicts();
  
  if (conflicts.length === 0) {
    return (
      <div 
        className="p-6 mt-6"
        style={{
          backgroundColor: "#8AC926",
          border: "4px solid #000000",
          boxShadow: "8px 8px 0px #000000",
        }}
      >
        <div className="flex items-center gap-3">
          <div className="text-3xl">✅</div>
          <div>
            <h3 className="text-xl font-black uppercase">No Schedule Conflicts</h3>
            <p className="text-sm font-bold">All selected courses are compatible!</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div 
      className="p-6 mt-6"
      style={{
        backgroundColor: "#FFFFFF",
        border: "4px solid #000000",
        boxShadow: "12px 12px 0px #000000",
      }}
    >
      <div className="flex items-center gap-3 mb-6">
        <AlertTriangle 
          className="w-8 h-8" 
          style={{ stroke: "#FB5607", fill: "#FFBE0B" }}
        />
        <h3 className="text-2xl font-black uppercase" style={{ color: "#FB5607" }}>
          ⚠️ Schedule Conflicts Detected: {conflicts.length}
        </h3>
      </div>
      
      <div className="space-y-4">
        {conflicts.map((conflict, idx) => (
          <div
            key={idx}
            className="p-4"
            style={{
              backgroundColor: "#FFE5E5",
              border: "3px solid #000000",
              boxShadow: "6px 6px 0px #000000",
            }}
          >
            {/* Conflict Header */}
            <div className="mb-3">
              <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span 
                    className="px-3 py-1 font-black text-sm"
                    style={{
                      backgroundColor: "#FB5607",
                      color: "#FFFFFF",
                      border: "2px solid #000000",
                    }}
                  >
                    {conflict.day}
                  </span>
                  <span className="font-bold text-lg">
                    {conflict.time}
                  </span>
                </div>
                <span 
                  className="px-3 py-1 font-bold text-xs"
                  style={{
                    backgroundColor: "#FFBE0B",
                    border: "2px solid #000000",
                  }}
                >
                  {conflict.conflictType}
                </span>
              </div>
              
              {/* Conflicting Weeks */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-sm">Conflicts in weeks:</span>
                {conflict.conflictWeeks.map(week => (
                  <span
                    key={week}
                    className="px-2 py-0.5 font-bold text-xs"
                    style={{
                      backgroundColor: "#FF006E",
                      color: "#FFFFFF",
                      border: "2px solid #000000",
                    }}
                  >
                    {week}
                  </span>
                ))}
              </div>
            </div>
            
            {/* Conflicting Courses */}
            <div className="space-y-2">
              {conflict.blocks.map((block, blockIdx) => (
                <div
                  key={blockIdx}
                  className="p-3 flex items-start justify-between gap-3"
                  style={{
                    backgroundColor: "#FFFFFF",
                    border: "2px solid #000000",
                  }}
                >
                  <div className="flex-1">
                    <div className="font-black text-sm mb-1">{block.code}</div>
                    <div className="text-xs font-medium mb-1">{block.full_name}</div>
                    <div className="text-xs">
                      <span className="font-bold">📍</span> {block.location} 
                      {' • '}
                      <span className="font-bold">👤</span> {block.instructors}
                    </div>
                  </div>
                  <div className="text-[10px] font-bold whitespace-nowrap">
                    Weeks: {block.weeks}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Recommendation */}
            <div 
              className="mt-3 p-2 text-xs font-bold"
              style={{
                backgroundColor: "#FFF3CD",
                border: "2px solid #000000",
              }}
            >
              💡 <strong>Recommendation:</strong> You need to choose only one of these courses or select a different lab/exercise group that doesn&apos;t conflict.
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

