"use client";

import React from "react";
import ScheduleBlock from "./ScheduleBlock";
import { ScheduleBlockType } from "@/Entities/ScheduleBlock";

const timeSlots = [
  "08:00-08:10",
  "08:10-09:40",
  "09:40-09:55",
  "09:55-11:25",
  "11:25-12:10",
  "12:10-13:40",
  "13:40-14:10",
  "14:10-15:40",
  "15:40-15:55",
  "15:55-17:25",
  "17:25-17:40",
  "17:40-18:00",
  "18:00-19:10"
];

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

interface ScheduleGridProps {
  blocks: ScheduleBlockType[];
  showWeekFilter: boolean;
}

export default function ScheduleGrid({ blocks, showWeekFilter }: ScheduleGridProps) {
  const getBlockPosition = (block: ScheduleBlockType) => {
    const startIndex = timeSlots.findIndex(slot => slot.startsWith(block.start_time));
    const endIndex = timeSlots.findIndex(slot => slot.includes(block.end_time)) + 1;
    return { start: startIndex, span: endIndex - startIndex };
  };

  // Get all blocks that START at a specific time slot for a specific day
  const getBlocksStartingAt = (day: string, timeIndex: number): ScheduleBlockType[] => {
    return blocks.filter(block => {
      const pos = getBlockPosition(block);
      return block.day === day && timeIndex === pos.start;
    });
  };

  // Check if a cell is occupied by a block that started earlier
  const isOccupiedByPreviousBlock = (day: string, timeIndex: number): boolean => {
    return blocks.some(block => {
      const pos = getBlockPosition(block);
      return block.day === day && timeIndex > pos.start && timeIndex < pos.start + pos.span;
    });
  };

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[1200px]">
        <div className="grid grid-cols-[100px_repeat(6,1fr)] gap-0">
          {/* Header */}
          <div 
            className="p-3 font-black text-center border-4 border-black"
            style={{ backgroundColor: "#000000", color: "#00D9FF" }}
          >
            TIME
          </div>
          {days.map((day, idx) => (
            <div 
              key={day}
              className="p-3 font-black text-center border-4 border-black uppercase"
              style={{ 
                backgroundColor: ["#FF006E", "#00D9FF", "#8AC926", "#7209B7", "#FB5607", "#FFBE0B"][idx],
                color: [1, 2, 5].includes(idx) ? "#000000" : "#FFFFFF",
                transform: `skew(${[-1, 1, -1, 1, -1, 1][idx]}deg)`
              }}
            >
              {day}
            </div>
          ))}

          {/* Time slots and blocks */}
          {timeSlots.map((slot, timeIndex) => {
            const isBreak = slot.includes("08:00") || slot.includes("09:40") || slot.includes("11:25") || 
                           slot.includes("13:40") || slot.includes("15:40") || slot.includes("17:25") || slot.includes("17:40");
            
            return (
              <React.Fragment key={slot}>
                {/* Time column - always rendered */}
                <div 
                  className={`p-2 text-xs font-bold border-2 border-black flex items-center justify-center ${
                    isBreak ? 'bg-gray-200' : 'bg-white'
                  }`}
                  style={{ 
                    minHeight: isBreak ? "30px" : "80px",
                    borderWidth: isBreak ? "2px" : "4px"
                  }}
                >
                  {slot}
                </div>
                
                {/* Day cells */}
                {days.map(day => {
                  const startingBlocks = getBlocksStartingAt(day, timeIndex);
                  const isOccupied = isOccupiedByPreviousBlock(day, timeIndex);

                  // If blocks start at this time slot, render them
                  if (startingBlocks.length > 0) {
                    const maxSpan = Math.max(...startingBlocks.map(b => getBlockPosition(b).span));
                    const blockCount = startingBlocks.length;
                    
                    return (
                      <div
                        key={`${day}-${timeIndex}`}
                        className="border-4 border-black relative"
                        style={{
                          gridRow: `span ${maxSpan}`,
                          minHeight: `${maxSpan * 80}px`,
                          display: 'flex',
                          gap: '0',
                        }}
                      >
                        {startingBlocks.map((block, idx) => (
                          <div
                            key={`${block.code}-${block.start_time}-${idx}`}
                            style={{
                              flex: 1,
                              minWidth: 0, // Allow flex items to shrink below content size
                              borderRight: idx < blockCount - 1 ? '2px solid #000' : 'none',
                            }}
                          >
                            <ScheduleBlock 
                              block={block} 
                              showWeekFilter={showWeekFilter}
                              isCompact={blockCount > 1}
                            />
                          </div>
                        ))}
                      </div>
                    );
                  }
                  // If occupied by a previous block, don't render anything (the previous cell spans over this)
                  else if (isOccupied) {
                    return null;
                  }
                  // Empty cell
                  else {
                    return (
                      <div
                        key={`${day}-${timeIndex}`}
                        className={`border-2 border-black ${isBreak ? 'bg-gray-100' : 'bg-white'}`}
                        style={{ 
                          minHeight: isBreak ? "30px" : "80px",
                          borderWidth: isBreak ? "2px" : "4px"
                        }}
                      />
                    );
                  }
                })}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}