"use client";

import React, { useState, useEffect } from "react";
import { ScheduleBlock as ScheduleBlockEntity } from "@/Entities/ScheduleBlock";
import ScheduleFilters from "../Components/schedule/ScheduleFilters";
import ScheduleGrid from "../Components/schedule/ScheduleGrid";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar } from "lucide-react";

export default function Schedule() {
    const [blocks, setBlocks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [semester, setSemester] = useState("ALL");
    const [selectedWeek, setSelectedWeek] = useState(null);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [selectedInstructor, setSelectedInstructor] = useState(null);
    const [selectedCourses, setSelectedCourses] = useState([]);

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
        if (semester !== "ALL" && block.semester !== semester) return false;

        if (selectedWeek && !block.weeks_array?.includes(parseInt(selectedWeek))) {
            return false;
        }

        if (selectedGroup && block.group !== selectedGroup) {
            return false;
        }

        if (selectedInstructor && !block.instructors?.toLowerCase().includes(selectedInstructor.toLowerCase())) {
            return false;
        }

        // Course filter - extract base course code (without group)
        if (selectedCourses.length > 0) {
            const baseCourse = block.code.split('/')[0];
            if (!selectedCourses.includes(baseCourse)) {
                return false;
            }
        }

        return true;
    });

    const allGroups = [...new Set(blocks.filter((b) => b.group).map((b) => b.group))].sort();
    const allInstructors = [...new Set(
        blocks.
            map((b) => b.instructors?.split(",").map((i) => i.trim())).
            flat().
            filter(Boolean)
    )].sort();

    // Get unique base course codes (without group numbers)
    const allCourses = [...new Set(blocks.map((b) => b.code.split('/')[0]))].sort();

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
                            groups={allGroups}
                            selectedGroup={selectedGroup}
                            setSelectedGroup={setSelectedGroup}
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
                                        className="inline-block p-8 font-black text-2xl uppercase"
                                        style={{
                                            backgroundColor: "#FFBE0B",
                                            border: "4px solid #000000",
                                            boxShadow: "8px 8px 0px #000000"
                                        }}>

                                        {(selectedWeek === "52" || selectedWeek === "1") 
                                            ? "🎄 Christmas Break 🎄" 
                                            : "No classes match your filters"}
                                    </div>
                                </div> :
                                
                                <>
                                    {/* Christmas Break Notice */}
                                    {(selectedWeek === "52" || selectedWeek === "1" || !selectedWeek) && (
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
                                    
                                    <ScheduleGrid blocks={filteredBlocks} showWeekFilter={!!selectedWeek} />
                                </>
                            }
                        </div>
                    </>
                }
            </div>
        </div>);

}