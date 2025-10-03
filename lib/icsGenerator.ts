import { ScheduleBlockType } from "@/Entities/ScheduleBlock";

// Helper function to convert week number to actual date in 2025/2026
function getDateFromWeek(weekNumber: number, dayName: string, year: number = 2025): Date {
  // Week 41-52 are in 2024, weeks 1-4 are in 2025
  const actualYear = weekNumber >= 41 ? 2024 : 2025;
  
  // Create a date for week 1 of the year
  const jan1 = new Date(actualYear, 0, 1);
  const daysOffset = (jan1.getDay() <= 4) ? 1 - jan1.getDay() : 8 - jan1.getDay();
  const firstMonday = new Date(actualYear, 0, 1 + daysOffset);
  
  // Calculate the date for the given week
  const targetDate = new Date(firstMonday);
  targetDate.setDate(firstMonday.getDate() + (weekNumber - 1) * 7);
  
  // Adjust for the specific day of week
  const dayMap: { [key: string]: number } = {
    'Monday': 0,
    'Tuesday': 1,
    'Wednesday': 2,
    'Thursday': 3,
    'Friday': 4,
    'Saturday': 5,
    'Sunday': 6
  };
  
  const dayOffset = dayMap[dayName] || 0;
  targetDate.setDate(targetDate.getDate() + dayOffset);
  
  return targetDate;
}

// Helper to format date for ICS (YYYYMMDDTHHMMSS)
function formatICSDate(date: Date, time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const eventDate = new Date(date);
  eventDate.setHours(hours, minutes, 0, 0);
  
  const year = eventDate.getFullYear();
  const month = String(eventDate.getMonth() + 1).padStart(2, '0');
  const day = String(eventDate.getDate()).padStart(2, '0');
  const hour = String(eventDate.getHours()).padStart(2, '0');
  const minute = String(eventDate.getMinutes()).padStart(2, '0');
  
  return `${year}${month}${day}T${hour}${minute}00`;
}

// Helper to generate a unique ID for the event
function generateUID(block: ScheduleBlockType, weekNum: number): string {
  return `${block.code}-${block.day}-${weekNum}-${block.start_time}@haw-schedule.local`;
}

// Escape special characters for ICS format
function escapeICSText(text: string): string {
  return text.replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

export function generateICS(blocks: ScheduleBlockType[]): string {
  const icsLines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//HAW Hamburg//Schedule//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:HAW Schedule',
    'X-WR-TIMEZONE:Europe/Berlin',
    'X-WR-CALDESC:HAW Hamburg Course Schedule'
  ];
  
  // Generate events for each block and each week it occurs
  blocks.forEach(block => {
    // For each week the block occurs
    block.weeks_array.forEach(weekNum => {
      const eventDate = getDateFromWeek(weekNum, block.day);
      const dtStart = formatICSDate(eventDate, block.start_time);
      const dtEnd = formatICSDate(eventDate, block.end_time);
      
      // Create the event
      icsLines.push('BEGIN:VEVENT');
      icsLines.push(`UID:${generateUID(block, weekNum)}`);
      icsLines.push(`DTSTART:${dtStart}`);
      icsLines.push(`DTEND:${dtEnd}`);
      icsLines.push(`SUMMARY:${escapeICSText(block.code + ' - ' + block.full_name)}`);
      icsLines.push(`LOCATION:${escapeICSText(block.location)}`);
      
      // Add description with instructor and group info
      let description = `Instructor: ${escapeICSText(block.instructors)}`;
      if (block.group) {
        description += `\\nGroup: ${block.group}`;
      }
      description += `\\nWeek: ${weekNum}`;
      icsLines.push(`DESCRIPTION:${description}`);
      
      // Add categories based on module type
      const categoryMap: { [key: string]: string } = {
        'database': 'Database',
        'digital': 'Digital Systems',
        'microcontroller': 'Microcontroller',
        'signals': 'Signals & Systems',
        'electronics': 'Electronics',
        'software': 'Software',
        'math': 'Mathematics',
        'economics': 'Economics',
        'intercultural': 'General Studies'
      };
      const category = categoryMap[block.module_type] || 'Course';
      icsLines.push(`CATEGORIES:${category}`);
      
      // Add alarm (15 minutes before)
      icsLines.push('BEGIN:VALARM');
      icsLines.push('TRIGGER:-PT15M');
      icsLines.push('ACTION:DISPLAY');
      icsLines.push(`DESCRIPTION:Reminder: ${escapeICSText(block.code)}`);
      icsLines.push('END:VALARM');
      
      icsLines.push('END:VEVENT');
    });
  });
  
  icsLines.push('END:VCALENDAR');
  
  return icsLines.join('\r\n');
}

export function downloadICS(blocks: ScheduleBlockType[], filename: string = 'HAW_Schedule.ics'): void {
  const icsContent = generateICS(blocks);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

