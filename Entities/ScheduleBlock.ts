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

// Module name mapping
const moduleNames: { [key: string]: string } = {
  'DB': 'Databases',
  'DBL': 'Databases Lab',
  'MC': 'Microcontrollers',
  'MCL': 'Microcontrollers Lab',
  'SE': 'Software Engineering',
  'SEL': 'Software Engineering Lab',
  'DS': 'Digital Systems',
  'DSL': 'Digital Systems Lab',
  'SS2': 'Signals and Systems 2',
  'SSL2': 'Signals and Systems 2 Lab',
  'AD': 'Algorithms and Data Structures',
  'ADL': 'Algorithms and Data Structures Lab',
  'EME': 'Economics and Management Exercises',
  'DI': 'Digital Circuits',
  'EL2': 'Electronics 2',
  'ELL2': 'Electronics 2 Lab',
  'SS1': 'Signals and Systems 1',
  'SSL1': 'Signals and Systems 1 Lab',
  'EM': 'Economics and Management',
  'DIL': 'Digital Circuits Lab',
  'EL1': 'Electronics 1',
  'ELL1': 'Electronics 1 Lab',
  'EE2': 'Electrical Engineering 2',
  'EEL2': 'Electrical Engineering 2 Lab',
  'SO2': 'Software Construction 2',
  'SOL2': 'Software Construction 2 Lab',
  'MA2': 'Mathematics 2',
  'MAE2': 'Mathematics 2 Exercises',
  'IC': 'Intercultural Competence',
  'LSL': 'Learning and Study Methods',
  'LP': 'Lab Practice',
  'GE': 'German',
  'EE1': 'Electrical Engineering 1',
  'EEL1': 'Electrical Engineering 1 Lab',
  'LSE': 'Learning and Study Methods Exercises',
  'MA1': 'Mathematics 1',
  'MAE1': 'Mathematics 1 Exercises',
  'SO1': 'Software Construction 1',
  'SOL1': 'Software Construction 1 Lab',
  'SP': 'Scientific and Project Work',
  'OS': 'Operating Systems',
  'OSL': 'Operating Systems Lab',
  'BU': 'Bus Systems and Sensors',
  'BUL': 'Bus Systems and Sensors Lab',
  'DP': 'Digital Signal Processing',
  'DPL': 'Digital Signal Processing Lab',
  'DC': 'Digital Communication Systems',
  'DCL': 'Digital Communication Systems Lab',
  'WP-Rust': 'Elective: Architectures of Digital Signal Processing',
  'WP-Titova': 'Elective: Solar Energy',
  'WP-Winzenick': 'Elective: Electrical Energy Systems',
  'WP-Schulz': 'Elective: Embedded Systems Verification and Test',
  'WP-Neumann': 'Elective: Introduction to Cryptography',
  'WP-Noack': 'Elective: LED Technology',
  'WP-Buczek': 'Elective: BCZ',
  'WP-Radt': 'Elective: Peer Leaders',
  'PRO': 'Project',
};

// Module type mapping for color coding
function getModuleType(code: string): string {
  const baseCode = code.split('/')[0].replace(/IE\d+-/, '').replace(/E\d+-/, '');
  
  if (baseCode.includes('DB') || baseCode.includes('DS')) return 'database';
  if (baseCode.includes('DI') || baseCode.includes('DC')) return 'digital';
  if (baseCode.includes('MC')) return 'microcontroller';
  if (baseCode.includes('SS') || baseCode.includes('DP')) return 'signals';
  if (baseCode.includes('EL') || baseCode.includes('EE')) return 'electronics';
  if (baseCode.includes('SE') || baseCode.includes('SO') || baseCode.includes('OS')) return 'software';
  if (baseCode.includes('MA')) return 'math';
  if (baseCode.includes('EM') || baseCode.includes('IC')) return 'economics';
  if (baseCode.includes('AD')) return 'software';
  if (baseCode.includes('BU')) return 'electronics';
  if (baseCode.includes('GE') || baseCode.includes('LS') || baseCode.includes('SP') || baseCode.includes('PRO') || baseCode.includes('WP')) return 'intercultural';
  
  return 'default';
}

function getFullName(code: string): string {
  const parts = code.split('/');
  const baseCode = parts[0].replace(/IE\d+-/, '').replace(/E\d+-/, '');
  
  // Handle special IE7/E7 courses
  if (code.startsWith('E7-')) {
    if (code.includes('WP-Rust')) return 'Elective: Architectures of Digital Signal Processing';
    if (code.includes('Architekturen')) return 'Architectures of Digital Signal Processing Lab';
    if (code.includes('WP-Titova')) return 'Elective: Solar Energy';
    if (code.includes('Solar Energy')) return 'Solar Energy Lab';
    if (code.includes('Automatic Code')) return 'Automatic Code Generation using MATLAB/Simulink';
    if (code.includes('PRO-Meiners')) return 'Project: Meiners';
    if (code.includes('PRO-Trivedi')) return 'Project: Trivedi';
    if (code.includes('WP-Winzenick')) return 'Elective: Electrical Energy Systems';
    if (code.includes('Elektroenergie')) return 'Electrical Energy Systems Lab';
    if (code.includes('WP-Schulz')) return 'Elective: Embedded Systems Verification';
    if (code.includes('Embedded Systems')) return 'Embedded Systems Verification and Test Lab';
    if (code.includes('Partysimulation')) return 'Development of a Party Simulation';
    if (code.includes('PRO-Conjeti')) return 'Project: Conjeti';
    if (code.includes('Hydroponik')) return 'Hydroponics';
    if (code.includes('WP-Neumann')) return 'Elective: Introduction to Cryptography';
    if (code.includes('Introduction to Cryptography')) return 'Introduction to Cryptography Lab';
    if (code.includes('WP-Noack')) return 'Elective: LED Technology';
    if (code.includes('LED Technik')) return 'LED Technology Lab';
    if (code.includes('WP-Buczek')) return 'Elective: Advanced Topics';
    if (code.includes('WPP-BCZ')) return 'Advanced Topics Lab';
    if (code.includes('One World')) return 'One World Engineering';
    if (code.includes('WP-Radt')) return 'Elective: Peer Leaders';
    if (code.includes('Peer Leaders')) return 'Peer Leaders Lab';
    if (code.includes('Raspberry Pi')) return 'Raspberry Pi';
    return code; // Fallback
  }
  
  const baseName = moduleNames[baseCode] || baseCode;
  return baseName;
}

// Real schedule data - Updated from newschedule.md
const realSchedule: ScheduleBlockType[] = [
  
  // ============ IE1 - Semester 1 ============
  
  // IE1 - Mathematics 1 (MA1) - Lectures
  { semester: 'IE1', day: 'Friday', start_time: '12:10', end_time: '15:40', code: 'IE1-MA1', full_name: 'Mathematics 1', location: 'BT7 12.60', instructors: 'Nieder', weeks: '42-51,2-4', weeks_array: expandWeeks('42-51,2-4'), module_type: 'math' },
  { semester: 'IE1', day: 'Wednesday', start_time: '12:10', end_time: '15:40', code: 'IE1-MA1', full_name: 'Mathematics 1', location: 'BT5 1.13', instructors: 'Nieder', weeks: '43,45,47,49,51', weeks_array: expandWeeks('43,45,47,49,51'), module_type: 'math' },
  
  // IE1 - Mathematics 1 Exercises (MAE1)
  { semester: 'IE1', day: 'Thursday', start_time: '08:10', end_time: '09:40', code: 'IE1-MAE1/01', full_name: 'Mathematics 1 Exercises', location: 'BT7 10.65', instructors: 'Nieder', weeks: '43,45,47,49,51,3', weeks_array: expandWeeks('43,45,47,49,51,3'), module_type: 'math', group: '01' },
  { semester: 'IE1', day: 'Thursday', start_time: '09:55', end_time: '11:25', code: 'IE1-MAE1/02', full_name: 'Mathematics 1 Exercises', location: 'BT7 10.65', instructors: 'Nieder', weeks: '43,45,47,49,51,3', weeks_array: expandWeeks('43,45,47,49,51,3'), module_type: 'math', group: '02' },
  
  // IE1 - Electrical Engineering 1 (EE1) - Lecture
  { semester: 'IE1', day: 'Friday', start_time: '08:10', end_time: '11:25', code: 'IE1-EE1', full_name: 'Electrical Engineering 1', location: 'BT5 1.13', instructors: 'Hansen', weeks: '42-51,2-4', weeks_array: expandWeeks('42-51,2-4'), module_type: 'electronics' },
  
  // IE1 - Electrical Engineering 1 Lab (EEL1)
  { semester: 'IE1', day: 'Monday', start_time: '14:10', end_time: '15:40', code: 'IE1-EEL1/01', full_name: 'Electrical Engineering 1 Lab', location: 'BT7 5.01', instructors: 'Hansen, Wittmar', weeks: '44', weeks_array: expandWeeks('44'), module_type: 'electronics', group: '01' },
  { semester: 'IE1', day: 'Monday', start_time: '12:10', end_time: '15:40', code: 'IE1-EEL1/01', full_name: 'Electrical Engineering 1 Lab', location: 'BT7 5.01', instructors: 'Hansen, Wittmar', weeks: '46,49,2', weeks_array: expandWeeks('46,49,2'), module_type: 'electronics', group: '01' },
  { semester: 'IE1', day: 'Monday', start_time: '12:10', end_time: '13:40', code: 'IE1-EEL1/02', full_name: 'Electrical Engineering 1 Lab', location: 'BT7 5.01', instructors: 'Hansen, Wittmar', weeks: '44', weeks_array: expandWeeks('44'), module_type: 'electronics', group: '02' },
  { semester: 'IE1', day: 'Monday', start_time: '12:10', end_time: '15:40', code: 'IE1-EEL1/02', full_name: 'Electrical Engineering 1 Lab', location: 'BT7 5.01', instructors: 'Hansen, Wittmar', weeks: '47,50,3', weeks_array: expandWeeks('47,50,3'), module_type: 'electronics', group: '02' },
  { semester: 'IE1', day: 'Monday', start_time: '12:10', end_time: '13:40', code: 'IE1-EEL1/03', full_name: 'Electrical Engineering 1 Lab', location: 'BT7 5.01', instructors: 'Hansen, Wittmar', weeks: '45', weeks_array: expandWeeks('45'), module_type: 'electronics', group: '03' },
  { semester: 'IE1', day: 'Monday', start_time: '12:10', end_time: '15:40', code: 'IE1-EEL1/03', full_name: 'Electrical Engineering 1 Lab', location: 'BT7 5.01', instructors: 'Hansen, Wittmar', weeks: '48,51,4', weeks_array: expandWeeks('48,51,4'), module_type: 'electronics', group: '03' },
  
  // IE1 - Software Construction 1 (SO1) - Lecture
  { semester: 'IE1', day: 'Wednesday', start_time: '15:55', end_time: '19:10', code: 'IE1-SO1', full_name: 'Software Construction 1', location: 'BT5 1.13', instructors: 'Hensel', weeks: '42-51,2-4', weeks_array: expandWeeks('42-51,2-4'), module_type: 'software' },
  
  // IE1 - Software Construction 1 Lab (SOL1)
  { semester: 'IE1', day: 'Monday', start_time: '15:55', end_time: '19:10', code: 'IE1-SOL1/01', full_name: 'Software Construction 1 Lab', location: 'BT7 13.65', instructors: 'Hensel', weeks: '45,47,49,51,3', weeks_array: expandWeeks('45,47,49,51,3'), module_type: 'software', group: '01' },
  { semester: 'IE1', day: 'Monday', start_time: '15:55', end_time: '19:10', code: 'IE1-SOL1/02', full_name: 'Software Construction 1 Lab', location: 'BT7 13.65', instructors: 'Schüthe, Orychshenko', weeks: '46,48,50,2,4', weeks_array: expandWeeks('46,48,50,2,4'), module_type: 'software', group: '02' },
  { semester: 'IE1', day: 'Monday', start_time: '15:55', end_time: '19:10', code: 'IE1-SOL1/03', full_name: 'Software Construction 1 Lab', location: 'BT7 13.60', instructors: 'Orychshenko, Schüthe', weeks: '45,47,49,51,3', weeks_array: expandWeeks('45,47,49,51,3'), module_type: 'software', group: '03' },
  { semester: 'IE1', day: 'Monday', start_time: '15:55', end_time: '19:10', code: 'IE1-SOL1/04', full_name: 'Software Construction 1 Lab', location: 'BT7 13.60', instructors: 'Orychshenko, Schüthe', weeks: '46,48,50,2,4', weeks_array: expandWeeks('46,48,50,2,4'), module_type: 'software', group: '04' },
  
  // IE1 - German (GE)
  { semester: 'IE1', day: 'Thursday', start_time: '09:55', end_time: '11:25', code: 'IE1-GE/01', full_name: 'German', location: 'BT7 14.65', instructors: 'Appel', weeks: '42-51,2-4', weeks_array: expandWeeks('42-51,2-4'), module_type: 'intercultural', group: '01' },
  { semester: 'IE1', day: 'Thursday', start_time: '12:10', end_time: '13:40', code: 'IE1-GE/02', full_name: 'German', location: 'BT7 12.81', instructors: 'Appel', weeks: '42-51,2-4', weeks_array: expandWeeks('42-51,2-4'), module_type: 'intercultural', group: '02' },
  
  // IE1 - Learning and Study Methods Exercises (LSE1)
  { semester: 'IE1', day: 'Tuesday', start_time: '08:10', end_time: '11:25', code: 'IE1-LSE/01', full_name: 'Learning and Study Methods Exercises', location: 'BT7 14.86', instructors: 'McCabe', weeks: '42', weeks_array: expandWeeks('42'), module_type: 'intercultural', group: '01' },
  { semester: 'IE1', day: 'Tuesday', start_time: '12:10', end_time: '15:40', code: 'IE1-LSE/01', full_name: 'Learning and Study Methods Exercises', location: 'BT7 14.65', instructors: 'McCabe', weeks: '43,45,47,49,51,3', weeks_array: expandWeeks('43,45,47,49,51,3'), module_type: 'intercultural', group: '01' },
  { semester: 'IE1', day: 'Tuesday', start_time: '12:10', end_time: '15:40', code: 'IE1-LSE/02', full_name: 'Learning and Study Methods Exercises', location: 'BT7 14.65', instructors: 'McCabe', weeks: '42,44,46,48,50,2,4', weeks_array: expandWeeks('42,44,46,48,50,2,4'), module_type: 'intercultural', group: '02' },
  
  // IE1 - Learning and Study Methods Lab (LSL1)
  { semester: 'IE1', day: 'Thursday', start_time: '15:55', end_time: '19:10', code: 'IE1-LSL/01', full_name: 'Learning and Study Methods Lab', location: 'BT7 12.60', instructors: 'Lapke, Leutelt, Radt', weeks: '43,3', weeks_array: expandWeeks('43,3'), module_type: 'intercultural', group: '01' },
  { semester: 'IE1', day: 'Thursday', start_time: '14:10', end_time: '17:25', code: 'IE1-LSL/02', full_name: 'Learning and Study Methods Lab', location: 'BT7 8.61', instructors: 'Lapke', weeks: '45,47,49,51', weeks_array: expandWeeks('45,47,49,51'), module_type: 'intercultural', group: '02' },
  { semester: 'IE1', day: 'Monday', start_time: '08:10', end_time: '11:25', code: 'IE1-LSL/03', full_name: 'Learning and Study Methods Lab', location: 'Stift69 106', instructors: 'Leutelt', weeks: '45,47,49,51', weeks_array: expandWeeks('45,47,49,51'), module_type: 'intercultural', group: '03' },
  { semester: 'IE1', day: 'Tuesday', start_time: '08:10', end_time: '11:25', code: 'IE1-LSL/04', full_name: 'Learning and Study Methods Lab', location: 'BT7 14.86', instructors: 'Radt', weeks: '45,47,49,51', weeks_array: expandWeeks('45,47,49,51'), module_type: 'intercultural', group: '04' },
  
  // IE1 - Learning and Study Methods Intro Week (LSL2) - Oct 6-11
  { semester: 'IE1', day: 'Monday', start_time: '08:10', end_time: '11:25', code: 'IE1-LSL2', full_name: 'Learning and Study Methods Intro Week', location: 'BT5 1.13', instructors: '', weeks: '41', weeks_array: expandWeeks('41'), module_type: 'intercultural' },
  { semester: 'IE1', day: 'Monday', start_time: '12:10', end_time: '18:00', code: 'IE1-LSL2', full_name: 'Learning and Study Methods Intro Week', location: 'BT7 8.85', instructors: '', weeks: '41', weeks_array: expandWeeks('41'), module_type: 'intercultural' },
  { semester: 'IE1', day: 'Tuesday', start_time: '08:10', end_time: '18:00', code: 'IE1-LSL2', full_name: 'Learning and Study Methods Intro Week', location: 'BT7 8.85', instructors: '', weeks: '41', weeks_array: expandWeeks('41'), module_type: 'intercultural' },
  { semester: 'IE1', day: 'Wednesday', start_time: '08:10', end_time: '18:00', code: 'IE1-LSL2', full_name: 'Learning and Study Methods Intro Week', location: 'BT7 8.85', instructors: '', weeks: '41', weeks_array: expandWeeks('41'), module_type: 'intercultural' },
  { semester: 'IE1', day: 'Thursday', start_time: '08:10', end_time: '18:00', code: 'IE1-LSL2', full_name: 'Learning and Study Methods Intro Week', location: 'BT7 8.85', instructors: '', weeks: '41', weeks_array: expandWeeks('41'), module_type: 'intercultural' },
  { semester: 'IE1', day: 'Friday', start_time: '08:10', end_time: '18:00', code: 'IE1-LSL2', full_name: 'Learning and Study Methods Intro Week', location: 'BT7 8.85', instructors: '', weeks: '41', weeks_array: expandWeeks('41'), module_type: 'intercultural' },
  { semester: 'IE1', day: 'Saturday', start_time: '08:00', end_time: '18:00', code: 'IE1-LSL2', full_name: 'Learning and Study Methods Intro Week', location: 'BT5 1.13', instructors: '', weeks: '41', weeks_array: expandWeeks('41'), module_type: 'intercultural' },

  // ============ IE2 - Semester 2 ============
  
  // IE2 - Mathematics 2 (MA2) - Lectures
  { semester: 'IE2', day: 'Monday', start_time: '12:10', end_time: '15:40', code: 'IE2-MA2', full_name: 'Mathematics 2', location: 'BT5 1.13', instructors: 'Neumann', weeks: '42-51,2-4', weeks_array: expandWeeks('42-51,2-4'), module_type: 'math' },
  { semester: 'IE2', day: 'Friday', start_time: '08:10', end_time: '11:25', code: 'IE2-MA2', full_name: 'Mathematics 2', location: 'Stein94 0.02', instructors: 'Neumann', weeks: '46,48,50,2', weeks_array: expandWeeks('46,48,50,2'), module_type: 'math' },
  
  // IE2 - Mathematics 2 Exercises (MAE2)
  { semester: 'IE2', day: 'Tuesday', start_time: '17:40', end_time: '19:10', code: 'IE2-MAE2/01', full_name: 'Mathematics 2 Exercises', location: 'BT7 8.61', instructors: 'Maesaka', weeks: '43,45,47,49,51,3', weeks_array: expandWeeks('43,45,47,49,51,3'), module_type: 'math', group: '01' },
  { semester: 'IE2', day: 'Tuesday', start_time: '15:55', end_time: '17:25', code: 'IE2-MAE2/02', full_name: 'Mathematics 2 Exercises', location: 'BT7 8.61', instructors: 'Maesaka', weeks: '43,45,47,49,51,3', weeks_array: expandWeeks('43,45,47,49,51,3'), module_type: 'math', group: '02' },
  
  // IE2 - Electrical Engineering 2 (EE2) - Lecture  
  { semester: 'IE2', day: 'Wednesday', start_time: '09:55', end_time: '11:25', code: 'IE2-EE2', full_name: 'Electrical Engineering 2', location: 'Stein94 0.02', instructors: 'Lehmann', weeks: '42-51,2', weeks_array: expandWeeks('42-51,2'), module_type: 'electronics' },
  
  // IE2 - Electrical Engineering 2 Lab (EEL2)
  { semester: 'IE2', day: 'Wednesday', start_time: '12:10', end_time: '13:40', code: 'IE2-EEL2/01', full_name: 'Electrical Engineering 2 Lab', location: 'BT7 5.01', instructors: 'Lehmann, Wittmar', weeks: '44', weeks_array: expandWeeks('44'), module_type: 'electronics', group: '01' },
  { semester: 'IE2', day: 'Wednesday', start_time: '12:10', end_time: '15:40', code: 'IE2-EEL2/01', full_name: 'Electrical Engineering 2 Lab', location: 'BT7 5.01', instructors: 'Lehmann, Wittmar', weeks: '46,49,2', weeks_array: expandWeeks('46,49,2'), module_type: 'electronics', group: '01' },
  { semester: 'IE2', day: 'Wednesday', start_time: '14:10', end_time: '15:40', code: 'IE2-EEL2/02', full_name: 'Electrical Engineering 2 Lab', location: 'BT7 5.01', instructors: 'Lehmann, Wittmar', weeks: '44', weeks_array: expandWeeks('44'), module_type: 'electronics', group: '02' },
  { semester: 'IE2', day: 'Wednesday', start_time: '14:10', end_time: '17:25', code: 'IE2-EEL2/02', full_name: 'Electrical Engineering 2 Lab', location: 'BT7 5.01', instructors: 'Lehmann, Wittmar', weeks: '47,50,3', weeks_array: expandWeeks('47,50,3'), module_type: 'electronics', group: '02' },
  { semester: 'IE2', day: 'Wednesday', start_time: '15:55', end_time: '17:25', code: 'IE2-EEL2/03', full_name: 'Electrical Engineering 2 Lab', location: 'BT7 5.01', instructors: 'Lehmann, Wittmar', weeks: '45', weeks_array: expandWeeks('45'), module_type: 'electronics', group: '03' },
  { semester: 'IE2', day: 'Wednesday', start_time: '15:55', end_time: '19:10', code: 'IE2-EEL2/03', full_name: 'Electrical Engineering 2 Lab', location: 'BT7 5.01', instructors: 'Lehmann, Wittmar', weeks: '48,51,4', weeks_array: expandWeeks('48,51,4'), module_type: 'electronics', group: '03' },
  
  // IE2 - Electronics 1 (EL1) - Lecture
  { semester: 'IE2', day: 'Wednesday', start_time: '08:10', end_time: '09:40', code: 'IE2-EL1', full_name: 'Electronics 1', location: 'Stein94 0.02', instructors: 'Haase', weeks: '42-51,2', weeks_array: expandWeeks('42-51,2'), module_type: 'electronics' },
  
  // IE2 - Electronics 1 Lab (ELL1)
  { semester: 'IE2', day: 'Monday', start_time: '08:10', end_time: '09:40', code: 'IE2-ELL1/01', full_name: 'Electronics 1 Lab', location: 'BT7 5.05', instructors: 'Al Hajsaeed, Kruse', weeks: '45', weeks_array: expandWeeks('45'), module_type: 'electronics', group: '01' },
  { semester: 'IE2', day: 'Tuesday', start_time: '08:10', end_time: '11:25', code: 'IE2-ELL1/01', full_name: 'Electronics 1 Lab', location: 'BT7 5.05', instructors: 'Al Hajsaeed, Kruse', weeks: '47,50,3', weeks_array: expandWeeks('47,50,3'), module_type: 'electronics', group: '01' },
  { semester: 'IE2', day: 'Monday', start_time: '08:10', end_time: '09:40', code: 'IE2-ELL1/02', full_name: 'Electronics 1 Lab', location: 'BT7 5.05', instructors: 'Al Hajsaeed, Lehmann', weeks: '45', weeks_array: expandWeeks('45'), module_type: 'electronics', group: '02' },
  { semester: 'IE2', day: 'Tuesday', start_time: '09:55', end_time: '13:00', code: 'IE2-ELL1/02', full_name: 'Electronics 1 Lab', location: 'BT7 5.05', instructors: 'Al Hajsaeed, Lehmann', weeks: '48,51,4', weeks_array: expandWeeks('48,51,4'), module_type: 'electronics', group: '02' },
  { semester: 'IE2', day: 'Tuesday', start_time: '12:10', end_time: '13:40', code: 'IE2-ELL1/03', full_name: 'Electronics 1 Lab', location: 'BT7 5.05', instructors: 'Al Hajsaeed, Lehmann', weeks: '44', weeks_array: expandWeeks('44'), module_type: 'electronics', group: '03' },
  { semester: 'IE2', day: 'Tuesday', start_time: '12:10', end_time: '15:40', code: 'IE2-ELL1/03', full_name: 'Electronics 1 Lab', location: 'BT7 5.05', instructors: 'Al Hajsaeed, Lehmann', weeks: '46,49,2', weeks_array: expandWeeks('46,49,2'), module_type: 'electronics', group: '03' },
  
  // IE2 - Software Construction 2 (SO2) - Lecture
  { semester: 'IE2', day: 'Wednesday', start_time: '15:55', end_time: '19:10', code: 'IE2-SO2', full_name: 'Software Construction 2', location: 'BT7 12.60', instructors: 'Antosch', weeks: '42-51', weeks_array: expandWeeks('42-51'), module_type: 'software' },
  { semester: 'IE2', day: 'Wednesday', start_time: '15:55', end_time: '19:10', code: 'IE2-SO2', full_name: 'Software Construction 2', location: 'BT7 12.60', instructors: 'Antosch', weeks: '2', weeks_array: expandWeeks('2'), module_type: 'software' },
  
  // IE2 - Software Construction 2 Lab (SOL2)
  { semester: 'IE2', day: 'Monday', start_time: '09:55', end_time: '11:25', code: 'IE2-SOL2/01', full_name: 'Software Construction 2 Lab', location: 'BT7 13.60', instructors: 'Yildirim, Moldenhauer', weeks: '45', weeks_array: expandWeeks('45'), module_type: 'software', group: '01' },
  { semester: 'IE2', day: 'Monday', start_time: '08:10', end_time: '11:25', code: 'IE2-SOL2/01', full_name: 'Software Construction 2 Lab', location: 'BT7 13.60', instructors: 'Yildirim, Moldenhauer', weeks: '48,51,4', weeks_array: expandWeeks('48,51,4'), module_type: 'software', group: '01' },
  { semester: 'IE2', day: 'Monday', start_time: '08:10', end_time: '09:40', code: 'IE2-SOL2/02', full_name: 'Software Construction 2 Lab', location: 'BT7 13.60', instructors: 'Yildirim, Moldenhauer', weeks: '44', weeks_array: expandWeeks('44'), module_type: 'software', group: '02' },
  { semester: 'IE2', day: 'Monday', start_time: '08:10', end_time: '11:25', code: 'IE2-SOL2/02', full_name: 'Software Construction 2 Lab', location: 'BT7 13.60', instructors: 'Yildirim, Moldenhauer', weeks: '46,49,2', weeks_array: expandWeeks('46,49,2'), module_type: 'software', group: '02' },
  { semester: 'IE2', day: 'Monday', start_time: '09:55', end_time: '11:25', code: 'IE2-SOL2/03', full_name: 'Software Construction 2 Lab', location: 'BT7 13.60', instructors: 'Yildirim, Moldenhauer', weeks: '44', weeks_array: expandWeeks('44'), module_type: 'software', group: '03' },
  { semester: 'IE2', day: 'Monday', start_time: '08:10', end_time: '11:25', code: 'IE2-SOL2/03', full_name: 'Software Construction 2 Lab', location: 'BT7 13.60', instructors: 'Yildirim, Moldenhauer', weeks: '47,50,3', weeks_array: expandWeeks('47,50,3'), module_type: 'software', group: '03' },
  
  // IE2 - Intercultural Competence (IC)
  { semester: 'IE2', day: 'Tuesday', start_time: '12:10', end_time: '15:40', code: 'IE2-IC/01', full_name: 'Intercultural Competence', location: 'BT7 8.61', instructors: 'Shook', weeks: '43,45,47,49,51', weeks_array: expandWeeks('43,45,47,49,51'), module_type: 'economics', group: '01' },
  { semester: 'IE2', day: 'Tuesday', start_time: '12:10', end_time: '15:40', code: 'IE2-IC/01', full_name: 'Intercultural Competence', location: 'BT7 6.60', instructors: 'Shook', weeks: '48', weeks_array: expandWeeks('48'), module_type: 'economics', group: '01' },
  { semester: 'IE2', day: 'Tuesday', start_time: '12:10', end_time: '15:40', code: 'IE2-IC/01', full_name: 'Intercultural Competence', location: 'BT7 6.60', instructors: 'Shook', weeks: '3-4', weeks_array: expandWeeks('3-4'), module_type: 'economics', group: '01' },
  { semester: 'IE2', day: 'Tuesday', start_time: '12:10', end_time: '15:40', code: 'IE2-IC/02', full_name: 'Intercultural Competence', location: 'BT7 8.61', instructors: 'Shook', weeks: '42,44,46,50,2', weeks_array: expandWeeks('42,44,46,50,2'), module_type: 'economics', group: '02' },
  { semester: 'IE2', day: 'Tuesday', start_time: '12:10', end_time: '15:40', code: 'IE2-IC/02', full_name: 'Intercultural Competence', location: 'BT7 6.60', instructors: 'Shook', weeks: '48', weeks_array: expandWeeks('48'), module_type: 'economics', group: '02' },
  { semester: 'IE2', day: 'Tuesday', start_time: '12:10', end_time: '15:40', code: 'IE2-IC/02', full_name: 'Intercultural Competence', location: 'BT7 6.60', instructors: 'Shook', weeks: '3-4', weeks_array: expandWeeks('3-4'), module_type: 'economics', group: '02' },

  // ============ IE3 - Semester 3 ============
  
  // IE3 - Signals and Systems 1 (SS1) - Lecture
  { semester: 'IE3', day: 'Monday', start_time: '12:10', end_time: '15:40', code: 'IE3-SS1', full_name: 'Signals and Systems 1', location: 'Stift69 106', instructors: 'Lehmann', weeks: '41-51', weeks_array: expandWeeks('41-51'), module_type: 'signals' },
  
  // IE3 - Signals and Systems 1 Lab (SSL1)
  { semester: 'IE3', day: 'Wednesday', start_time: '08:10', end_time: '09:40', code: 'IE3-SSL1/01', full_name: 'Signals and Systems 1 Lab', location: 'BT7 13.60', instructors: 'Lehmann', weeks: '44', weeks_array: expandWeeks('44'), module_type: 'signals', group: '01' },
  { semester: 'IE3', day: 'Thursday', start_time: '08:10', end_time: '11:25', code: 'IE3-SSL1/01', full_name: 'Signals and Systems 1 Lab', location: 'BT7 13.60', instructors: 'Lehmann', weeks: '46,49,2', weeks_array: expandWeeks('46,49,2'), module_type: 'signals', group: '01' },
  { semester: 'IE3', day: 'Wednesday', start_time: '09:55', end_time: '11:25', code: 'IE3-SSL1/02', full_name: 'Signals and Systems 1 Lab', location: 'BT7 13.60', instructors: 'Lehmann', weeks: '44', weeks_array: expandWeeks('44'), module_type: 'signals', group: '02' },
  { semester: 'IE3', day: 'Thursday', start_time: '08:10', end_time: '11:25', code: 'IE3-SSL1/02', full_name: 'Signals and Systems 1 Lab', location: 'BT7 13.60', instructors: 'Lehmann', weeks: '47,50,3', weeks_array: expandWeeks('47,50,3'), module_type: 'signals', group: '02' },
  { semester: 'IE3', day: 'Thursday', start_time: '09:55', end_time: '11:25', code: 'IE3-SSL1/03', full_name: 'Signals and Systems 1 Lab', location: 'BT7 13.60', instructors: 'Lehmann', weeks: '45', weeks_array: expandWeeks('45'), module_type: 'signals', group: '03' },
  { semester: 'IE3', day: 'Thursday', start_time: '08:10', end_time: '11:25', code: 'IE3-SSL1/03', full_name: 'Signals and Systems 1 Lab', location: 'BT7 13.60', instructors: 'Lehmann', weeks: '48,51,4', weeks_array: expandWeeks('48,51,4'), module_type: 'signals', group: '03' },
  
  // IE3 - Electronics 2 (EL2) - Lecture
  { semester: 'IE3', day: 'Tuesday', start_time: '15:55', end_time: '19:10', code: 'IE3-EL2', full_name: 'Electronics 2', location: 'BT7 6.60', instructors: 'Radt', weeks: '41-51,2-4', weeks_array: expandWeeks('41-51,2-4'), module_type: 'electronics' },
  
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
  { semester: 'IE4', day: 'Friday', start_time: '12:10', end_time: '15:40', code: 'IE4-SS2', full_name: 'Signals and Systems 2', location: 'BT7 6.60', instructors: 'Lange', weeks: '41-51', weeks_array: expandWeeks('41-51'), module_type: 'signals' },
  
  // IE4 - Signals and Systems 2 Lab (SSL2)
  { semester: 'IE4', day: 'Thursday', start_time: '14:10', end_time: '15:40', code: 'IE4-SSL2/01', full_name: 'Signals and Systems 2 Lab', location: 'BT7 13.65', instructors: 'Lange', weeks: '45', weeks_array: expandWeeks('45'), module_type: 'signals', group: '01' },
  { semester: 'IE4', day: 'Thursday', start_time: '12:10', end_time: '15:40', code: 'IE4-SSL2/01', full_name: 'Signals and Systems 2 Lab', location: 'BT7 13.65', instructors: 'Lange', weeks: '48,51,4', weeks_array: expandWeeks('48,51,4'), module_type: 'signals', group: '01' },
  { semester: 'IE4', day: 'Thursday', start_time: '09:55', end_time: '11:25', code: 'IE4-SSL2/02', full_name: 'Signals and Systems 2 Lab', location: 'BT7 5.65', instructors: 'Lange', weeks: '45', weeks_array: expandWeeks('45'), module_type: 'signals', group: '02' },
  { semester: 'IE4', day: 'Thursday', start_time: '12:10', end_time: '15:40', code: 'IE4-SSL2/02', full_name: 'Signals and Systems 2 Lab', location: 'BT7 13.65', instructors: 'Lange', weeks: '46,49,2', weeks_array: expandWeeks('46,49,2'), module_type: 'signals', group: '02' },
  { semester: 'IE4', day: 'Thursday', start_time: '08:10', end_time: '09:40', code: 'IE4-SSL2/03', full_name: 'Signals and Systems 2 Lab', location: 'BT7 5.65', instructors: 'Lange', weeks: '45', weeks_array: expandWeeks('45'), module_type: 'signals', group: '03' },
  { semester: 'IE4', day: 'Thursday', start_time: '12:10', end_time: '15:40', code: 'IE4-SSL2/03', full_name: 'Signals and Systems 2 Lab', location: 'BT7 13.65', instructors: 'Lange', weeks: '47,50,3', weeks_array: expandWeeks('47,50,3'), module_type: 'signals', group: '03' },
  
  // IE4 - Digital Systems (DS) - Lecture
  { semester: 'IE4', day: 'Wednesday', start_time: '12:10', end_time: '15:40', code: 'IE4-DS', full_name: 'Digital Systems', location: 'BT5 1.13', instructors: 'Schulz', weeks: '41', weeks_array: expandWeeks('41'), module_type: 'digital' },
  { semester: 'IE4', day: 'Wednesday', start_time: '12:10', end_time: '15:40', code: 'IE4-DS', full_name: 'Digital Systems', location: 'BT7 6.60', instructors: 'Schulz', weeks: '42-51', weeks_array: expandWeeks('42-51'), module_type: 'digital' },
  
  // IE4 - Digital Systems Lab (DSL)
  { semester: 'IE4', day: 'Thursday', start_time: '09:55', end_time: '11:25', code: 'IE4-DSL/01', full_name: 'Digital Systems Lab', location: 'BT7 8.01', instructors: 'Schulz, Gassinez', weeks: '45', weeks_array: expandWeeks('45'), module_type: 'digital', group: '01' },
  { semester: 'IE4', day: 'Thursday', start_time: '08:10', end_time: '11:25', code: 'IE4-DSL/01', full_name: 'Digital Systems Lab', location: 'BT7 8.01', instructors: 'Schulz, Gassinez', weeks: '46,49,2', weeks_array: expandWeeks('46,49,2'), module_type: 'digital', group: '01' },
  { semester: 'IE4', day: 'Thursday', start_time: '08:10', end_time: '09:40', code: 'IE4-DSL/02', full_name: 'Digital Systems Lab', location: 'BT7 8.01', instructors: 'Schulz, Gassinez', weeks: '45', weeks_array: expandWeeks('45'), module_type: 'digital', group: '02' },
  { semester: 'IE4', day: 'Thursday', start_time: '08:10', end_time: '11:25', code: 'IE4-DSL/02', full_name: 'Digital Systems Lab', location: 'BT7 8.01', instructors: 'Schulz, Gassinez', weeks: '47,50,3', weeks_array: expandWeeks('47,50,3'), module_type: 'digital', group: '02' },
  { semester: 'IE4', day: 'Thursday', start_time: '09:55', end_time: '11:25', code: 'IE4-DSL/03', full_name: 'Digital Systems Lab', location: 'BT7 8.01', instructors: 'Schulz, Gassinez', weeks: '44', weeks_array: expandWeeks('44'), module_type: 'digital', group: '03' },
  { semester: 'IE4', day: 'Thursday', start_time: '08:10', end_time: '11:25', code: 'IE4-DSL/03', full_name: 'Digital Systems Lab', location: 'BT7 8.01', instructors: 'Schulz, Gassinez', weeks: '48,51,4', weeks_array: expandWeeks('48,51,4'), module_type: 'digital', group: '03' },
  { semester: 'IE4', day: 'Monday', start_time: '08:10', end_time: '11:25', code: 'IE4-DSL/04', full_name: 'Digital Systems Lab', location: 'BT7 8.01', instructors: 'Schulz, Gassinez', weeks: '48,51,4', weeks_array: expandWeeks('48,51,4'), module_type: 'digital', group: '04' },
  { semester: 'IE4', day: 'Thursday', start_time: '08:10', end_time: '09:40', code: 'IE4-DSL/04', full_name: 'Digital Systems Lab', location: 'BT7 8.01', instructors: 'Schulz, Gassinez', weeks: '44', weeks_array: expandWeeks('44'), module_type: 'digital', group: '04' },
  
  // IE4 - Microcontroller (MC) - Lecture
  { semester: 'IE4', day: 'Tuesday', start_time: '08:10', end_time: '11:25', code: 'IE4-MC', full_name: 'Microcontrollers', location: 'BT7 10.65', instructors: 'Buczek, Edeler', weeks: '41-51,2-4', weeks_array: expandWeeks('41-51,2-4'), module_type: 'microcontroller' },
  
  // IE4 - Microcontroller Lab (MCL)
  { semester: 'IE4', day: 'Wednesday', start_time: '08:10', end_time: '11:25', code: 'IE4-MCL/01', full_name: 'Microcontrollers Lab', location: 'BT7 8.80', instructors: 'Schröder, Haarring', weeks: '45,47,49,51,3', weeks_array: expandWeeks('45,47,49,51,3'), module_type: 'microcontroller', group: '01' },
  { semester: 'IE4', day: 'Wednesday', start_time: '08:10', end_time: '11:25', code: 'IE4-MCL/02', full_name: 'Microcontrollers Lab', location: 'BT7 8.80', instructors: 'Schröder, Haarring', weeks: '46,48,50,2,4', weeks_array: expandWeeks('46,48,50,2,4'), module_type: 'microcontroller', group: '02' },
  { semester: 'IE4', day: 'Monday', start_time: '08:10', end_time: '11:25', code: 'IE4-MCL/03', full_name: 'Microcontrollers Lab', location: 'BT7 8.80', instructors: 'Schröder, Haarring', weeks: '45,47,49,51,3', weeks_array: expandWeeks('45,47,49,51,3'), module_type: 'microcontroller', group: '03' },
  
  // IE4 - Software Engineering (SE) - Lecture
  { semester: 'IE4', day: 'Monday', start_time: '15:55', end_time: '19:10', code: 'IE4-SE', full_name: 'Software Engineering', location: 'BT7 14.65', instructors: 'Eger', weeks: '41', weeks_array: expandWeeks('41'), module_type: 'software' },
  { semester: 'IE4', day: 'Monday', start_time: '15:55', end_time: '19:10', code: 'IE4-SE', full_name: 'Software Engineering', location: 'BT7 12.60', instructors: 'Eger', weeks: '42-50,2', weeks_array: expandWeeks('42-50,2'), module_type: 'software' },
  { semester: 'IE4', day: 'Monday', start_time: '15:55', end_time: '19:10', code: 'IE4-SE', full_name: 'Software Engineering', location: 'BT7 12.60', instructors: 'Eger', weeks: '51', weeks_array: expandWeeks('51'), module_type: 'software' },
  
  // IE4 - Software Engineering Lab (SEL)
  { semester: 'IE4', day: 'Tuesday', start_time: '14:10', end_time: '15:40', code: 'IE4-SEL/01', full_name: 'Software Engineering Lab', location: 'BT7 13.65', instructors: 'Eger', weeks: '44', weeks_array: expandWeeks('44'), module_type: 'software', group: '01' },
  { semester: 'IE4', day: 'Tuesday', start_time: '12:10', end_time: '15:40', code: 'IE4-SEL/01', full_name: 'Software Engineering Lab', location: 'BT7 13.65', instructors: 'Eger', weeks: '46,49,2', weeks_array: expandWeeks('46,49,2'), module_type: 'software', group: '01' },
  { semester: 'IE4', day: 'Tuesday', start_time: '12:10', end_time: '13:40', code: 'IE4-SEL/02', full_name: 'Software Engineering Lab', location: 'BT7 13.65', instructors: 'Eger', weeks: '44', weeks_array: expandWeeks('44'), module_type: 'software', group: '02' },
  { semester: 'IE4', day: 'Tuesday', start_time: '12:10', end_time: '15:40', code: 'IE4-SEL/02', full_name: 'Software Engineering Lab', location: 'BT7 13.65', instructors: 'Eger', weeks: '47,50,3', weeks_array: expandWeeks('47,50,3'), module_type: 'software', group: '02' },
  { semester: 'IE4', day: 'Tuesday', start_time: '14:10', end_time: '15:40', code: 'IE4-SEL/03', full_name: 'Software Engineering Lab', location: 'BT7 5.65', instructors: 'Eger', weeks: '45', weeks_array: expandWeeks('45'), module_type: 'software', group: '03' },
  { semester: 'IE4', day: 'Tuesday', start_time: '12:10', end_time: '15:40', code: 'IE4-SEL/03', full_name: 'Software Engineering Lab', location: 'BT7 13.65', instructors: 'Eger', weeks: '48,51,4', weeks_array: expandWeeks('48,51,4'), module_type: 'software', group: '03' },
  { semester: 'IE4', day: 'Tuesday', start_time: '12:10', end_time: '13:40', code: 'IE4-SEL/04', full_name: 'Software Engineering Lab', location: 'BT7 5.65', instructors: 'Eger', weeks: '45', weeks_array: expandWeeks('45'), module_type: 'software', group: '04' },
  { semester: 'IE4', day: 'Thursday', start_time: '15:55', end_time: '19:10', code: 'IE4-SEL/04', full_name: 'Software Engineering Lab', location: 'BT7 13.65', instructors: 'Eger', weeks: '48,51,4', weeks_array: expandWeeks('48,51,4'), module_type: 'software', group: '04' },
  
  // IE4 - Databases (DB) - Lecture
  { semester: 'IE4', day: 'Monday', start_time: '12:10', end_time: '15:40', code: 'IE4-DB', full_name: 'Databases', location: 'BT7 10.60', instructors: 'Roose, Köpcke', weeks: '41-50,2', weeks_array: expandWeeks('41-50,2'), module_type: 'database' },
  { semester: 'IE4', day: 'Monday', start_time: '12:10', end_time: '15:40', code: 'IE4-DB', full_name: 'Databases', location: 'BT7 10.60', instructors: 'Roose, Köpcke', weeks: '51', weeks_array: expandWeeks('51'), module_type: 'database' },
  
  // IE4 - Databases Lab (DBL)
  { semester: 'IE4', day: 'Monday', start_time: '08:10', end_time: '09:40', code: 'IE4-DBL/01', full_name: 'Databases Lab', location: 'BT7 13.65', instructors: 'Köpcke, Roose', weeks: '45', weeks_array: expandWeeks('45'), module_type: 'database', group: '01' },
  { semester: 'IE4', day: 'Monday', start_time: '08:10', end_time: '11:25', code: 'IE4-DBL/01', full_name: 'Databases Lab', location: 'BT7 13.65', instructors: 'Köpcke, Roose', weeks: '46,49,2', weeks_array: expandWeeks('46,49,2'), module_type: 'database', group: '01' },
  { semester: 'IE4', day: 'Monday', start_time: '09:55', end_time: '11:25', code: 'IE4-DBL/02', full_name: 'Databases Lab', location: 'BT7 13.65', instructors: 'Köpcke, Roose', weeks: '45', weeks_array: expandWeeks('45'), module_type: 'database', group: '02' },
  { semester: 'IE4', day: 'Monday', start_time: '08:10', end_time: '11:25', code: 'IE4-DBL/02', full_name: 'Databases Lab', location: 'BT7 13.65', instructors: 'Köpcke, Roose', weeks: '47,50,3', weeks_array: expandWeeks('47,50,3'), module_type: 'database', group: '02' },
  { semester: 'IE4', day: 'Thursday', start_time: '12:10', end_time: '13:40', code: 'IE4-DBL/03', full_name: 'Databases Lab', location: 'BT7 13.65', instructors: 'Herster', weeks: '45', weeks_array: expandWeeks('45'), module_type: 'database', group: '03' },
  { semester: 'IE4', day: 'Wednesday', start_time: '08:10', end_time: '11:25', code: 'IE4-DBL/03', full_name: 'Databases Lab', location: 'BT7 13.60', instructors: 'Herster', weeks: '48,51,4', weeks_array: expandWeeks('48,51,4'), module_type: 'database', group: '03' },
  
  // IE3 - Signals and Systems 1 (SS1) - Lecture
  { semester: 'IE3', day: 'Monday', start_time: '12:10', end_time: '15:40', code: 'IE3-SS1', full_name: 'Signals and Systems 1', location: 'Stift69 106', instructors: 'Lehmann', weeks: '41-51', weeks_array: expandWeeks('41-51'), module_type: 'signals' },
  
  // IE3 - Signals and Systems 1 Lab (SSL1)
  { semester: 'IE3', day: 'Wednesday', start_time: '08:10', end_time: '09:40', code: 'IE3-SSL1/01', full_name: 'Signals and Systems 1 Lab', location: 'BT7 13.60', instructors: 'Lehmann', weeks: '44', weeks_array: expandWeeks('44'), module_type: 'signals', group: '01' },
  { semester: 'IE3', day: 'Thursday', start_time: '08:10', end_time: '11:25', code: 'IE3-SSL1/01', full_name: 'Signals and Systems 1 Lab', location: 'BT7 13.60', instructors: 'Lehmann', weeks: '46,49,2', weeks_array: expandWeeks('46,49,2'), module_type: 'signals', group: '01' },
  { semester: 'IE3', day: 'Wednesday', start_time: '09:55', end_time: '11:25', code: 'IE3-SSL1/02', full_name: 'Signals and Systems 1 Lab', location: 'BT7 13.60', instructors: 'Lehmann', weeks: '44', weeks_array: expandWeeks('44'), module_type: 'signals', group: '02' },
  { semester: 'IE3', day: 'Thursday', start_time: '08:10', end_time: '11:25', code: 'IE3-SSL1/02', full_name: 'Signals and Systems 1 Lab', location: 'BT7 13.60', instructors: 'Lehmann', weeks: '47,50,3', weeks_array: expandWeeks('47,50,3'), module_type: 'signals', group: '02' },
  { semester: 'IE3', day: 'Thursday', start_time: '09:55', end_time: '11:25', code: 'IE3-SSL1/03', full_name: 'Signals and Systems 1 Lab', location: 'BT7 13.60', instructors: 'Lehmann', weeks: '45', weeks_array: expandWeeks('45'), module_type: 'signals', group: '03' },
  { semester: 'IE3', day: 'Thursday', start_time: '08:10', end_time: '11:25', code: 'IE3-SSL1/03', full_name: 'Signals and Systems 1 Lab', location: 'BT7 13.60', instructors: 'Lehmann', weeks: '48,51,4', weeks_array: expandWeeks('48,51,4'), module_type: 'signals', group: '03' },
  
  // IE3 - Electronics 2 (EL2) - Lecture
  { semester: 'IE3', day: 'Tuesday', start_time: '15:55', end_time: '19:10', code: 'IE3-EL2', full_name: 'Electronics 2', location: 'BT7 6.60', instructors: 'Radt', weeks: '41-51,2-4', weeks_array: expandWeeks('41-51,2-4'), module_type: 'electronics' },
  
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
  
  // IE2 - Mathematics 2 (MA2) - Lectures
  { semester: 'IE2', day: 'Monday', start_time: '12:10', end_time: '15:40', code: 'IE2-MA2', full_name: 'Mathematics 2', location: 'BT5 1.13', instructors: 'Neumann', weeks: '42-51,2-4', weeks_array: expandWeeks('42-51,2-4'), module_type: 'math' },
  { semester: 'IE2', day: 'Friday', start_time: '08:10', end_time: '11:25', code: 'IE2-MA2', full_name: 'Mathematics 2', location: 'Stein94 0.02', instructors: 'Neumann', weeks: '46,48,50,2', weeks_array: expandWeeks('46,48,50,2'), module_type: 'math' },
  
  // IE2 - Mathematics 2 Exercises (MAE2)
  { semester: 'IE2', day: 'Tuesday', start_time: '17:40', end_time: '19:10', code: 'IE2-MAE2/01', full_name: 'Mathematics 2 Exercises', location: 'BT7 8.61', instructors: 'Maesaka', weeks: '43,45,47,49,51,3', weeks_array: expandWeeks('43,45,47,49,51,3'), module_type: 'math', group: '01' },
  { semester: 'IE2', day: 'Tuesday', start_time: '15:55', end_time: '17:25', code: 'IE2-MAE2/02', full_name: 'Mathematics 2 Exercises', location: 'BT7 8.61', instructors: 'Maesaka', weeks: '43,45,47,49,51,3', weeks_array: expandWeeks('43,45,47,49,51,3'), module_type: 'math', group: '02' },
  
  // IE2 - Software Construction 2 (SO2) - Lecture
  { semester: 'IE2', day: 'Wednesday', start_time: '15:55', end_time: '19:10', code: 'IE2-SO2', full_name: 'Software Construction 2', location: 'BT7 12.60', instructors: 'Antosch', weeks: '42-51', weeks_array: expandWeeks('42-51'), module_type: 'software' },
  { semester: 'IE2', day: 'Wednesday', start_time: '15:55', end_time: '19:10', code: 'IE2-SO2', full_name: 'Software Construction 2', location: 'BT7 12.60', instructors: 'Antosch', weeks: '2', weeks_array: expandWeeks('2'), module_type: 'software' },
  
  // IE2 - Software Construction 2 Lab (SOL2)
  { semester: 'IE2', day: 'Monday', start_time: '09:55', end_time: '11:25', code: 'IE2-SOL2/01', full_name: 'Software Construction 2 Lab', location: 'BT7 13.60', instructors: 'Yildirim, Moldenhauer', weeks: '45', weeks_array: expandWeeks('45'), module_type: 'software', group: '01' },
  { semester: 'IE2', day: 'Monday', start_time: '08:10', end_time: '11:25', code: 'IE2-SOL2/01', full_name: 'Software Construction 2 Lab', location: 'BT7 13.60', instructors: 'Yildirim, Moldenhauer', weeks: '48,51,4', weeks_array: expandWeeks('48,51,4'), module_type: 'software', group: '01' },
  { semester: 'IE2', day: 'Monday', start_time: '08:10', end_time: '09:40', code: 'IE2-SOL2/02', full_name: 'Software Construction 2 Lab', location: 'BT7 13.60', instructors: 'Yildirim, Moldenhauer', weeks: '44', weeks_array: expandWeeks('44'), module_type: 'software', group: '02' },
  { semester: 'IE2', day: 'Monday', start_time: '08:10', end_time: '11:25', code: 'IE2-SOL2/02', full_name: 'Software Construction 2 Lab', location: 'BT7 13.60', instructors: 'Yildirim, Moldenhauer', weeks: '46,49,2', weeks_array: expandWeeks('46,49,2'), module_type: 'software', group: '02' },
  { semester: 'IE2', day: 'Monday', start_time: '09:55', end_time: '11:25', code: 'IE2-SOL2/03', full_name: 'Software Construction 2 Lab', location: 'BT7 13.60', instructors: 'Yildirim, Moldenhauer', weeks: '44', weeks_array: expandWeeks('44'), module_type: 'software', group: '03' },
  { semester: 'IE2', day: 'Monday', start_time: '08:10', end_time: '11:25', code: 'IE2-SOL2/03', full_name: 'Software Construction 2 Lab', location: 'BT7 13.60', instructors: 'Yildirim, Moldenhauer', weeks: '47,50,3', weeks_array: expandWeeks('47,50,3'), module_type: 'software', group: '03' },
  
  // IE2 - Intercultural Competence (IC)
  { semester: 'IE2', day: 'Tuesday', start_time: '12:10', end_time: '15:40', code: 'IE2-IC/01', full_name: 'Intercultural Competence', location: 'BT7 8.61', instructors: 'Shook', weeks: '43,45,47,49,51', weeks_array: expandWeeks('43,45,47,49,51'), module_type: 'economics', group: '01' },
  { semester: 'IE2', day: 'Tuesday', start_time: '12:10', end_time: '15:40', code: 'IE2-IC/01', full_name: 'Intercultural Competence', location: 'BT7 6.60', instructors: 'Shook', weeks: '48', weeks_array: expandWeeks('48'), module_type: 'economics', group: '01' },
  { semester: 'IE2', day: 'Tuesday', start_time: '12:10', end_time: '15:40', code: 'IE2-IC/01', full_name: 'Intercultural Competence', location: 'BT7 6.60', instructors: 'Shook', weeks: '3-4', weeks_array: expandWeeks('3-4'), module_type: 'economics', group: '01' },
  { semester: 'IE2', day: 'Tuesday', start_time: '12:10', end_time: '15:40', code: 'IE2-IC/02', full_name: 'Intercultural Competence', location: 'BT7 8.61', instructors: 'Shook', weeks: '42,44,46,50,2', weeks_array: expandWeeks('42,44,46,50,2'), module_type: 'economics', group: '02' },
  { semester: 'IE2', day: 'Tuesday', start_time: '12:10', end_time: '15:40', code: 'IE2-IC/02', full_name: 'Intercultural Competence', location: 'BT7 6.60', instructors: 'Shook', weeks: '48', weeks_array: expandWeeks('48'), module_type: 'economics', group: '02' },
  { semester: 'IE2', day: 'Tuesday', start_time: '12:10', end_time: '15:40', code: 'IE2-IC/02', full_name: 'Intercultural Competence', location: 'BT7 6.60', instructors: 'Shook', weeks: '3-4', weeks_array: expandWeeks('3-4'), module_type: 'economics', group: '02' },
  
  // IE2 - Electronics 1 (EL1) - Lecture
  { semester: 'IE2', day: 'Wednesday', start_time: '08:10', end_time: '09:40', code: 'IE2-EL1', full_name: 'Electronics 1', location: 'Stein94 0.02', instructors: 'Haase', weeks: '42-51,2', weeks_array: expandWeeks('42-51,2'), module_type: 'electronics' },
  
  // IE2 - Electrical Engineering 2 (EE2) - Lecture  
  { semester: 'IE2', day: 'Wednesday', start_time: '09:55', end_time: '11:25', code: 'IE2-EE2', full_name: 'Electrical Engineering 2', location: 'Stein94 0.02', instructors: 'Lehmann', weeks: '42-51,2', weeks_array: expandWeeks('42-51,2'), module_type: 'electronics' },
  
  // IE2 - Electrical Engineering 2 Lab (EEL2)
  { semester: 'IE2', day: 'Wednesday', start_time: '12:10', end_time: '13:40', code: 'IE2-EEL2/01', full_name: 'Electrical Engineering 2 Lab', location: 'BT7 5.01', instructors: 'Lehmann, Wittmar', weeks: '44', weeks_array: expandWeeks('44'), module_type: 'electronics', group: '01' },
  { semester: 'IE2', day: 'Wednesday', start_time: '12:10', end_time: '15:40', code: 'IE2-EEL2/01', full_name: 'Electrical Engineering 2 Lab', location: 'BT7 5.01', instructors: 'Lehmann, Wittmar', weeks: '46,49,2', weeks_array: expandWeeks('46,49,2'), module_type: 'electronics', group: '01' },
  { semester: 'IE2', day: 'Wednesday', start_time: '14:10', end_time: '15:40', code: 'IE2-EEL2/02', full_name: 'Electrical Engineering 2 Lab', location: 'BT7 5.01', instructors: 'Lehmann, Wittmar', weeks: '44', weeks_array: expandWeeks('44'), module_type: 'electronics', group: '02' },
  { semester: 'IE2', day: 'Wednesday', start_time: '14:10', end_time: '17:25', code: 'IE2-EEL2/02', full_name: 'Electrical Engineering 2 Lab', location: 'BT7 5.01', instructors: 'Lehmann, Wittmar', weeks: '47,50,3', weeks_array: expandWeeks('47,50,3'), module_type: 'electronics', group: '02' },
  { semester: 'IE2', day: 'Wednesday', start_time: '15:55', end_time: '17:25', code: 'IE2-EEL2/03', full_name: 'Electrical Engineering 2 Lab', location: 'BT7 5.01', instructors: 'Lehmann, Wittmar', weeks: '45', weeks_array: expandWeeks('45'), module_type: 'electronics', group: '03' },
  { semester: 'IE2', day: 'Wednesday', start_time: '15:55', end_time: '19:10', code: 'IE2-EEL2/03', full_name: 'Electrical Engineering 2 Lab', location: 'BT7 5.01', instructors: 'Lehmann, Wittmar', weeks: '48,51,4', weeks_array: expandWeeks('48,51,4'), module_type: 'electronics', group: '03' },
  
  // IE2 - Electronics 1 Lab (ELL1)
  { semester: 'IE2', day: 'Monday', start_time: '08:10', end_time: '09:40', code: 'IE2-ELL1/01', full_name: 'Electronics 1 Lab', location: 'BT7 5.05', instructors: 'Al Hajsaeed, Kruse', weeks: '45', weeks_array: expandWeeks('45'), module_type: 'electronics', group: '01' },
  { semester: 'IE2', day: 'Tuesday', start_time: '08:10', end_time: '11:25', code: 'IE2-ELL1/01', full_name: 'Electronics 1 Lab', location: 'BT7 5.05', instructors: 'Al Hajsaeed, Kruse', weeks: '47,50,3', weeks_array: expandWeeks('47,50,3'), module_type: 'electronics', group: '01' },
  { semester: 'IE2', day: 'Monday', start_time: '08:10', end_time: '09:40', code: 'IE2-ELL1/02', full_name: 'Electronics 1 Lab', location: 'BT7 5.05', instructors: 'Al Hajsaeed, Lehmann', weeks: '45', weeks_array: expandWeeks('45'), module_type: 'electronics', group: '02' },
  { semester: 'IE2', day: 'Tuesday', start_time: '09:55', end_time: '13:00', code: 'IE2-ELL1/02', full_name: 'Electronics 1 Lab', location: 'BT7 5.05', instructors: 'Al Hajsaeed, Lehmann', weeks: '48,51,4', weeks_array: expandWeeks('48,51,4'), module_type: 'electronics', group: '02' },
  { semester: 'IE2', day: 'Tuesday', start_time: '12:10', end_time: '13:40', code: 'IE2-ELL1/03', full_name: 'Electronics 1 Lab', location: 'BT7 5.05', instructors: 'Al Hajsaeed, Lehmann', weeks: '44', weeks_array: expandWeeks('44'), module_type: 'electronics', group: '03' },
  { semester: 'IE2', day: 'Tuesday', start_time: '12:10', end_time: '15:40', code: 'IE2-ELL1/03', full_name: 'Electronics 1 Lab', location: 'BT7 5.05', instructors: 'Al Hajsaeed, Lehmann', weeks: '46,49,2', weeks_array: expandWeeks('46,49,2'), module_type: 'electronics', group: '03' },
  
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
  
  // IE1 - Mathematics 1 (MA1) - Lectures
  { semester: 'IE1', day: 'Friday', start_time: '12:10', end_time: '15:40', code: 'IE1-MA1', full_name: 'Mathematics 1', location: 'BT7 12.60', instructors: 'Nieder', weeks: '42-43,45-51,2-4', weeks_array: expandWeeks('42-43,45-51,2-4'), module_type: 'math' },
  { semester: 'IE1', day: 'Wednesday', start_time: '12:10', end_time: '15:40', code: 'IE1-MA1', full_name: 'Mathematics 1', location: 'BT5 1.13', instructors: 'Nieder', weeks: '43,45,47,49,51', weeks_array: expandWeeks('43,45,47,49,51'), module_type: 'math' },
  
  // IE1 - Mathematics 1 Exercises (MAE1)
  { semester: 'IE1', day: 'Thursday', start_time: '08:10', end_time: '09:40', code: 'IE1-MAE1/01', full_name: 'Mathematics 1 Exercises', location: 'BT7 10.65', instructors: 'Nieder', weeks: '43,45,47,49,51,3', weeks_array: expandWeeks('43,45,47,49,51,3'), module_type: 'math', group: '01' },
  { semester: 'IE1', day: 'Thursday', start_time: '09:55', end_time: '11:25', code: 'IE1-MAE1/02', full_name: 'Mathematics 1 Exercises', location: 'BT7 10.65', instructors: 'Nieder', weeks: '43,45,47,49,51,3', weeks_array: expandWeeks('43,45,47,49,51,3'), module_type: 'math', group: '02' },
  
  // IE1 - Electrical Engineering 1 (EE1) - Lecture
  { semester: 'IE1', day: 'Friday', start_time: '08:10', end_time: '11:25', code: 'IE1-EE1', full_name: 'Electrical Engineering 1', location: 'BT5 1.13', instructors: 'Hansen', weeks: '42-43,45-51,2-4', weeks_array: expandWeeks('42-43,45-51,2-4'), module_type: 'electronics' },
  
  // IE1 - Electrical Engineering 1 Lab (EEL1)
  { semester: 'IE1', day: 'Monday', start_time: '14:10', end_time: '15:40', code: 'IE1-EEL1/01', full_name: 'Electrical Engineering 1 Lab', location: 'BT7 5.01', instructors: 'Hansen, Wittmar', weeks: '44', weeks_array: expandWeeks('44'), module_type: 'electronics', group: '01' },
  { semester: 'IE1', day: 'Monday', start_time: '12:10', end_time: '15:40', code: 'IE1-EEL1/01', full_name: 'Electrical Engineering 1 Lab', location: 'BT7 5.01', instructors: 'Hansen, Wittmar', weeks: '46,49,2', weeks_array: expandWeeks('46,49,2'), module_type: 'electronics', group: '01' },
  { semester: 'IE1', day: 'Monday', start_time: '12:10', end_time: '13:40', code: 'IE1-EEL1/02', full_name: 'Electrical Engineering 1 Lab', location: 'BT7 5.01', instructors: 'Hansen, Wittmar', weeks: '44', weeks_array: expandWeeks('44'), module_type: 'electronics', group: '02' },
  { semester: 'IE1', day: 'Monday', start_time: '12:10', end_time: '15:40', code: 'IE1-EEL1/02', full_name: 'Electrical Engineering 1 Lab', location: 'BT7 5.01', instructors: 'Hansen, Wittmar', weeks: '47,50,3', weeks_array: expandWeeks('47,50,3'), module_type: 'electronics', group: '02' },
  { semester: 'IE1', day: 'Monday', start_time: '12:10', end_time: '13:40', code: 'IE1-EEL1/03', full_name: 'Electrical Engineering 1 Lab', location: 'BT7 5.01', instructors: 'Hansen, Wittmar', weeks: '45', weeks_array: expandWeeks('45'), module_type: 'electronics', group: '03' },
  { semester: 'IE1', day: 'Monday', start_time: '12:10', end_time: '15:40', code: 'IE1-EEL1/03', full_name: 'Electrical Engineering 1 Lab', location: 'BT7 5.01', instructors: 'Hansen, Wittmar', weeks: '48,51,4', weeks_array: expandWeeks('48,51,4'), module_type: 'electronics', group: '03' },
  
  // IE1 - Software Construction 1 (SO1) - Lecture
  { semester: 'IE1', day: 'Wednesday', start_time: '15:55', end_time: '19:10', code: 'IE1-SO1', full_name: 'Software Construction 1', location: 'BT5 1.13', instructors: 'Hensel', weeks: '42-51,2-4', weeks_array: expandWeeks('42-51,2-4'), module_type: 'software' },
  
  // IE1 - Software Construction 1 Lab (SOL1)
  { semester: 'IE1', day: 'Monday', start_time: '15:55', end_time: '19:10', code: 'IE1-SOL1/01', full_name: 'Software Construction 1 Lab', location: 'BT7 13.65', instructors: 'Hensel', weeks: '45,47,49,51,3', weeks_array: expandWeeks('45,47,49,51,3'), module_type: 'software', group: '01' },
  { semester: 'IE1', day: 'Monday', start_time: '15:55', end_time: '19:10', code: 'IE1-SOL1/02', full_name: 'Software Construction 1 Lab', location: 'BT7 13.65', instructors: 'Hensel', weeks: '46,48,50,2,4', weeks_array: expandWeeks('46,48,50,2,4'), module_type: 'software', group: '02' },
  { semester: 'IE1', day: 'Monday', start_time: '15:55', end_time: '19:10', code: 'IE1-SOL1/03', full_name: 'Software Construction 1 Lab', location: 'BT7 13.60', instructors: 'Schüthe, Orychshenko', weeks: '45,47,49,51,3', weeks_array: expandWeeks('45,47,49,51,3'), module_type: 'software', group: '03' },
  { semester: 'IE1', day: 'Monday', start_time: '15:55', end_time: '19:10', code: 'IE1-SOL1/04', full_name: 'Software Construction 1 Lab', location: 'BT7 13.60', instructors: 'Schüthe, Orychshenko', weeks: '46,48,50,2,4', weeks_array: expandWeeks('46,48,50,2,4'), module_type: 'software', group: '04' },
  
  // IE1 - German (GE)
  { semester: 'IE1', day: 'Thursday', start_time: '09:55', end_time: '11:25', code: 'IE1-GE/01', full_name: 'German', location: 'BT7 14.65', instructors: 'Appel', weeks: '42-51,2-4', weeks_array: expandWeeks('42-51,2-4'), module_type: 'intercultural', group: '01' },
  { semester: 'IE1', day: 'Thursday', start_time: '12:10', end_time: '13:40', code: 'IE1-GE/02', full_name: 'German', location: 'BT7 12.81', instructors: 'Appel', weeks: '42-51,2-4', weeks_array: expandWeeks('42-51,2-4'), module_type: 'intercultural', group: '02' },
  
  // IE1 - Learning and Study Methods Exercises (LSE1)
  { semester: 'IE1', day: 'Tuesday', start_time: '08:10', end_time: '11:25', code: 'IE1-LSE/01', full_name: 'Learning and Study Methods Exercises', location: 'BT7 14.86', instructors: 'McCabe', weeks: '42', weeks_array: expandWeeks('42'), module_type: 'intercultural', group: '01' },
  { semester: 'IE1', day: 'Tuesday', start_time: '12:10', end_time: '15:40', code: 'IE1-LSE/01', full_name: 'Learning and Study Methods Exercises', location: 'BT7 14.65', instructors: 'McCabe', weeks: '43,45,47,49,51,3', weeks_array: expandWeeks('43,45,47,49,51,3'), module_type: 'intercultural', group: '01' },
  { semester: 'IE1', day: 'Tuesday', start_time: '12:10', end_time: '15:40', code: 'IE1-LSE/02', full_name: 'Learning and Study Methods Exercises', location: 'BT7 14.65', instructors: 'McCabe', weeks: '42,44,46,48,50,2,4', weeks_array: expandWeeks('42,44,46,48,50,2,4'), module_type: 'intercultural', group: '02' },
  
  // IE1 - Learning and Study Methods Lab (LSL1)
  { semester: 'IE1', day: 'Thursday', start_time: '15:55', end_time: '19:10', code: 'IE1-LSL/01', full_name: 'Learning and Study Methods Lab', location: 'BT7 12.60', instructors: 'Lapke, Leutelt, Radt', weeks: '43,3', weeks_array: expandWeeks('43,3'), module_type: 'intercultural', group: '01' },
  { semester: 'IE1', day: 'Thursday', start_time: '14:10', end_time: '17:25', code: 'IE1-LSL/02', full_name: 'Learning and Study Methods Lab', location: 'BT7 8.61', instructors: 'Lapke', weeks: '45,47,49,51', weeks_array: expandWeeks('45,47,49,51'), module_type: 'intercultural', group: '02' },
  { semester: 'IE1', day: 'Monday', start_time: '08:10', end_time: '11:25', code: 'IE1-LSL/03', full_name: 'Learning and Study Methods Lab', location: 'Stift69 106', instructors: 'Leutelt', weeks: '45,47,49,51', weeks_array: expandWeeks('45,47,49,51'), module_type: 'intercultural', group: '03' },
  { semester: 'IE1', day: 'Tuesday', start_time: '08:10', end_time: '11:25', code: 'IE1-LSL/04', full_name: 'Learning and Study Methods Lab', location: 'BT7 14.86', instructors: 'Radt', weeks: '45,47,49,51', weeks_array: expandWeeks('45,47,49,51'), module_type: 'intercultural', group: '04' },
  
  // IE2 - Learning and Study Methods Intro Week (LSL2) - Oct 6-11
  { semester: 'IE2', day: 'Monday', start_time: '08:10', end_time: '11:25', code: 'IE1-LSL2', full_name: 'Learning and Study Methods Intro Week', location: 'BT5 1.13', instructors: '', weeks: '41', weeks_array: expandWeeks('41'), module_type: 'intercultural' },
  { semester: 'IE2', day: 'Monday', start_time: '12:10', end_time: '18:00', code: 'IE1-LSL2', full_name: 'Learning and Study Methods Intro Week', location: 'BT7 8.85', instructors: '', weeks: '41', weeks_array: expandWeeks('41'), module_type: 'intercultural' },
  { semester: 'IE2', day: 'Tuesday', start_time: '08:10', end_time: '18:00', code: 'IE1-LSL2', full_name: 'Learning and Study Methods Intro Week', location: 'BT7 8.85', instructors: '', weeks: '41', weeks_array: expandWeeks('41'), module_type: 'intercultural' },
  { semester: 'IE2', day: 'Wednesday', start_time: '08:10', end_time: '18:00', code: 'IE1-LSL2', full_name: 'Learning and Study Methods Intro Week', location: 'BT7 8.85', instructors: '', weeks: '41', weeks_array: expandWeeks('41'), module_type: 'intercultural' },
  { semester: 'IE2', day: 'Thursday', start_time: '08:10', end_time: '18:00', code: 'IE1-LSL2', full_name: 'Learning and Study Methods Intro Week', location: 'BT7 8.85', instructors: '', weeks: '41', weeks_array: expandWeeks('41'), module_type: 'intercultural' },
  { semester: 'IE2', day: 'Friday', start_time: '08:10', end_time: '18:00', code: 'IE1-LSL2', full_name: 'Learning and Study Methods Intro Week', location: 'BT7 8.85', instructors: '', weeks: '41', weeks_array: expandWeeks('41'), module_type: 'intercultural' },
  { semester: 'IE2', day: 'Saturday', start_time: '08:00', end_time: '18:00', code: 'IE1-LSL2', full_name: 'Learning and Study Methods Intro Week', location: 'BT5 1.13', instructors: '', weeks: '41', weeks_array: expandWeeks('41'), module_type: 'intercultural' },

  // IE5 - Scientific and Project Work (SP)
  { semester: 'IE5', day: 'Friday', start_time: '08:10', end_time: '11:25', code: 'IE5-SP', full_name: 'Scientific and Project Work', location: 'BT7 14.86', instructors: 'Becker', weeks: '45-48', weeks_array: expandWeeks('45-48'), module_type: 'intercultural' },
  { semester: 'IE5', day: 'Friday', start_time: '12:10', end_time: '15:40', code: 'IE5-SP', full_name: 'Scientific and Project Work', location: 'BT7 14.86', instructors: 'Becker', weeks: '45-48', weeks_array: expandWeeks('45-48'), module_type: 'intercultural' },
  
  // IE5 - Elective: Architectures of Digital Signal Processing (WP-Rust) - Seminar
  { semester: 'IE5', day: 'Tuesday', start_time: '12:10', end_time: '15:40', code: 'E5-WP-Rust', full_name: 'Elective: Architectures of Digital Signal Processing', location: 'BT7 12.81', instructors: 'Rust', weeks: '41-51,2-4', weeks_array: expandWeeks('41-51,2-4'), module_type: 'signals' },
  
  // IE5 - Elective: Architectures of Digital Signal Processing Lab (WPP-Rust)
  { semester: 'IE5', day: 'Tuesday', start_time: '12:10', end_time: '15:40', code: 'E5-WPP-Rust', full_name: 'Architectures of Digital Signal Processing Lab', location: 'BT7 12.81', instructors: 'Rust', weeks: '47,50,3', weeks_array: expandWeeks('47,50,3'), module_type: 'signals' },
  
  // IE5 - Industrial Placement (IP) - Internship/Praktikum
  // Note: This is typically done off-campus during semester 5 (25.0 Credits)

  // ============ IE6 - Semester 6 ============
  
  // IE6 - Operating Systems (OS) - Monday
  { semester: 'IE6', day: 'Monday', start_time: '08:10', end_time: '11:25', code: 'IE6-OS', full_name: 'Operating Systems', location: 'BT7 8.61', instructors: 'Buczek', weeks: '41', weeks_array: expandWeeks('41'), module_type: 'software' },
  { semester: 'IE6', day: 'Monday', start_time: '08:10', end_time: '11:25', code: 'IE6-OS', full_name: 'Operating Systems', location: 'BT7 8.62', instructors: 'Buczek', weeks: '42-51', weeks_array: expandWeeks('42-51'), module_type: 'software' },
  
  // IE6 - Operating Systems Lab (OSL) - 3 groups
  { semester: 'IE6', day: 'Thursday', start_time: '14:10', end_time: '15:40', code: 'IE6-OSL/01', full_name: 'Operating Systems Lab', location: 'BT7 8.80', instructors: 'Gassinez, Westerkamp', weeks: '44', weeks_array: expandWeeks('44'), module_type: 'software', group: '01' },
  { semester: 'IE6', day: 'Thursday', start_time: '12:10', end_time: '15:40', code: 'IE6-OSL/01', full_name: 'Operating Systems Lab', location: 'BT7 8.80', instructors: 'Gassinez, Westerkamp', weeks: '45,48,2', weeks_array: expandWeeks('45,48,2'), module_type: 'software', group: '01' },
  
  { semester: 'IE6', day: 'Thursday', start_time: '12:10', end_time: '13:40', code: 'IE6-OSL/02', full_name: 'Operating Systems Lab', location: 'BT7 8.80', instructors: 'Gassinez, Westerkamp', weeks: '44', weeks_array: expandWeeks('44'), module_type: 'software', group: '02' },
  { semester: 'IE6', day: 'Thursday', start_time: '12:10', end_time: '15:40', code: 'IE6-OSL/02', full_name: 'Operating Systems Lab', location: 'BT7 8.80', instructors: 'Gassinez, Westerkamp', weeks: '46,49,3', weeks_array: expandWeeks('46,49,3'), module_type: 'software', group: '02' },
  
  { semester: 'IE6', day: 'Thursday', start_time: '12:10', end_time: '13:40', code: 'IE6-OSL/03', full_name: 'Operating Systems Lab', location: 'BT7 8.80', instructors: 'Gassinez, Westerkamp', weeks: '45', weeks_array: expandWeeks('45'), module_type: 'software', group: '03' },
  { semester: 'IE6', day: 'Thursday', start_time: '12:10', end_time: '15:40', code: 'IE6-OSL/03', full_name: 'Operating Systems Lab', location: 'BT7 8.80', instructors: 'Gassinez, Westerkamp', weeks: '47,50,4', weeks_array: expandWeeks('47,50,4'), module_type: 'software', group: '03' },
  
  // IE6 - Bus Systems and Sensors (BU) - Wednesday
  { semester: 'IE6', day: 'Wednesday', start_time: '08:10', end_time: '11:25', code: 'IE6-BU', full_name: 'Bus Systems and Sensors', location: 'Stift69 110', instructors: 'Rettig', weeks: '41-51', weeks_array: expandWeeks('41-51'), module_type: 'electronics' },
  
  // IE6 - Bus Systems and Sensors Lab (BUL) - 3 groups
  { semester: 'IE6', day: 'Thursday', start_time: '08:10', end_time: '09:40', code: 'IE6-BUL/01', full_name: 'Bus Systems and Sensors Lab', location: 'BT7 8.04, 8.65', instructors: 'Rettig', weeks: '45', weeks_array: expandWeeks('45'), module_type: 'electronics', group: '01' },
  { semester: 'IE6', day: 'Tuesday', start_time: '12:10', end_time: '15:40', code: 'IE6-BUL/01', full_name: 'Bus Systems and Sensors Lab', location: 'BT7 8.04, 8.65', instructors: 'Rettig', weeks: '46,49,3', weeks_array: expandWeeks('46,49,3'), module_type: 'electronics', group: '01' },
  
  { semester: 'IE6', day: 'Thursday', start_time: '09:55', end_time: '11:25', code: 'IE6-BUL/02', full_name: 'Bus Systems and Sensors Lab', location: 'BT7 8.04, 8.65', instructors: 'Rettig', weeks: '45', weeks_array: expandWeeks('45'), module_type: 'electronics', group: '02' },
  { semester: 'IE6', day: 'Tuesday', start_time: '12:10', end_time: '15:40', code: 'IE6-BUL/02', full_name: 'Bus Systems and Sensors Lab', location: 'BT7 8.04, 8.65', instructors: 'Rettig', weeks: '47,50,4', weeks_array: expandWeeks('47,50,4'), module_type: 'electronics', group: '02' },
  
  { semester: 'IE6', day: 'Wednesday', start_time: '12:10', end_time: '13:40', code: 'IE6-BUL/03', full_name: 'Bus Systems and Sensors Lab', location: 'BT7 8.04, 8.65', instructors: 'Rettig', weeks: '44', weeks_array: expandWeeks('44'), module_type: 'electronics', group: '03' },
  { semester: 'IE6', day: 'Tuesday', start_time: '12:10', end_time: '15:40', code: 'IE6-BUL/03', full_name: 'Bus Systems and Sensors Lab', location: 'BT7 8.04, 8.65', instructors: 'Rettig', weeks: '45,48,2', weeks_array: expandWeeks('45,48,2'), module_type: 'electronics', group: '03' },
  
  // IE6 - Digital Signal Processing (DP) - Tuesday
  { semester: 'IE6', day: 'Tuesday', start_time: '08:10', end_time: '11:25', code: 'IE6-DP', full_name: 'Digital Signal Processing', location: 'BT7 8.61', instructors: 'Kronauge', weeks: '41-51', weeks_array: expandWeeks('41-51'), module_type: 'signals' },
  
  // IE6 - Digital Signal Processing Lab (DPL) - 3 groups
  { semester: 'IE6', day: 'Thursday', start_time: '12:10', end_time: '13:40', code: 'IE6-DPL/01', full_name: 'Digital Signal Processing Lab', location: 'BT7 8.85', instructors: 'Kronauge, Kupke', weeks: '45', weeks_array: expandWeeks('45'), module_type: 'signals', group: '01' },
  { semester: 'IE6', day: 'Wednesday', start_time: '12:10', end_time: '15:40', code: 'IE6-DPL/01', full_name: 'Digital Signal Processing Lab', location: 'BT7 8.85', instructors: 'Kronauge, Kupke', weeks: '47,50,4', weeks_array: expandWeeks('47,50,4'), module_type: 'signals', group: '01' },
  
  { semester: 'IE6', day: 'Monday', start_time: '12:10', end_time: '13:40', code: 'IE6-DPL/02', full_name: 'Digital Signal Processing Lab', location: 'BT7 8.85', instructors: 'Kronauge, Kupke', weeks: '44', weeks_array: expandWeeks('44'), module_type: 'signals', group: '02' },
  { semester: 'IE6', day: 'Wednesday', start_time: '12:10', end_time: '15:40', code: 'IE6-DPL/02', full_name: 'Digital Signal Processing Lab', location: 'BT7 8.85', instructors: 'Kronauge, Kupke', weeks: '45,48,2', weeks_array: expandWeeks('45,48,2'), module_type: 'signals', group: '02' },
  
  { semester: 'IE6', day: 'Monday', start_time: '14:10', end_time: '15:40', code: 'IE6-DPL/03', full_name: 'Digital Signal Processing Lab', location: 'BT7 8.85', instructors: 'Kronauge, Kupke', weeks: '44', weeks_array: expandWeeks('44'), module_type: 'signals', group: '03' },
  { semester: 'IE6', day: 'Wednesday', start_time: '12:10', end_time: '15:40', code: 'IE6-DPL/03', full_name: 'Digital Signal Processing Lab', location: 'BT7 8.85', instructors: 'Kronauge, Kupke', weeks: '46,49,3', weeks_array: expandWeeks('46,49,3'), module_type: 'signals', group: '03' },
  
  // IE6 - Digital Communication Systems (DC) - Friday
  { semester: 'IE6', day: 'Friday', start_time: '12:10', end_time: '15:40', code: 'IE6-DC', full_name: 'Digital Communication Systems', location: 'BT7 14.05', instructors: 'Schoenen', weeks: '41-51', weeks_array: expandWeeks('41-51'), module_type: 'digital' },
  
  // IE6 - Digital Communication Systems Lab (DCL) - 2 groups
  { semester: 'IE6', day: 'Monday', start_time: '12:10', end_time: '13:40', code: 'IE6-DCL/01', full_name: 'Digital Communication Systems Lab', location: 'BT7 14.85', instructors: 'Neugebauer, Schoenen', weeks: '45', weeks_array: expandWeeks('45'), module_type: 'digital', group: '01' },
  { semester: 'IE6', day: 'Monday', start_time: '12:10', end_time: '15:40', code: 'IE6-DCL/01', full_name: 'Digital Communication Systems Lab', location: 'BT7 14.85', instructors: 'Neugebauer, Schoenen', weeks: '45,48,2', weeks_array: expandWeeks('45,48,2'), module_type: 'digital', group: '01' },
  
  { semester: 'IE6', day: 'Monday', start_time: '14:10', end_time: '15:40', code: 'IE6-DCL/02', full_name: 'Digital Communication Systems Lab', location: 'BT7 14.85', instructors: 'Neugebauer, Schoenen', weeks: '45', weeks_array: expandWeeks('45'), module_type: 'digital', group: '02' },
  { semester: 'IE6', day: 'Monday', start_time: '12:10', end_time: '15:40', code: 'IE6-DCL/02', full_name: 'Digital Communication Systems Lab', location: 'BT7 14.85', instructors: 'Neugebauer, Schoenen', weeks: '46,49,3', weeks_array: expandWeeks('46,49,3'), module_type: 'digital', group: '02' },

  // ============ IE7 - Semester 7 - Electives and Projects ============
  
  // IE7 - Elective: Elektroenergiesysteme (WP-Winzenick) - Friday
  { semester: 'IE7', day: 'Friday', start_time: '12:10', end_time: '15:40', code: 'E7-WP13-Winzenick', full_name: 'Elektroenergiesysteme', location: 'Stift69 107', instructors: 'Winzenick', weeks: '41-51,2-4', weeks_array: expandWeeks('41-51,2-4'), module_type: 'electronics' },
  { semester: 'IE7', day: 'Friday', start_time: '12:10', end_time: '15:40', code: 'E7-WPP13-Winzenick', full_name: 'Elektroenergiesysteme Lab', location: 'Stift69 107', instructors: 'Winzenick', weeks: '46,49,2', weeks_array: expandWeeks('46,49,2'), module_type: 'electronics' },
  
  // IE7 - Elective: Embedded Systems Verification and Test (WP-Schulz) - Friday
  { semester: 'IE7', day: 'Friday', start_time: '12:10', end_time: '15:40', code: 'E7-WP22-Schulz', full_name: 'Embedded Systems Verification and Test', location: 'BT7 14.65', instructors: 'Schulz', weeks: '41,45,46', weeks_array: expandWeeks('41,45,46'), module_type: 'software' },
  { semester: 'IE7', day: 'Thursday', start_time: '15:55', end_time: '19:10', code: 'E7-WP22-Schulz', full_name: 'Embedded Systems Verification and Test', location: 'BT7 8.04', instructors: 'Schulz', weeks: '48,49', weeks_array: expandWeeks('48,49'), module_type: 'software' },
  { semester: 'IE7', day: 'Friday', start_time: '12:10', end_time: '15:40', code: 'E7-WP22-Schulz', full_name: 'Embedded Systems Verification and Test', location: 'BT7 14.65', instructors: 'Schulz', weeks: '2', weeks_array: expandWeeks('2'), module_type: 'software' },
  { semester: 'IE7', day: 'Friday', start_time: '12:10', end_time: '15:40', code: 'E7-WPP22-Schulz', full_name: 'Embedded Systems Verification and Test Lab', location: 'BT7 8.04', instructors: 'Schulz', weeks: '42-51,3-4', weeks_array: expandWeeks('42-51,3-4'), module_type: 'software' },
  { semester: 'IE7', day: 'Friday', start_time: '12:10', end_time: '15:40', code: 'E7-WPP22-Schulz', full_name: 'Embedded Systems Verification and Test Lab', location: 'BT7 8.04', instructors: 'Schulz', weeks: '3', weeks_array: expandWeeks('3'), module_type: 'software' },
  
  // IE7 - Elective: Solar Energy (WP-Titova) - Monday
  { semester: 'IE7', day: 'Monday', start_time: '15:55', end_time: '19:10', code: 'E7-WP25-Titova', full_name: 'Solar Energy', location: 'BT7 8.61', instructors: 'Titova', weeks: '41-51,2-3', weeks_array: expandWeeks('41-51,2-3'), module_type: 'electronics' },
  { semester: 'IE7', day: 'Monday', start_time: '15:55', end_time: '19:10', code: 'E7-WPP25-Titova', full_name: 'Solar Energy Lab', location: 'BT7 8.61', instructors: 'Titova', weeks: '48,51,4', weeks_array: expandWeeks('48,51,4'), module_type: 'electronics' },
  
  // IE7 - Elective: On-board Data Handling (WP-Buczek) - Friday
  { semester: 'IE7', day: 'Friday', start_time: '12:10', end_time: '15:40', code: 'E7-WP33-Buczek', full_name: 'On-board Data Handling for Highly Autonomous Systems', location: 'BT7 13.60', instructors: 'Buczek, Meß', weeks: '41-51,2-4', weeks_array: expandWeeks('41-51,2-4'), module_type: 'software' },
  { semester: 'IE7', day: 'Friday', start_time: '12:10', end_time: '15:40', code: 'E7-WPP33-Buczek', full_name: 'On-board Data Handling Lab', location: 'BT7 13.60', instructors: 'Buczek, Meß', weeks: '47,50,3', weeks_array: expandWeeks('47,50,3'), module_type: 'software' },
  
  // IE7 - Elective: Peer Leaders (WP-Radt) - Friday
  { semester: 'IE7', day: 'Friday', start_time: '12:10', end_time: '15:40', code: 'E7-WP34-Radt', full_name: 'Peer Leaders', location: 'BT7 10.65', instructors: 'Radt', weeks: '41-50,2-3', weeks_array: expandWeeks('41-50,2-3'), module_type: 'intercultural' },
  { semester: 'IE7', day: 'Friday', start_time: '12:00', end_time: '14:00', code: 'E7-WPP34-Radt', full_name: 'Peer Leaders Lab', location: '', instructors: 'Radt', weeks: '41-51,2-4', weeks_array: expandWeeks('41-51,2-4'), module_type: 'intercultural' },
  { semester: 'IE7', day: 'Friday', start_time: '12:10', end_time: '15:40', code: 'E7-WPP34-Radt', full_name: 'Peer Leaders Lab', location: 'BT7 10.65', instructors: 'Radt', weeks: '48,51,4', weeks_array: expandWeeks('48,51,4'), module_type: 'intercultural' },
  
  // IE7 - Elective: LED Technik (WP-Noack) - Friday
  { semester: 'IE7', day: 'Friday', start_time: '12:10', end_time: '15:40', code: 'E7-WP36-Noack', full_name: 'LED Technik', location: 'BT7 8.61', instructors: 'Noack', weeks: '41-51,2-4', weeks_array: expandWeeks('41-51,2-4'), module_type: 'electronics' },
  { semester: 'IE7', day: 'Friday', start_time: '12:10', end_time: '15:40', code: 'E7-WPP36-Noack', full_name: 'LED Technik Lab', location: 'BT7 8.61', instructors: 'Noack', weeks: '47,50,3', weeks_array: expandWeeks('47,50,3'), module_type: 'electronics' },
  
  // IE7 - Elective: Introduction to Cryptography (WP-Neumann) - Friday
  { semester: 'IE7', day: 'Friday', start_time: '12:10', end_time: '15:40', code: 'E7-WP37-Neumann', full_name: 'Introduction to Cryptography', location: 'Stift69 106', instructors: 'Neumann', weeks: '41-51,2-4', weeks_array: expandWeeks('41-51,2-4'), module_type: 'software' },
  { semester: 'IE7', day: 'Friday', start_time: '12:10', end_time: '15:40', code: 'E7-WPP37-Neumann', full_name: 'Introduction to Cryptography Lab', location: 'Stift69 106', instructors: 'Neumann', weeks: '46,49,2', weeks_array: expandWeeks('46,49,2'), module_type: 'software' },
  
  // IE7 - Project: Entwicklung einer Partysimulation (WPJ01) - Friday
  { semester: 'IE7', day: 'Friday', start_time: '08:10', end_time: '11:25', code: 'E7-WPJ01-Gottfried', full_name: 'Projekt: Entwicklung einer Partysimulation', location: 'BT7 13.60', instructors: 'Gottfried-Krambeer', weeks: '41-51,2-4', weeks_array: expandWeeks('41-51,2-4'), module_type: 'software' },
  
  // IE7 - Project: Raspberry Pi (WPJ02) - Friday
  { semester: 'IE7', day: 'Friday', start_time: '08:10', end_time: '11:25', code: 'E7-WPJ02-Noack', full_name: 'Projekt: Raspberry Pi', location: 'BT7 8.62', instructors: 'Noack', weeks: '41-51,2-4', weeks_array: expandWeeks('41-51,2-4'), module_type: 'electronics' },
  
  // IE7 - Project: Automatisierung eines Stückgutprozesses (WPJ03) - Friday
  { semester: 'IE7', day: 'Friday', start_time: '08:10', end_time: '11:25', code: 'E7-WPJ03-Meiners', full_name: 'Projekt: Automatisierung eines Stückgutprozesses', location: 'BT7 6.06', instructors: 'Huß, Meiners', weeks: '41-51,2-4', weeks_array: expandWeeks('41-51,2-4'), module_type: 'electronics' },
  
  // IE7 - Project: Hydroponics (WPJ11) - Friday
  { semester: 'IE7', day: 'Friday', start_time: '08:10', end_time: '11:25', code: 'E7-WPJ11-Heß', full_name: 'Projekt: Hydroponics', location: 'Stift69 107', instructors: 'Heß', weeks: '41-51,2-4', weeks_array: expandWeeks('41-51,2-4'), module_type: 'intercultural' },
  
  // IE7 - Project: Generative and Agentic AI (WPJ15) - Friday
  { semester: 'IE7', day: 'Friday', start_time: '08:10', end_time: '11:25', code: 'E7-WPJ15-Conjeti', full_name: 'Projekt: Generative and Agentic AI', location: 'BT7 10.65', instructors: 'Conjeti', weeks: '41-51,2-4', weeks_array: expandWeeks('41-51,2-4'), module_type: 'software' },
  
  // IE7 - Project: One World Engineering (WPJ16) - Friday
  { semester: 'IE7', day: 'Friday', start_time: '08:10', end_time: '11:25', code: 'E7-WPJ16-Schoenen', full_name: 'Projekt: One World Engineering', location: 'BT7 14.05', instructors: 'Schoenen', weeks: '41-51,2-4', weeks_array: expandWeeks('41-51,2-4'), module_type: 'intercultural' },
  
  // IE7 - Project: Automatic Code Generation using MATLAB/Simulink (WPJ17) - Friday
  { semester: 'IE7', day: 'Friday', start_time: '08:10', end_time: '11:25', code: 'E7-WPJ17-Ginzel', full_name: 'Projekt: Automatic Code Generation using MATLAB/Simulink', location: 'BT7 14.65', instructors: 'Ginzel', weeks: '41-51,2-4', weeks_array: expandWeeks('41-51,2-4'), module_type: 'software' },
  
  // IE7 - Project: Cosmic Discoveries & their Techniques (WPJ18) - Friday
  { semester: 'IE7', day: 'Friday', start_time: '08:10', end_time: '11:25', code: 'E7-WPJ18-Trivedi', full_name: 'Projekt: Cosmic Discoveries & their Techniques', location: 'Stift69 106', instructors: 'Trivedi', weeks: '41-51,2-4', weeks_array: expandWeeks('41-51,2-4'), module_type: 'intercultural' },
];

export class ScheduleBlock {
  static async list(): Promise<ScheduleBlockType[]> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));
    return realSchedule;
  }
}
