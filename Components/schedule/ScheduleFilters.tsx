"use client";

import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { X, Download, Calendar } from "lucide-react";
import { downloadICS } from "@/lib/icsGenerator";
import { ScheduleBlockType } from "@/Entities/ScheduleBlock";

export default function ScheduleFilters({ 
  semester, 
  setSemester, 
  selectedWeek, 
  setSelectedWeek,
  groups,
  selectedGroup,
  setSelectedGroup,
  instructors,
  selectedInstructor,
  setSelectedInstructor,
  allCourses,
  selectedCourses,
  setSelectedCourses,
  filteredBlocks
}: {
  semester: string;
  setSemester: (value: string) => void;
  selectedWeek: string | null;
  setSelectedWeek: (value: string | null) => void;
  groups: string[];
  selectedGroup: string | null;
  setSelectedGroup: (value: string | null) => void;
  instructors: string[];
  selectedInstructor: string | null;
  setSelectedInstructor: (value: string | null) => void;
  allCourses: string[];
  selectedCourses: string[];
  setSelectedCourses: (value: string[]) => void;
  filteredBlocks: ScheduleBlockType[];
}) {
  // Semester weeks: 41-52 (fall 2025) then 1-4 (winter 2026)
  const semesterWeeks = [
    ...Array.from({ length: 12 }, (_, i) => i + 41), // Weeks 41-52
    ...Array.from({ length: 4 }, (_, i) => i + 1)     // Weeks 1-4
  ];
  const currentWeek = 40;

  const toggleCourse = (courseCode: string) => {
    if (selectedCourses.includes(courseCode)) {
      setSelectedCourses(selectedCourses.filter(c => c !== courseCode));
    } else {
      setSelectedCourses([...selectedCourses, courseCode]);
    }
  };

  const handleExportCalendar = () => {
    const filename = semester !== 'ALL' 
      ? `HAW_Schedule_${semester}.ics` 
      : 'HAW_Schedule.ics';
    downloadICS(filteredBlocks, filename);
  };

  return (
    <div 
      className="p-6 mb-6" 
      style={{
        backgroundColor: "#FFFFFF",
        border: "4px solid #000000",
        boxShadow: "12px 12px 0px #000000",
      }}
    >
      <h2 className="text-2xl font-black mb-6 uppercase" style={{ transform: "skew(-2deg)" }}>
        FILTERS
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block text-sm font-bold mb-2 uppercase">Semester</label>
          <Select value={semester} onValueChange={setSemester}>
            <SelectTrigger 
              className="w-full font-bold text-lg"
              style={{
                border: "4px solid #000000",
                boxShadow: "4px 4px 0px #000000",
                backgroundColor: "#00D9FF",
              }}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent style={{ border: "4px solid #000000" }}>
              <SelectItem value="ALL">All Semesters</SelectItem>
              <SelectItem value="IE1">IE1</SelectItem>
              <SelectItem value="IE2">IE2</SelectItem>
              <SelectItem value="IE3">IE3</SelectItem>
              <SelectItem value="IE4">IE4</SelectItem>
              <SelectItem value="IE5">IE5</SelectItem>
              <SelectItem value="IE6">IE6</SelectItem>
              <SelectItem value="IE7">IE7</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-bold mb-2 uppercase">Week</label>
          <Select value={selectedWeek || "all"} onValueChange={(val) => setSelectedWeek(val === "all" ? null : val)}>
            <SelectTrigger 
              className="w-full font-bold"
              style={{
                border: "4px solid #000000",
                boxShadow: "4px 4px 0px #000000",
                backgroundColor: "#FF006E",
                color: "#FFFFFF",
              }}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent style={{ border: "4px solid #000000" }}>
              <SelectItem value="all">All Weeks</SelectItem>
              <SelectItem value={currentWeek.toString()}>Current Week ({currentWeek})</SelectItem>
              {semesterWeeks.map(week => (
                <SelectItem key={week} value={week.toString()}>
                  Week {week}
                  {week === 52 && ' (Before Break)'}
                  {week === 1 && ' (After Break)'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-bold mb-2 uppercase">Group</label>
          <Select value={selectedGroup || "all"} onValueChange={(val) => setSelectedGroup(val === "all" ? null : val)}>
            <SelectTrigger 
              className="w-full font-bold"
              style={{
                border: "4px solid #000000",
                boxShadow: "4px 4px 0px #000000",
                backgroundColor: "#8AC926",
              }}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent style={{ border: "4px solid #000000" }}>
              <SelectItem value="all">All Groups</SelectItem>
              {groups.map(group => (
                <SelectItem key={group} value={group}>
                  Group {group}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-bold mb-2 uppercase">Instructor</label>
          <Select value={selectedInstructor || "all"} onValueChange={(val) => setSelectedInstructor(val === "all" ? null : val)}>
            <SelectTrigger 
              className="w-full font-bold"
              style={{
                border: "4px solid #000000",
                boxShadow: "4px 4px 0px #000000",
                backgroundColor: "#7209B7",
                color: "#FFFFFF",
              }}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent style={{ border: "4px solid #000000" }}>
              <SelectItem value="all">All Instructors</SelectItem>
              {instructors.map(instructor => (
                <SelectItem key={instructor} value={instructor}>
                  {instructor}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Course Selection */}
      <div 
        className="p-4 mt-6"
        style={{
          backgroundColor: "#FFBE0B",
          border: "3px solid #000000",
          boxShadow: "6px 6px 0px #000000",
        }}
      >
        <h3 className="text-lg font-black mb-3 uppercase">My Courses</h3>
        <p className="text-xs font-bold mb-4">Select courses you're enrolled in to create your personalized schedule</p>
        
        {selectedCourses.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedCourses.map(course => (
              <div
                key={course}
                className="px-3 py-1 font-bold text-sm flex items-center gap-2"
                style={{
                  backgroundColor: "#000000",
                  color: "#FFBE0B",
                  border: "2px solid #000000",
                }}
              >
                {course}
                <button onClick={() => toggleCourse(course)}>
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {allCourses.map(course => (
            <label
              key={course}
              className="flex items-center gap-2 p-2 cursor-pointer font-bold text-sm hover:bg-black hover:text-white transition-colors"
              style={{ border: "2px solid #000000" }}
            >
              <Checkbox
                checked={selectedCourses.includes(course)}
                onCheckedChange={() => toggleCourse(course)}
                style={{ border: "2px solid #000000" }}
              />
              {course}
            </label>
          ))}
        </div>
      </div>

      <div className="flex gap-4 mt-4 flex-wrap">
        {(selectedWeek || selectedGroup || selectedInstructor) && (
          <Button
            onClick={() => {
              setSelectedWeek(null);
              setSelectedGroup(null);
              setSelectedInstructor(null);
            }}
            className="font-bold uppercase"
            style={{
              border: "4px solid #000000",
              boxShadow: "4px 4px 0px #000000",
              backgroundColor: "#FB5607",
              color: "#FFFFFF",
            }}
          >
            <X className="w-4 h-4 mr-2" />
            Clear Filters
          </Button>
        )}
        
        <Button
          onClick={handleExportCalendar}
          className="font-bold uppercase"
          style={{
            border: "4px solid #000000",
            boxShadow: "4px 4px 0px #000000",
            backgroundColor: "#7209B7",
            color: "#FFFFFF",
          }}
          disabled={filteredBlocks.length === 0}
        >
          <Calendar className="w-4 h-4 mr-2" />
          Export to Calendar
        </Button>
      </div>
    </div>
  );
}