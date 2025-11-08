export interface ScheduleBlockType {
  semester: string;
  day: string;
  start_time: string;
  end_time: string;
  code: string;
  full_name: string;
  location: string;
  instructors: string;
  weeks: string;
  weeks_array: number[];
  module_type: string;
  group?: string;
}

// Helper function to expand week ranges
function expandWeeks(weekStr: string): number[] {
  if (!weekStr) return [];
  const weeks: number[] = [];
  const parts = weekStr.split(',');
  
  for (const part of parts) {
    if (part.includes('-')) {
      const [start, end] = part.split('-').map(n => parseInt(n.trim()));
      for (let i = start; i <= end; i++) {
        weeks.push(i);
      }
    } else {
      weeks.push(parseInt(part.trim()));
    }
  }
  
  return Array.from(new Set(weeks)).sort((a, b) => a - b);
}

// Real schedule data - Updated from newschedule.md
const realSchedule: ScheduleBlockType[] = [
  
  // ============ IE1 - Semester 1 ============
  
  // IE1 - Mathematics 1 (MA1) - Lectures
  // weekly, Friday, 10/17/25 - 1/23/26 from 12:10 until 15:40
  { semester: 'IE1', day: 'Friday', start_time: '12:10', end_time: '15:40', code: 'IE1-MA1', full_name: 'Mathematics 1', location: 'BT7 12.60', instructors: 'Nieder', weeks: '42-51,2-3', weeks_array: expandWeeks('42-51,2-3'), module_type: 'math' },
  // fortnightly, Wednesday, 10/22/25 - 12/17/25 from 12:10 until 15:40
  { semester: 'IE1', day: 'Wednesday', start_time: '12:10', end_time: '15:40', code: 'IE1-MA1', full_name: 'Mathematics 1', location: 'BT5 1.13', instructors: 'Nieder', weeks: '43,45,47,49,51', weeks_array: expandWeeks('43,45,47,49,51'), module_type: 'math' },
  
  // IE1 - Mathematics 1 Exercises (MAE1)
  // fortnightly, Thursday, 10/23/25 - 1/15/26 from 08:10 until 09:40
  { semester: 'IE1', day: 'Thursday', start_time: '08:10', end_time: '09:40', code: 'IE1-MAE1/01', full_name: 'Mathematics 1 Exercises', location: 'BT7 10.65', instructors: 'Nieder', weeks: '43,45,47,49,51,3', weeks_array: expandWeeks('43,45,47,49,51,3'), module_type: 'math', group: '01' },
  // fortnightly, Thursday, 10/23/25 - 1/15/26 from 09:55 until 11:25
  { semester: 'IE1', day: 'Thursday', start_time: '09:55', end_time: '11:25', code: 'IE1-MAE1/02', full_name: 'Mathematics 1 Exercises', location: 'BT7 10.65', instructors: 'Nieder', weeks: '43,45,47,49,51,3', weeks_array: expandWeeks('43,45,47,49,51,3'), module_type: 'math', group: '02' },
  
  // IE1 - Electrical Engineering 1 (EE1) - Lecture
  // weekly, Friday, 10/17/25 - 1/23/26 from 08:10 until 11:25
  { semester: 'IE1', day: 'Friday', start_time: '08:10', end_time: '11:25', code: 'IE1-EE1', full_name: 'Electrical Engineering 1', location: 'BT5 1.13', instructors: 'Hansen', weeks: '42-51,2-3', weeks_array: expandWeeks('42-51,2-3'), module_type: 'electronics' },
  
  // IE1 - Electrical Engineering 1 Lab (EEL1)
  // Group 1: Monday, 10/27/25 from 14:10 to 15:40 + three weeks turn, Monday, 11/10/25 - 12/1/25 from 12:10 until 15:40 + Monday, 1/5/26 from 12:10 to 15:40
  { semester: 'IE1', day: 'Monday', start_time: '14:10', end_time: '15:40', code: 'IE1-EEL1/01', full_name: 'Electrical Engineering 1 Lab', location: 'BT7 5.01', instructors: 'Hansen, Wittmar', weeks: '44', weeks_array: expandWeeks('44'), module_type: 'electronics', group: '01' },
  { semester: 'IE1', day: 'Monday', start_time: '12:10', end_time: '15:40', code: 'IE1-EEL1/01', full_name: 'Electrical Engineering 1 Lab', location: 'BT7 5.01', instructors: 'Hansen, Wittmar', weeks: '46,49,2', weeks_array: expandWeeks('46,49,2'), module_type: 'electronics', group: '01' },
  // Group 2: Monday, 10/27/25 from 12:10 to 13:40 + three weeks turn, Monday, 11/17/25 - 12/8/25 from 12:10 until 15:40 + Monday, 1/12/26 from 12:10 to 15:40
  { semester: 'IE1', day: 'Monday', start_time: '12:10', end_time: '13:40', code: 'IE1-EEL1/02', full_name: 'Electrical Engineering 1 Lab', location: 'BT7 5.01', instructors: 'Hansen, Wittmar', weeks: '44', weeks_array: expandWeeks('44'), module_type: 'electronics', group: '02' },
  { semester: 'IE1', day: 'Monday', start_time: '12:10', end_time: '15:40', code: 'IE1-EEL1/02', full_name: 'Electrical Engineering 1 Lab', location: 'BT7 5.01', instructors: 'Hansen, Wittmar', weeks: '47,50,3', weeks_array: expandWeeks('47,50,3'), module_type: 'electronics', group: '02' },
  // Group 3: Monday, 11/3/25 from 12:10 to 13:40 + three weeks turn, Monday, 11/24/25 - 12/15/25 from 12:10 until 15:40 + Monday, 1/19/26 from 12:10 to 15:40
  { semester: 'IE1', day: 'Monday', start_time: '12:10', end_time: '13:40', code: 'IE1-EEL1/03', full_name: 'Electrical Engineering 1 Lab', location: 'BT7 5.01', instructors: 'Hansen, Wittmar', weeks: '45', weeks_array: expandWeeks('45'), module_type: 'electronics', group: '03' },
  { semester: 'IE1', day: 'Monday', start_time: '12:10', end_time: '15:40', code: 'IE1-EEL1/03', full_name: 'Electrical Engineering 1 Lab', location: 'BT7 5.01', instructors: 'Hansen, Wittmar', weeks: '48,51,4', weeks_array: expandWeeks('48,51,4'), module_type: 'electronics', group: '03' },
  
  // IE1 - Software Construction 1 (SO1) - Lecture
  // weekly, Wednesday, 10/15/25 - 1/21/26 from 15:55 until 19:10
  { semester: 'IE1', day: 'Wednesday', start_time: '15:55', end_time: '19:10', code: 'IE1-SO1', full_name: 'Software Construction 1', location: 'BT5 1.13', instructors: 'Hensel', weeks: '42-51,2-3', weeks_array: expandWeeks('42-51,2-3'), module_type: 'software' },
  
  // IE1 - Software Construction 1 Lab (SOL1)
  // Group 1: fortnightly, Monday, 11/3/25 - 1/12/26 from 15:55 until 19:10 (weeks 45,47,49,51,3)
  { semester: 'IE1', day: 'Monday', start_time: '15:55', end_time: '19:10', code: 'IE1-SOL1/01', full_name: 'Software Construction 1 Lab', location: 'BT7 13.65', instructors: 'Hensel', weeks: '45,47,49,51,3', weeks_array: expandWeeks('45,47,49,51,3'), module_type: 'software', group: '01' },
  // Group 2: fortnightly, Monday, 11/10/25 - 1/19/26 from 15:55 until 19:10 (weeks 46,48,50,2,4)
  { semester: 'IE1', day: 'Monday', start_time: '15:55', end_time: '19:10', code: 'IE1-SOL1/02', full_name: 'Software Construction 1 Lab', location: 'BT7 13.65', instructors: 'Hensel', weeks: '46,48,50,2,4', weeks_array: expandWeeks('46,48,50,2,4'), module_type: 'software', group: '02' },
  // Group 3: fortnightly, Monday, 11/3/25 - 1/12/26 from 15:55 until 19:10
  { semester: 'IE1', day: 'Monday', start_time: '15:55', end_time: '19:10', code: 'IE1-SOL1/03', full_name: 'Software Construction 1 Lab', location: 'BT7 13.60', instructors: 'Schüthe, Orychshenko', weeks: '45,47,49,51,3', weeks_array: expandWeeks('45,47,49,51,3'), module_type: 'software', group: '03' },
  // Group 4: fortnightly, Monday, 11/10/25 - 1/19/26 from 15:55 until 19:10
  { semester: 'IE1', day: 'Monday', start_time: '15:55', end_time: '19:10', code: 'IE1-SOL1/04', full_name: 'Software Construction 1 Lab', location: 'BT7 13.60', instructors: 'Schüthe, Orychshenko', weeks: '46,48,50,2,4', weeks_array: expandWeeks('46,48,50,2,4'), module_type: 'software', group: '04' },
  
  // IE1 - German (GE)
  // weekly, Thursday, 10/16/25 - 1/22/26 from 09:55 until 11:25
  { semester: 'IE1', day: 'Thursday', start_time: '09:55', end_time: '11:25', code: 'IE1-GE/01', full_name: 'German', location: 'BT7 14.65', instructors: 'Appel', weeks: '42-51,2-3', weeks_array: expandWeeks('42-51,2-3'), module_type: 'intercultural', group: '01' },
  // weekly, Thursday, 10/16/25 - 1/22/26 from 12:10 until 13:40
  { semester: 'IE1', day: 'Thursday', start_time: '12:10', end_time: '13:40', code: 'IE1-GE/02', full_name: 'German', location: 'BT7 12.81', instructors: 'Appel', weeks: '42-51,2-3', weeks_array: expandWeeks('42-51,2-3'), module_type: 'intercultural', group: '02' },
  
  // IE1 - Learning and Study Methods Exercises (LSE1)
  // Group 1: Tuesday, 10/14/25 from 08:10 to 11:25 + fortnightly, Tuesday, 10/21/25 - 1/13/26 from 12:10 until 15:40
  { semester: 'IE1', day: 'Tuesday', start_time: '08:10', end_time: '11:25', code: 'IE1-LSE/01', full_name: 'Learning and Study Methods Exercises', location: 'BT7 14.86', instructors: 'McCabe', weeks: '42', weeks_array: expandWeeks('42'), module_type: 'intercultural', group: '01' },
  { semester: 'IE1', day: 'Tuesday', start_time: '12:10', end_time: '15:40', code: 'IE1-LSE/01', full_name: 'Learning and Study Methods Exercises', location: 'BT7 14.65', instructors: 'McCabe', weeks: '43,45,47,49,51,3', weeks_array: expandWeeks('43,45,47,49,51,3'), module_type: 'intercultural', group: '01' },
  // Group 2: fortnightly, Tuesday, 10/14/25 - 1/20/26 from 12:10 until 15:40
  { semester: 'IE1', day: 'Tuesday', start_time: '12:10', end_time: '15:40', code: 'IE1-LSE/02', full_name: 'Learning and Study Methods Exercises', location: 'BT7 14.65', instructors: 'McCabe', weeks: '42,44,46,48,50,2,4', weeks_array: expandWeeks('42,44,46,48,50,2,4'), module_type: 'intercultural', group: '02' },
  
  // IE1 - Learning and Study Methods Lab (LSL1)
  // Group 1: Thursday, 10/23/25 from 15:55 to 19:10 + Thursday, 1/15/26 from 15:55 to 19:10
  { semester: 'IE1', day: 'Thursday', start_time: '15:55', end_time: '19:10', code: 'IE1-LSL/01', full_name: 'Learning and Study Methods Lab', location: 'BT7 12.60', instructors: 'Lapke, Leutelt, Radt', weeks: '43,3', weeks_array: expandWeeks('43,3'), module_type: 'intercultural', group: '01' },
  // Group 2: fortnightly, Thursday, 11/6/25 - 12/18/25 from 14:10 until 17:25
  { semester: 'IE1', day: 'Thursday', start_time: '14:10', end_time: '17:25', code: 'IE1-LSL/02', full_name: 'Learning and Study Methods Lab', location: 'BT7 8.61', instructors: 'Lapke', weeks: '45,47,49,51', weeks_array: expandWeeks('45,47,49,51'), module_type: 'intercultural', group: '02' },
  // Group 3: fortnightly, Monday, 11/3/25 - 12/15/25 from 08:10 until 11:25
  { semester: 'IE1', day: 'Monday', start_time: '08:10', end_time: '11:25', code: 'IE1-LSL/03', full_name: 'Learning and Study Methods Lab', location: 'Stift69 106', instructors: 'Leutelt', weeks: '45,47,49,51', weeks_array: expandWeeks('45,47,49,51'), module_type: 'intercultural', group: '03' },
  // Group 4: fortnightly, Tuesday, 11/4/25 - 12/16/25 from 08:10 until 11:25
  { semester: 'IE1', day: 'Tuesday', start_time: '08:10', end_time: '11:25', code: 'IE1-LSL/04', full_name: 'Learning and Study Methods Lab', location: 'BT7 14.86', instructors: 'Radt', weeks: '45,47,49,51', weeks_array: expandWeeks('45,47,49,51'), module_type: 'intercultural', group: '04' },
  
  // IE1 - Learning and Study Methods Intro Week (LSL2) - Oct 6-11 (Week 41)
  { semester: 'IE1', day: 'Monday', start_time: '08:10', end_time: '11:25', code: 'IE1-LSL2', full_name: 'Learning and Study Methods Intro Week', location: 'BT5 1.13', instructors: '', weeks: '41', weeks_array: expandWeeks('41'), module_type: 'intercultural' },
  { semester: 'IE1', day: 'Monday', start_time: '12:10', end_time: '18:00', code: 'IE1-LSL2', full_name: 'Learning and Study Methods Intro Week', location: 'BT7 8.85', instructors: '', weeks: '41', weeks_array: expandWeeks('41'), module_type: 'intercultural' },
  { semester: 'IE1', day: 'Tuesday', start_time: '08:10', end_time: '18:00', code: 'IE1-LSL2', full_name: 'Learning and Study Methods Intro Week', location: 'BT7 8.85', instructors: '', weeks: '41', weeks_array: expandWeeks('41'), module_type: 'intercultural' },
  { semester: 'IE1', day: 'Wednesday', start_time: '08:10', end_time: '18:00', code: 'IE1-LSL2', full_name: 'Learning and Study Methods Intro Week', location: 'BT7 8.85', instructors: '', weeks: '41', weeks_array: expandWeeks('41'), module_type: 'intercultural' },
  { semester: 'IE1', day: 'Thursday', start_time: '08:10', end_time: '18:00', code: 'IE1-LSL2', full_name: 'Learning and Study Methods Intro Week', location: 'BT7 8.85', instructors: '', weeks: '41', weeks_array: expandWeeks('41'), module_type: 'intercultural' },
  { semester: 'IE1', day: 'Friday', start_time: '08:10', end_time: '18:00', code: 'IE1-LSL2', full_name: 'Learning and Study Methods Intro Week', location: 'BT7 8.85', instructors: '', weeks: '41', weeks_array: expandWeeks('41'), module_type: 'intercultural' },
  { semester: 'IE1', day: 'Saturday', start_time: '08:00', end_time: '18:00', code: 'IE1-LSL2', full_name: 'Learning and Study Methods Intro Week', location: 'BT5 1.13', instructors: '', weeks: '41', weeks_array: expandWeeks('41'), module_type: 'intercultural' },

  // ============ IE2 - Semester 2 ============
  
  // IE2 - Mathematics 2 (MA2) - Lectures
  // weekly, Monday, 10/13/25 - 1/19/26 from 12:10 until 15:40
  { semester: 'IE2', day: 'Monday', start_time: '12:10', end_time: '15:40', code: 'IE2-MA2', full_name: 'Mathematics 2', location: 'BT5 1.13', instructors: 'Neumann', weeks: '42-51,2-3', weeks_array: expandWeeks('42-51,2-3'), module_type: 'math' },
  // fortnightly, Friday, 11/14/25 - 1/9/26 from 08:10 until 11:25
  { semester: 'IE2', day: 'Friday', start_time: '08:10', end_time: '11:25', code: 'IE2-MA2', full_name: 'Mathematics 2', location: 'Stein94 0.02', instructors: 'Neumann', weeks: '46,48,50,2', weeks_array: expandWeeks('46,48,50,2'), module_type: 'math' },
  
  // IE2 - Mathematics 2 Exercises (MAE2)
  // fortnightly, Tuesday, 10/21/25 - 1/13/26 from 17:40 until 19:10
  { semester: 'IE2', day: 'Tuesday', start_time: '17:40', end_time: '19:10', code: 'IE2-MAE2/01', full_name: 'Mathematics 2 Exercises', location: 'BT7 8.61', instructors: 'Maesaka', weeks: '43,45,47,49,51,3', weeks_array: expandWeeks('43,45,47,49,51,3'), module_type: 'math', group: '01' },
  { semester: 'IE2', day: 'Tuesday', start_time: '15:55', end_time: '17:25', code: 'IE2-MAE2/02', full_name: 'Mathematics 2 Exercises', location: 'BT7 8.61', instructors: 'Maesaka', weeks: '43,45,47,49,51,3', weeks_array: expandWeeks('43,45,47,49,51,3'), module_type: 'math', group: '02' },
  
  // IE2 - Software Construction 2 (SO2) - Lecture
  // weekly, Wednesday, 10/15/25 - 12/17/25 from 15:55 until 19:10 + Wednesday, 1/7/26 from 15:55 to 19:10
  { semester: 'IE2', day: 'Wednesday', start_time: '15:55', end_time: '19:10', code: 'IE2-SO2', full_name: 'Software Construction 2', location: 'BT7 12.60', instructors: 'Antosch', weeks: '42-51', weeks_array: expandWeeks('42-51'), module_type: 'software' },
  { semester: 'IE2', day: 'Wednesday', start_time: '15:55', end_time: '19:10', code: 'IE2-SO2', full_name: 'Software Construction 2', location: 'BT7 12.60', instructors: 'Antosch', weeks: '2', weeks_array: expandWeeks('2'), module_type: 'software' },
  
  // IE2 - Software Construction 2 Lab (SOL2) - Groups similar to IE1 but different weeks
  { semester: 'IE2', day: 'Monday', start_time: '09:55', end_time: '11:25', code: 'IE2-SOL2/01', full_name: 'Software Construction 2 Lab', location: 'BT7 13.60', instructors: 'Yildirim, Moldenhauer', weeks: '45', weeks_array: expandWeeks('45'), module_type: 'software', group: '01' },
  { semester: 'IE2', day: 'Monday', start_time: '08:10', end_time: '11:25', code: 'IE2-SOL2/01', full_name: 'Software Construction 2 Lab', location: 'BT7 13.60', instructors: 'Yildirim, Moldenhauer', weeks: '48,51,4', weeks_array: expandWeeks('48,51,4'), module_type: 'software', group: '01' },
  { semester: 'IE2', day: 'Monday', start_time: '08:10', end_time: '09:40', code: 'IE2-SOL2/02', full_name: 'Software Construction 2 Lab', location: 'BT7 13.60', instructors: 'Yildirim, Moldenhauer', weeks: '44', weeks_array: expandWeeks('44'), module_type: 'software', group: '02' },
  { semester: 'IE2', day: 'Monday', start_time: '08:10', end_time: '11:25', code: 'IE2-SOL2/02', full_name: 'Software Construction 2 Lab', location: 'BT7 13.60', instructors: 'Yildirim, Moldenhauer', weeks: '46,49,2', weeks_array: expandWeeks('46,49,2'), module_type: 'software', group: '02' },
  { semester: 'IE2', day: 'Monday', start_time: '09:55', end_time: '11:25', code: 'IE2-SOL2/03', full_name: 'Software Construction 2 Lab', location: 'BT7 13.60', instructors: 'Yildirim, Moldenhauer', weeks: '44', weeks_array: expandWeeks('44'), module_type: 'software', group: '03' },
  { semester: 'IE2', day: 'Monday', start_time: '08:10', end_time: '11:25', code: 'IE2-SOL2/03', full_name: 'Software Construction 2 Lab', location: 'BT7 13.60', instructors: 'Yildirim, Moldenhauer', weeks: '47,50,3', weeks_array: expandWeeks('47,50,3'), module_type: 'software', group: '03' },
  
  // IE2 - Electrical Engineering 2 (EE2) - Lecture
  // weekly, Thursday, 10/16/25 - 12/18/25 from 12:10 until 15:40 + Thursday, 1/8/26 from 12:10 to 15:40
  { semester: 'IE2', day: 'Thursday', start_time: '12:10', end_time: '15:40', code: 'IE2-EE2', full_name: 'Electrical Engineering 2', location: 'Stein94 0.02', instructors: 'Lehmann', weeks: '42-51', weeks_array: expandWeeks('42-51'), module_type: 'electronics' },
  { semester: 'IE2', day: 'Thursday', start_time: '12:10', end_time: '15:40', code: 'IE2-EE2', full_name: 'Electrical Engineering 2', location: 'Stein94 0.02', instructors: 'Lehmann', weeks: '2', weeks_array: expandWeeks('2'), module_type: 'electronics' },
  
  // IE2 - Electrical Engineering 2 Lab (EEL2)
  { semester: 'IE2', day: 'Wednesday', start_time: '14:10', end_time: '15:40', code: 'IE2-EEL2/01', full_name: 'Electrical Engineering 2 Lab', location: 'BT7 5.01', instructors: 'Lehmann, Wittmar', weeks: '44', weeks_array: expandWeeks('44'), module_type: 'electronics', group: '01' },
  { semester: 'IE2', day: 'Wednesday', start_time: '12:10', end_time: '15:40', code: 'IE2-EEL2/01', full_name: 'Electrical Engineering 2 Lab', location: 'BT7 5.01', instructors: 'Lehmann, Wittmar', weeks: '46,49,2', weeks_array: expandWeeks('46,49,2'), module_type: 'electronics', group: '01' },
  { semester: 'IE2', day: 'Wednesday', start_time: '15:55', end_time: '17:25', code: 'IE2-EEL2/02', full_name: 'Electrical Engineering 2 Lab', location: 'BT7 5.01', instructors: 'Lehmann, Wittmar', weeks: '44', weeks_array: expandWeeks('44'), module_type: 'electronics', group: '02' },
  { semester: 'IE2', day: 'Wednesday', start_time: '14:10', end_time: '17:25', code: 'IE2-EEL2/02', full_name: 'Electrical Engineering 2 Lab', location: 'BT7 5.01', instructors: 'Lehmann, Wittmar', weeks: '47,50,3', weeks_array: expandWeeks('47,50,3'), module_type: 'electronics', group: '02' },
  
  // IE2 - Electronics 1 (EL1) - Lecture  
  // weekly, Thursday, 10/16/25 - 12/18/25 from 08:10 until 11:25 + Thursday, 1/8/26 from 08:10 to 11:25
  { semester: 'IE2', day: 'Thursday', start_time: '08:10', end_time: '11:25', code: 'IE2-EL1', full_name: 'Electronics 1', location: 'Stein94 0.02', instructors: 'Haase', weeks: '42-51', weeks_array: expandWeeks('42-51'), module_type: 'electronics' },
  { semester: 'IE2', day: 'Thursday', start_time: '08:10', end_time: '11:25', code: 'IE2-EL1', full_name: 'Electronics 1', location: 'Stein94 0.02', instructors: 'Haase', weeks: '2', weeks_array: expandWeeks('2'), module_type: 'electronics' },
  
  // IE2 - Electronics 1 Lab (ELL1)
  { semester: 'IE2', day: 'Monday', start_time: '08:10', end_time: '09:40', code: 'IE2-ELL1/01', full_name: 'Electronics 1 Lab', location: 'BT7 5.05', instructors: 'Al Hajsaeed, Kruse', weeks: '45', weeks_array: expandWeeks('45'), module_type: 'electronics', group: '01' },
  { semester: 'IE2', day: 'Tuesday', start_time: '08:10', end_time: '11:25', code: 'IE2-ELL1/01', full_name: 'Electronics 1 Lab', location: 'BT7 5.05', instructors: 'Al Hajsaeed, Kruse', weeks: '47,50,3', weeks_array: expandWeeks('47,50,3'), module_type: 'electronics', group: '01' },
  { semester: 'IE2', day: 'Monday', start_time: '09:55', end_time: '11:25', code: 'IE2-ELL1/02', full_name: 'Electronics 1 Lab', location: 'BT7 5.05', instructors: 'Al Hajsaeed, Lehmann', weeks: '45', weeks_array: expandWeeks('45'), module_type: 'electronics', group: '02' },
  { semester: 'IE2', day: 'Tuesday', start_time: '08:10', end_time: '11:25', code: 'IE2-ELL1/02', full_name: 'Electronics 1 Lab', location: 'BT7 5.05', instructors: 'Al Hajsaeed, Lehmann', weeks: '48,51,4', weeks_array: expandWeeks('48,51,4'), module_type: 'electronics', group: '02' },
  { semester: 'IE2', day: 'Tuesday', start_time: '12:10', end_time: '13:40', code: 'IE2-ELL1/03', full_name: 'Electronics 1 Lab', location: 'BT7 5.05', instructors: 'Al Hajsaeed, Lehmann', weeks: '44', weeks_array: expandWeeks('44'), module_type: 'electronics', group: '03' },
  { semester: 'IE2', day: 'Tuesday', start_time: '08:10', end_time: '11:25', code: 'IE2-ELL1/03', full_name: 'Electronics 1 Lab', location: 'BT7 5.05', instructors: 'Al Hajsaeed, Lehmann', weeks: '46,49,2', weeks_array: expandWeeks('46,49,2'), module_type: 'electronics', group: '03' },
  
  // IE2 - Intercultural Competence (IC) - needs schedule data from newschedule.md
  { semester: 'IE2', day: 'Tuesday', start_time: '12:10', end_time: '15:40', code: 'IE2-IC/01', full_name: 'Intercultural Competence', location: 'BT7 8.61', instructors: 'Shook', weeks: '43,45,47,49,51', weeks_array: expandWeeks('43,45,47,49,51'), module_type: 'economics', group: '01' },
  { semester: 'IE2', day: 'Tuesday', start_time: '12:10', end_time: '15:40', code: 'IE2-IC/01', full_name: 'Intercultural Competence', location: 'BT7 6.60', instructors: 'Shook', weeks: '48', weeks_array: expandWeeks('48'), module_type: 'economics', group: '01' },
  { semester: 'IE2', day: 'Tuesday', start_time: '12:10', end_time: '15:40', code: 'IE2-IC/01', full_name: 'Intercultural Competence', location: 'BT7 6.60', instructors: 'Shook', weeks: '3-4', weeks_array: expandWeeks('3-4'), module_type: 'economics', group: '01' },
  { semester: 'IE2', day: 'Tuesday', start_time: '12:10', end_time: '15:40', code: 'IE2-IC/02', full_name: 'Intercultural Competence', location: 'BT7 8.61', instructors: 'Shook', weeks: '42,44,46,50,2', weeks_array: expandWeeks('42,44,46,50,2'), module_type: 'economics', group: '02' },
  { semester: 'IE2', day: 'Tuesday', start_time: '12:10', end_time: '15:40', code: 'IE2-IC/02', full_name: 'Intercultural Competence', location: 'BT7 6.60', instructors: 'Shook', weeks: '48', weeks_array: expandWeeks('48'), module_type: 'economics', group: '02' },
  { semester: 'IE2', day: 'Tuesday', start_time: '12:10', end_time: '15:40', code: 'IE2-IC/02', full_name: 'Intercultural Competence', location: 'BT7 6.60', instructors: 'Shook', weeks: '3-4', weeks_array: expandWeeks('3-4'), module_type: 'economics', group: '02' },
  
  // IE2 - Lab Practice Week (E2-LP) - Oct 6-10 (Week 41)
  { semester: 'IE2', day: 'Monday', start_time: '09:55', end_time: '11:25', code: 'E2-LP', full_name: 'Lab Practice Week', location: 'BT5 1.13', instructors: 'Herster, Kronauge', weeks: '41', weeks_array: expandWeeks('41'), module_type: 'intercultural' },
  { semester: 'IE2', day: 'Monday', start_time: '12:10', end_time: '13:40', code: 'E2-LP', full_name: 'Lab Practice Week', location: 'Various Labs', instructors: '', weeks: '41', weeks_array: expandWeeks('41'), module_type: 'intercultural' },
  { semester: 'IE2', day: 'Tuesday', start_time: '15:55', end_time: '17:25', code: 'E2-LP', full_name: 'Lab Practice Week', location: 'Various Labs', instructors: '', weeks: '41', weeks_array: expandWeeks('41'), module_type: 'intercultural' },
  { semester: 'IE2', day: 'Tuesday', start_time: '17:40', end_time: '19:10', code: 'E2-LP', full_name: 'Lab Practice Week', location: 'Various Labs', instructors: '', weeks: '41', weeks_array: expandWeeks('41'), module_type: 'intercultural' },
  { semester: 'IE2', day: 'Wednesday', start_time: '17:40', end_time: '19:10', code: 'E2-LP', full_name: 'Lab Practice Week', location: 'Various Labs', instructors: '', weeks: '41', weeks_array: expandWeeks('41'), module_type: 'intercultural' },
  { semester: 'IE2', day: 'Thursday', start_time: '08:10', end_time: '09:40', code: 'E2-LP', full_name: 'Lab Practice Week', location: 'Various Labs', instructors: '', weeks: '41', weeks_array: expandWeeks('41'), module_type: 'intercultural' },
  { semester: 'IE2', day: 'Thursday', start_time: '09:55', end_time: '11:25', code: 'E2-LP', full_name: 'Lab Practice Week', location: 'Various Labs', instructors: '', weeks: '41', weeks_array: expandWeeks('41'), module_type: 'intercultural' },
  { semester: 'IE2', day: 'Thursday', start_time: '12:10', end_time: '13:40', code: 'E2-LP', full_name: 'Lab Practice Week', location: 'Various Labs', instructors: '', weeks: '41', weeks_array: expandWeeks('41'), module_type: 'intercultural' },
  { semester: 'IE2', day: 'Thursday', start_time: '14:10', end_time: '15:40', code: 'E2-LP', full_name: 'Lab Practice Week', location: 'Various Labs', instructors: '', weeks: '41', weeks_array: expandWeeks('41'), module_type: 'intercultural' },
  { semester: 'IE2', day: 'Thursday', start_time: '15:55', end_time: '17:25', code: 'E2-LP', full_name: 'Lab Practice Week', location: 'Various Labs', instructors: '', weeks: '41', weeks_array: expandWeeks('41'), module_type: 'intercultural' },
  { semester: 'IE2', day: 'Thursday', start_time: '17:40', end_time: '19:10', code: 'E2-LP', full_name: 'Lab Practice Week', location: 'BT5 1.13', instructors: '', weeks: '41', weeks_array: expandWeeks('41'), module_type: 'intercultural' },

  // ============ IE3 - Semester 3 ============
  
  // IE3 - Signals and Systems 1 (SS1) - Lecture
  // weekly, Monday, 10/6/25 - 12/15/25 from 12:10 until 15:40
  { semester: 'IE3', day: 'Monday', start_time: '12:10', end_time: '15:40', code: 'IE3-SS1', full_name: 'Signals and Systems 1', location: 'Stift69 106', instructors: 'Lehmann', weeks: '41-51', weeks_array: expandWeeks('41-51'), module_type: 'signals' },
  
  // IE3 - Signals and Systems 1 Lab (SSL1)
  { semester: 'IE3', day: 'Wednesday', start_time: '08:10', end_time: '09:40', code: 'IE3-SSL1/01', full_name: 'Signals and Systems 1 Lab', location: 'BT7 13.60', instructors: 'Lehmann', weeks: '44', weeks_array: expandWeeks('44'), module_type: 'signals', group: '01' },
  { semester: 'IE3', day: 'Thursday', start_time: '08:10', end_time: '11:25', code: 'IE3-SSL1/01', full_name: 'Signals and Systems 1 Lab', location: 'BT7 13.60', instructors: 'Lehmann', weeks: '46,49,2', weeks_array: expandWeeks('46,49,2'), module_type: 'signals', group: '01' },
  { semester: 'IE3', day: 'Wednesday', start_time: '09:55', end_time: '11:25', code: 'IE3-SSL1/02', full_name: 'Signals and Systems 1 Lab', location: 'BT7 13.60', instructors: 'Lehmann', weeks: '44', weeks_array: expandWeeks('44'), module_type: 'signals', group: '02' },
  { semester: 'IE3', day: 'Thursday', start_time: '08:10', end_time: '11:25', code: 'IE3-SSL1/02', full_name: 'Signals and Systems 1 Lab', location: 'BT7 13.60', instructors: 'Lehmann', weeks: '47,50,3', weeks_array: expandWeeks('47,50,3'), module_type: 'signals', group: '02' },
  { semester: 'IE3', day: 'Thursday', start_time: '09:55', end_time: '11:25', code: 'IE3-SSL1/03', full_name: 'Signals and Systems 1 Lab', location: 'BT7 13.60', instructors: 'Lehmann', weeks: '45', weeks_array: expandWeeks('45'), module_type: 'signals', group: '03' },
  { semester: 'IE3', day: 'Thursday', start_time: '08:10', end_time: '11:25', code: 'IE3-SSL1/03', full_name: 'Signals and Systems 1 Lab', location: 'BT7 13.60', instructors: 'Lehmann', weeks: '48,51,4', weeks_array: expandWeeks('48,51,4'), module_type: 'signals', group: '03' },
  
  // IE3 - Electronics 2 (EL2) - Lecture
  // weekly, Tuesday, 10/7/25 - 1/20/26 from 15:55 until 19:10
  { semester: 'IE3', day: 'Tuesday', start_time: '15:55', end_time: '19:10', code: 'IE3-EL2', full_name: 'Electronics 2', location: 'BT7 6.60', instructors: 'Radt', weeks: '41-51,2-3', weeks_array: expandWeeks('41-51,2-3'), module_type: 'electronics' },
  
  // IE3 - Electronics 2 Lab (ELL2)
  { semester: 'IE3', day: 'Wednesday', start_time: '12:10', end_time: '15:40', code: 'IE3-ELL2/01', full_name: 'Electronics 2 Lab', location: 'BT7 5.05', instructors: 'Al Hajsaeed, Radt', weeks: '45,47,49', weeks_array: expandWeeks('45,47,49'), module_type: 'electronics', group: '01' },
  { semester: 'IE3', day: 'Wednesday', start_time: '12:10', end_time: '15:40', code: 'IE3-ELL2/01', full_name: 'Electronics 2 Lab', location: 'BT7 8.04', instructors: 'Al Hajsaeed, Radt', weeks: '51,3', weeks_array: expandWeeks('51,3'), module_type: 'electronics', group: '01' },
  { semester: 'IE3', day: 'Wednesday', start_time: '08:10', end_time: '11:25', code: 'IE3-ELL2/02', full_name: 'Electronics 2 Lab', location: 'BT7 5.05', instructors: 'Al Hajsaeed, Radt', weeks: '46,48,50', weeks_array: expandWeeks('46,48,50'), module_type: 'electronics', group: '02' },
  { semester: 'IE3', day: 'Wednesday', start_time: '12:10', end_time: '15:40', code: 'IE3-ELL2/02', full_name: 'Electronics 2 Lab', location: 'BT7 8.04', instructors: 'Al Hajsaeed, Radt', weeks: '2,4', weeks_array: expandWeeks('2,4'), module_type: 'electronics', group: '02' },
  { semester: 'IE3', day: 'Wednesday', start_time: '12:10', end_time: '15:40', code: 'IE3-ELL2/03', full_name: 'Electronics 2 Lab', location: 'BT7 5.05', instructors: 'Al Hajsaeed, Radt', weeks: '46,48,50', weeks_array: expandWeeks('46,48,50'), module_type: 'electronics', group: '03' },
  { semester: 'IE3', day: 'Wednesday', start_time: '08:10', end_time: '11:25', code: 'IE3-ELL2/03', full_name: 'Electronics 2 Lab', location: 'BT7 8.04', instructors: 'Al Hajsaeed, Radt', weeks: '2,4', weeks_array: expandWeeks('2,4'), module_type: 'electronics', group: '03' },
  
  // IE3 - Digital Circuits (DI) - Lecture
  { semester: 'IE3', day: 'Tuesday', start_time: '08:10', end_time: '11:25', code: 'IE3-DI', full_name: 'Digital Circuits', location: 'Stein94 0.02', instructors: 'Rust', weeks: '41-51', weeks_array: expandWeeks('41-51'), module_type: 'digital' },
  
  // IE3 - Digital Circuits Lab (DIL)
  { semester: 'IE3', day: 'Friday', start_time: '08:10', end_time: '09:40', code: 'IE3-DIL/01', full_name: 'Digital Circuits Lab', location: 'BT7 8.01', instructors: 'Rust, Al-Mohamed Zein', weeks: '45', weeks_array: expandWeeks('45'), module_type: 'digital', group: '01' },
  { semester: 'IE3', day: 'Friday', start_time: '08:10', end_time: '11:25', code: 'IE3-DIL/01', full_name: 'Digital Circuits Lab', location: 'BT7 8.01', instructors: 'Rust, Al-Mohamed Zein', weeks: '48,51,4', weeks_array: expandWeeks('48,51,4'), module_type: 'digital', group: '01' },
  { semester: 'IE3', day: 'Friday', start_time: '12:10', end_time: '13:40', code: 'IE3-DIL/02', full_name: 'Digital Circuits Lab', location: 'BT7 8.01', instructors: 'Rust, Al-Mohamed Zein', weeks: '45', weeks_array: expandWeeks('45'), module_type: 'digital', group: '02' },
  { semester: 'IE3', day: 'Friday', start_time: '08:10', end_time: '11:25', code: 'IE3-DIL/02', full_name: 'Digital Circuits Lab', location: 'BT7 8.01', instructors: 'Rust, Al-Mohamed Zein', weeks: '46,49,2', weeks_array: expandWeeks('46,49,2'), module_type: 'digital', group: '02' },
  { semester: 'IE3', day: 'Friday', start_time: '14:10', end_time: '15:40', code: 'IE3-DIL/03', full_name: 'Digital Circuits Lab', location: 'BT7 8.01', instructors: 'Rust, Al-Mohamed Zein', weeks: '45', weeks_array: expandWeeks('45'), module_type: 'digital', group: '03' },
  { semester: 'IE3', day: 'Friday', start_time: '08:10', end_time: '11:25', code: 'IE3-DIL/03', full_name: 'Digital Circuits Lab', location: 'BT7 8.01', instructors: 'Rust, Al-Mohamed Zein', weeks: '47,50,3', weeks_array: expandWeeks('47,50,3'), module_type: 'digital', group: '03' },
  
  // IE3 - Algorithms and Data Structures (AD) - Lecture
  { semester: 'IE3', day: 'Tuesday', start_time: '12:10', end_time: '15:40', code: 'IE3-AD', full_name: 'Algorithms and Data Structures', location: 'BT7 10.60', instructors: 'Gottfried-Krambeer', weeks: '41-51', weeks_array: expandWeeks('41-51'), module_type: 'software' },
  
  // IE3 - Algorithms and Data Structures Lab (ADL)
  { semester: 'IE3', day: 'Friday', start_time: '12:10', end_time: '13:40', code: 'IE3-ADL/01', full_name: 'Algorithms and Data Structures Lab', location: 'BT7 13.65', instructors: 'Gottfried-Krambeer', weeks: '45', weeks_array: expandWeeks('45'), module_type: 'software', group: '01' },
  { semester: 'IE3', day: 'Friday', start_time: '12:10', end_time: '15:40', code: 'IE3-ADL/01', full_name: 'Algorithms and Data Structures Lab', location: 'BT7 13.65', instructors: 'Gottfried-Krambeer', weeks: '46,49,2', weeks_array: expandWeeks('46,49,2'), module_type: 'software', group: '01' },
  { semester: 'IE3', day: 'Friday', start_time: '14:10', end_time: '15:40', code: 'IE3-ADL/02', full_name: 'Algorithms and Data Structures Lab', location: 'BT7 13.65', instructors: 'Gottfried-Krambeer', weeks: '45', weeks_array: expandWeeks('45'), module_type: 'software', group: '02' },
  { semester: 'IE3', day: 'Friday', start_time: '12:10', end_time: '15:40', code: 'IE3-ADL/02', full_name: 'Algorithms and Data Structures Lab', location: 'BT7 13.65', instructors: 'Gottfried-Krambeer', weeks: '47,50,3', weeks_array: expandWeeks('47,50,3'), module_type: 'software', group: '02' },
  { semester: 'IE3', day: 'Wednesday', start_time: '14:10', end_time: '15:40', code: 'IE3-ADL/03', full_name: 'Algorithms and Data Structures Lab', location: 'BT7 13.60', instructors: 'Gottfried-Krambeer', weeks: '45', weeks_array: expandWeeks('45'), module_type: 'software', group: '03' },
  { semester: 'IE3', day: 'Friday', start_time: '12:10', end_time: '15:40', code: 'IE3-ADL/03', full_name: 'Algorithms and Data Structures Lab', location: 'BT7 13.65', instructors: 'Gottfried-Krambeer', weeks: '48,51,4', weeks_array: expandWeeks('48,51,4'), module_type: 'software', group: '03' },
  
  // IE3 - Economics and Management (EM) - Lecture
  { semester: 'IE3', day: 'Thursday', start_time: '12:10', end_time: '15:40', code: 'IE3-EM', full_name: 'Economics and Management', location: 'BT7 12.60', instructors: 'Shook', weeks: '42-51,2', weeks_array: expandWeeks('42-51,2'), module_type: 'economics' },
  
  // IE3 - Economics and Management Exercises (EME)
  { semester: 'IE3', day: 'Monday', start_time: '08:10', end_time: '11:25', code: 'IE3-EME/01', full_name: 'Economics and Management Exercises', location: 'BT7 14.86', instructors: 'Shook', weeks: '44,47,50', weeks_array: expandWeeks('44,47,50'), module_type: 'economics', group: '01' },
  { semester: 'IE3', day: 'Monday', start_time: '08:10', end_time: '11:25', code: 'IE3-EME/02', full_name: 'Economics and Management Exercises', location: 'BT7 14.86', instructors: 'Shook', weeks: '45,48,51', weeks_array: expandWeeks('45,48,51'), module_type: 'economics', group: '02' },
  { semester: 'IE3', day: 'Monday', start_time: '08:10', end_time: '11:25', code: 'IE3-EME/03', full_name: 'Economics and Management Exercises', location: 'BT7 14.86', instructors: 'Shook', weeks: '46,49,2', weeks_array: expandWeeks('46,49,2'), module_type: 'economics', group: '03' },

  // ============ IE4 - Semester 4 ============
  
  // IE4 - Signals and Systems 2 (SS2) - Lecture
  // weekly, Friday, 10/10/25 - 12/19/25 from 12:10 until 15:40
  { semester: 'IE4', day: 'Friday', start_time: '12:10', end_time: '15:40', code: 'IE4-SS2', full_name: 'Signals and Systems 2', location: 'BT7 6.60', instructors: 'Lange', weeks: '41-51', weeks_array: expandWeeks('41-51'), module_type: 'signals' },
  
  // IE4 - Signals and Systems 2 Lab (SSL2)
  { semester: 'IE4', day: 'Thursday', start_time: '14:10', end_time: '15:40', code: 'IE4-SSL2/01', full_name: 'Signals and Systems 2 Lab', location: 'BT7 13.65', instructors: 'Lange', weeks: '45', weeks_array: expandWeeks('45'), module_type: 'signals', group: '01' },
  { semester: 'IE4', day: 'Thursday', start_time: '12:10', end_time: '15:40', code: 'IE4-SSL2/01', full_name: 'Signals and Systems 2 Lab', location: 'BT7 13.65', instructors: 'Lange', weeks: '48,51,4', weeks_array: expandWeeks('48,51,4'), module_type: 'signals', group: '01' },
  { semester: 'IE4', day: 'Thursday', start_time: '09:55', end_time: '11:25', code: 'IE4-SSL2/02', full_name: 'Signals and Systems 2 Lab', location: 'BT7 13.65', instructors: 'Lange', weeks: '45', weeks_array: expandWeeks('45'), module_type: 'signals', group: '02' },
  { semester: 'IE4', day: 'Thursday', start_time: '12:10', end_time: '15:40', code: 'IE4-SSL2/02', full_name: 'Signals and Systems 2 Lab', location: 'BT7 13.65', instructors: 'Lange', weeks: '46,49,2', weeks_array: expandWeeks('46,49,2'), module_type: 'signals', group: '02' },
  { semester: 'IE4', day: 'Thursday', start_time: '08:10', end_time: '09:40', code: 'IE4-SSL2/03', full_name: 'Signals and Systems 2 Lab', location: 'BT7 13.65', instructors: 'Lange', weeks: '45', weeks_array: expandWeeks('45'), module_type: 'signals', group: '03' },
  { semester: 'IE4', day: 'Thursday', start_time: '12:10', end_time: '15:40', code: 'IE4-SSL2/03', full_name: 'Signals and Systems 2 Lab', location: 'BT7 13.65', instructors: 'Lange', weeks: '47,50,3', weeks_array: expandWeeks('47,50,3'), module_type: 'signals', group: '03' },
  
  // IE4 - Digital Systems (DS) - Lecture
  { semester: 'IE4', day: 'Tuesday', start_time: '08:10', end_time: '11:25', code: 'IE4-DS', full_name: 'Digital Systems', location: 'Stift69 107', instructors: 'Herster', weeks: '41-51', weeks_array: expandWeeks('41-51'), module_type: 'digital' },
  
  // IE4 - Digital Systems Lab (DSL)
  { semester: 'IE4', day: 'Tuesday', start_time: '15:55', end_time: '17:25', code: 'IE4-DSL/01', full_name: 'Digital Systems Lab', location: 'BT7 8.01', instructors: 'Herster', weeks: '45', weeks_array: expandWeeks('45'), module_type: 'digital', group: '01' },
  { semester: 'IE4', day: 'Wednesday', start_time: '08:10', end_time: '11:25', code: 'IE4-DSL/01', full_name: 'Digital Systems Lab', location: 'BT7 8.01', instructors: 'Herster', weeks: '48,51,4', weeks_array: expandWeeks('48,51,4'), module_type: 'digital', group: '01' },
  { semester: 'IE4', day: 'Wednesday', start_time: '12:10', end_time: '13:40', code: 'IE4-DSL/02', full_name: 'Digital Systems Lab', location: 'BT7 8.01', instructors: 'Herster', weeks: '44', weeks_array: expandWeeks('44'), module_type: 'digital', group: '02' },
  { semester: 'IE4', day: 'Wednesday', start_time: '08:10', end_time: '11:25', code: 'IE4-DSL/02', full_name: 'Digital Systems Lab', location: 'BT7 8.01', instructors: 'Herster', weeks: '46,49,2', weeks_array: expandWeeks('46,49,2'), module_type: 'digital', group: '02' },
  { semester: 'IE4', day: 'Wednesday', start_time: '14:10', end_time: '15:40', code: 'IE4-DSL/03', full_name: 'Digital Systems Lab', location: 'BT7 8.01', instructors: 'Herster', weeks: '44', weeks_array: expandWeeks('44'), module_type: 'digital', group: '03' },
  { semester: 'IE4', day: 'Wednesday', start_time: '08:10', end_time: '11:25', code: 'IE4-DSL/03', full_name: 'Digital Systems Lab', location: 'BT7 8.01', instructors: 'Herster', weeks: '47,50,3', weeks_array: expandWeeks('47,50,3'), module_type: 'digital', group: '03' },
  
  // IE4 - Microcontrollers (MC) - Lecture
  { semester: 'IE4', day: 'Thursday', start_time: '12:10', end_time: '15:40', code: 'IE4-MC', full_name: 'Microcontrollers', location: 'Stift69 110', instructors: 'Schulz', weeks: '41-51', weeks_array: expandWeeks('41-51'), module_type: 'digital' },
  
  // IE4 - Microcontrollers Lab (MCL)
  { semester: 'IE4', day: 'Friday', start_time: '08:10', end_time: '09:40', code: 'IE4-MCL/01', full_name: 'Microcontrollers Lab', location: 'BT7 8.04', instructors: 'Schulz', weeks: '44', weeks_array: expandWeeks('44'), module_type: 'digital', group: '01' },
  { semester: 'IE4', day: 'Friday', start_time: '08:10', end_time: '11:25', code: 'IE4-MCL/01', full_name: 'Microcontrollers Lab', location: 'BT7 8.04', instructors: 'Schulz', weeks: '45,48,2', weeks_array: expandWeeks('45,48,2'), module_type: 'digital', group: '01' },
  { semester: 'IE4', day: 'Friday', start_time: '12:10', end_time: '13:40', code: 'IE4-MCL/02', full_name: 'Microcontrollers Lab', location: 'BT7 8.04', instructors: 'Schulz', weeks: '44', weeks_array: expandWeeks('44'), module_type: 'digital', group: '02' },
  { semester: 'IE4', day: 'Friday', start_time: '08:10', end_time: '11:25', code: 'IE4-MCL/02', full_name: 'Microcontrollers Lab', location: 'BT7 8.04', instructors: 'Schulz', weeks: '46,49,3', weeks_array: expandWeeks('46,49,3'), module_type: 'digital', group: '02' },
  { semester: 'IE4', day: 'Friday', start_time: '14:10', end_time: '15:40', code: 'IE4-MCL/03', full_name: 'Microcontrollers Lab', location: 'BT7 8.04', instructors: 'Schulz', weeks: '44', weeks_array: expandWeeks('44'), module_type: 'digital', group: '03' },
  { semester: 'IE4', day: 'Friday', start_time: '08:10', end_time: '11:25', code: 'IE4-MCL/03', full_name: 'Microcontrollers Lab', location: 'BT7 8.04', instructors: 'Schulz', weeks: '47,50,4', weeks_array: expandWeeks('47,50,4'), module_type: 'digital', group: '03' },
  
  // IE4 - Software Engineering (SE) - Lecture
  { semester: 'IE4', day: 'Monday', start_time: '12:10', end_time: '15:40', code: 'IE4-SE', full_name: 'Software Engineering', location: 'BT7 12.60', instructors: 'Antosch', weeks: '41-51', weeks_array: expandWeeks('41-51'), module_type: 'software' },
  
  // IE4 - Software Engineering Lab (SEL)
  { semester: 'IE4', day: 'Tuesday', start_time: '12:10', end_time: '13:40', code: 'IE4-SEL/01', full_name: 'Software Engineering Lab', location: 'BT7 13.65', instructors: 'Antosch', weeks: '44', weeks_array: expandWeeks('44'), module_type: 'software', group: '01' },
  { semester: 'IE4', day: 'Tuesday', start_time: '12:10', end_time: '15:40', code: 'IE4-SEL/01', full_name: 'Software Engineering Lab', location: 'BT7 13.65', instructors: 'Antosch', weeks: '45,48,2', weeks_array: expandWeeks('45,48,2'), module_type: 'software', group: '01' },
  { semester: 'IE4', day: 'Tuesday', start_time: '14:10', end_time: '15:40', code: 'IE4-SEL/02', full_name: 'Software Engineering Lab', location: 'BT7 13.65', instructors: 'Antosch', weeks: '44', weeks_array: expandWeeks('44'), module_type: 'software', group: '02' },
  { semester: 'IE4', day: 'Tuesday', start_time: '12:10', end_time: '15:40', code: 'IE4-SEL/02', full_name: 'Software Engineering Lab', location: 'BT7 13.65', instructors: 'Antosch', weeks: '46,49,3', weeks_array: expandWeeks('46,49,3'), module_type: 'software', group: '02' },
  { semester: 'IE4', day: 'Wednesday', start_time: '12:10', end_time: '13:40', code: 'IE4-SEL/03', full_name: 'Software Engineering Lab', location: 'BT7 13.60', instructors: 'Antosch', weeks: '45', weeks_array: expandWeeks('45'), module_type: 'software', group: '03' },
  { semester: 'IE4', day: 'Tuesday', start_time: '12:10', end_time: '15:40', code: 'IE4-SEL/03', full_name: 'Software Engineering Lab', location: 'BT7 13.65', instructors: 'Antosch', weeks: '47,50,4', weeks_array: expandWeeks('47,50,4'), module_type: 'software', group: '03' },
  
  // IE4 - Databases (DB) - Lecture
  { semester: 'IE4', day: 'Monday', start_time: '08:10', end_time: '11:25', code: 'IE4-DB', full_name: 'Databases', location: 'BT7 10.60', instructors: 'Roose', weeks: '41-51', weeks_array: expandWeeks('41-51'), module_type: 'database' },
  
  // IE4 - Databases Lab (DBL)
  { semester: 'IE4', day: 'Monday', start_time: '08:10', end_time: '09:40', code: 'IE4-DBL/01', full_name: 'Databases Lab', location: 'BT7 13.65', instructors: 'Köpcke, Roose', weeks: '45', weeks_array: expandWeeks('45'), module_type: 'database', group: '01' },
  { semester: 'IE4', day: 'Monday', start_time: '08:10', end_time: '11:25', code: 'IE4-DBL/01', full_name: 'Databases Lab', location: 'BT7 13.65', instructors: 'Köpcke, Roose', weeks: '46,49,2', weeks_array: expandWeeks('46,49,2'), module_type: 'database', group: '01' },
  { semester: 'IE4', day: 'Monday', start_time: '09:55', end_time: '11:25', code: 'IE4-DBL/02', full_name: 'Databases Lab', location: 'BT7 13.65', instructors: 'Köpcke, Roose', weeks: '45', weeks_array: expandWeeks('45'), module_type: 'database', group: '02' },
  { semester: 'IE4', day: 'Monday', start_time: '08:10', end_time: '11:25', code: 'IE4-DBL/02', full_name: 'Databases Lab', location: 'BT7 13.65', instructors: 'Köpcke, Roose', weeks: '47,50,3', weeks_array: expandWeeks('47,50,3'), module_type: 'database', group: '02' },
  { semester: 'IE4', day: 'Thursday', start_time: '12:10', end_time: '13:40', code: 'IE4-DBL/03', full_name: 'Databases Lab', location: 'BT7 13.65', instructors: 'Herster', weeks: '45', weeks_array: expandWeeks('45'), module_type: 'database', group: '03' },
  { semester: 'IE4', day: 'Wednesday', start_time: '08:10', end_time: '11:25', code: 'IE4-DBL/03', full_name: 'Databases Lab', location: 'BT7 13.60', instructors: 'Herster', weeks: '48,51,4', weeks_array: expandWeeks('48,51,4'), module_type: 'database', group: '03' },
];

export class ScheduleBlock {
  static async get(): Promise<ScheduleBlockType[]> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));
    return realSchedule;
  }
}
