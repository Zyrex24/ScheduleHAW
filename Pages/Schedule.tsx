"use client";

import React, { useState, useEffect } from "react";
import { ScheduleBlock as ScheduleBlockEntity, ScheduleBlockType } from "@/Entities/ScheduleBlock";
import ScheduleFilters from "../Components/schedule/ScheduleFilters";
import ScheduleGrid from "../Components/schedule/ScheduleGrid";
import ConflictDetector from "../Components/schedule/ConflictDetector";
import { Skeleton } from "@/Components/ui/skeleton";
import { Calendar } from "lucide-react";

export default function Schedule() {
    const [blocks, setBlocks] = useState<ScheduleBlockType[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [semester, setSemester] = useState<string>("ALL");
    const [selectedWeek, setSelectedWeek] = useState<string>("41"); // Default to week 41
    const [selectedInstructor, setSelectedInstructor] = useState<string | null>(null);
    const [selectedCourses, setSelectedCourses] = useState<string[]>([]);

    useEffect(() => {
        loadSchedule();
    }, []);

    const loadSchedule = async () => {
        setLoading(true);
        const data = await ScheduleBlockEntity.list();
        setBlocks(data);
        setLoading(false);
    };

    const filteredBlocks = blocks.filter((block) => {
        // MUST select courses from "My Courses" - show nothing if none selected
        if (selectedCourses.length === 0) {
            return false;
        }

        // Only show courses that are explicitly selected
        if (!selectedCourses.includes(block.code)) {
            return false;
        }

        if (semester !== "ALL" && block.semester !== semester) return false;

        // Always filter by selected week (no "All Weeks" option anymore)
        if (!block.weeks_array?.includes(parseInt(selectedWeek))) {
            return false;
        }

        if (selectedInstructor && !block.instructors?.toLowerCase().includes(selectedInstructor.toLowerCase())) {
            return false;
        }

        return true;
    });

    const instructorSet = new Set<string>();
    blocks.forEach((b) => {
        b.instructors?.split(",").forEach((i: string) => {
            const trimmed = i.trim();
            if (trimmed) instructorSet.add(trimmed);
        });
    });
    const allInstructors = Array.from(instructorSet).sort();

    // Get unique full course codes (including groups) and sort by semester
    const courseSet = new Set<string>();
    blocks.forEach((b) => courseSet.add(b.code));
    const allCourses = Array.from(courseSet).sort((a, b) => {
        // Extract semester number and base code from course codes
        const getSemester = (code: string): number => {
            const match = code.match(/^(?:IE|E)(\d+)/);
            return match ? parseInt(match[1]) : 999;
        };
        
        const semesterA = getSemester(a);
        const semesterB = getSemester(b);
        
        // First sort by semester number
        if (semesterA !== semesterB) {
            return semesterA - semesterB;
        }
        
        // Within same semester, put IE courses before E courses
        const isIE_A = a.startsWith('IE');
        const isIE_B = b.startsWith('IE');
        
        if (isIE_A && !isIE_B) return -1;
        if (!isIE_A && isIE_B) return 1;
        
        // Finally, sort alphabetically
        return a.localeCompare(b);
    });

    return (
        <div className="min-h-screen p-4 md:p-8" style={{ backgroundColor: "#F5F5F5" }}>
            <div className="max-w-[1600px] mx-auto">
                {/* Header */}
                <div
                    className="mb-8 p-8"
                    style={{
                        backgroundColor: "#000000",
                        border: "6px solid #000000",
                        boxShadow: "16px 16px 0px #FF006E"
                    }}>

                    <div className="flex items-center gap-4 mb-2">
                        <Calendar
                            className="w-12 h-12"
                            style={{ color: "#00D9FF" }}
                            strokeWidth={3} />

                        <h1
                            className="text-5xl md:text-6xl font-black uppercase"
                            style={{
                                color: "#00D9FF",
                                textShadow: "4px 4px 0px #FF006E",
                                letterSpacing: "-2px"
                            }}>

                            SCHEDULE
                        </h1>
                    </div>
                    <p className="text-xl font-bold uppercase" style={{ color: "#8AC926" }}>WINTER SEMESTER 2025/26</p>
                    <p className="text-sm font-bold mt-2" style={{ color: "#FFBE0B" }}>
                        Weeks 41-52 (2025) • 🎄 Christmas Break • Weeks 1-4 (2026)
                    </p>
                </div>

                {loading ?
                    <div className="space-y-6">
                        <Skeleton className="h-32 w-full" />
                        <Skeleton className="h-96 w-full" />
                    </div> :

                    <>
                        <ScheduleFilters
                            semester={semester}
                            setSemester={setSemester}
                            selectedWeek={selectedWeek}
                            setSelectedWeek={setSelectedWeek}
                            instructors={allInstructors}
                            selectedInstructor={selectedInstructor}
                            setSelectedInstructor={setSelectedInstructor}
                            allCourses={allCourses}
                            selectedCourses={selectedCourses}
                            setSelectedCourses={setSelectedCourses}
                            filteredBlocks={filteredBlocks} />


                        <div
                            className="p-6"
                            style={{
                                backgroundColor: "#FFFFFF",
                                border: "4px solid #000000",
                                boxShadow: "12px 12px 0px #000000"
                            }}>

                            {filteredBlocks.length === 0 ?
                                <div className="text-center py-20">
                                    <div
                                        className="inline-block p-8"
                                        style={{
                                            backgroundColor: "#FFBE0B",
                                            border: "4px solid #000000",
                                            boxShadow: "8px 8px 0px #000000"
                                        }}>
                                        {selectedCourses.length === 0 ? (
                                            <>
                                                <div className="font-black text-2xl uppercase mb-3">
                                                    📚 Select Your Courses
                                                </div>
                                                <div className="font-bold text-lg">
                                                    Choose courses from &quot;My Courses&quot; section above to view your schedule
                                                </div>
                                            </>
                                        ) : (selectedWeek === "52" || selectedWeek === "1") ? (
                                            <div className="font-black text-2xl uppercase">
                                                🎄 Christmas Break 🎄
                                            </div>
                                        ) : (
                                            <div className="font-black text-2xl uppercase">
                                                No classes match your filters
                                            </div>
                                        )}
                                    </div>
                                </div> :
                                
                                <>
                                    {/* Christmas Break Notice */}
                                    {(selectedWeek === "52" || selectedWeek === "1") && (
                                        <div 
                                            className="mb-6 p-4 text-center"
                                            style={{
                                                backgroundColor: "#FFBE0B",
                                                border: "4px solid #000000",
                                                boxShadow: "8px 8px 0px #000000"
                                            }}
                                        >
                                            <div className="text-2xl font-black uppercase mb-2">
                                                🎄 Christmas Break 🎄
                                            </div>
                                            <div className="font-bold">
                                                December 23, 2025 - January 6, 2026
                                            </div>
                                            <div className="text-sm mt-1">
                                                No classes scheduled during this period
                                            </div>
                                        </div>
                                    )}
                                    
                                    <ScheduleGrid blocks={filteredBlocks} showWeekFilter={true} />
                                </>
                            }
                        </div>

                        {/* Conflict Detector - Show only when user has selected courses */}
                        {selectedCourses.length > 0 && filteredBlocks.length > 0 && (
                            <ConflictDetector blocks={filteredBlocks} />
                        )}
                    </>
                }
            </div>
        </div>);

}