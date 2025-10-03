"use client";

import React from "react";
import ScheduleBlock from "./ScheduleBlock";

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

export default function ScheduleGrid({ blocks, showWeekFilter }) {
  const getBlockPosition = (block) => {
    const startIndex = timeSlots.findIndex(slot => slot.startsWith(block.start_time));
    const endIndex = timeSlots.findIndex(slot => slot.includes(block.end_time)) + 1;
    return { start: startIndex, span: endIndex - startIndex };
  };

  const getBlocksForDayAndTime = (day, timeIndex) => {
    return blocks.filter(block => {
      const pos = getBlockPosition(block);
      return block.day === day && timeIndex >= pos.start && timeIndex < pos.start + pos.span;
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
                
                {days.map(day => {
                  const dayBlocks = getBlocksForDayAndTime(day, timeIndex);
                  const firstBlock = dayBlocks.find(b => {
                    const pos = getBlockPosition(b);
                    return timeIndex === pos.start;
                  });

                  if (firstBlock) {
                    const pos = getBlockPosition(firstBlock);
                    return (
                      <div
                        key={`${day}-${timeIndex}`}
                        className="border-4 border-black relative"
                        style={{
                          gridRow: `span ${pos.span}`,
                          minHeight: `${pos.span * 80}px`
                        }}
                      >
                        <ScheduleBlock block={firstBlock} showWeekFilter={showWeekFilter} />
                      </div>
                    );
                  } else if (dayBlocks.length === 0) {
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
                  return null;
                })}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}