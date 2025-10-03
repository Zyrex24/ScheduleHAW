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
  
  return [...new Set(weeks)].sort((a, b) => a - b);
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

// Real schedule data from PDFs
const realSchedule: ScheduleBlockType[] = [
  // IE4 - Monday
  { semester: 'IE4', day: 'Monday', start_time: '08:10', end_time: '09:40', code: 'IE4-DB', full_name: 'Databases', location: 'BT7 10.60', instructors: 'Köpcke, Roose', weeks: '41-51', weeks_array: expandWeeks('41-51'), module_type: 'database' },
  { semester: 'IE4', day: 'Monday', start_time: '09:55', end_time: '11:25', code: 'IE4-DBL/01', full_name: 'Databases Lab', location: 'BT7 13.65', instructors: 'Köpcke, Roose', weeks: '46,49,2', weeks_array: expandWeeks('46,49,2'), module_type: 'database', group: '01' },
  { semester: 'IE4', day: 'Monday', start_time: '09:55', end_time: '11:25', code: 'IE4-DBL/01', full_name: 'Databases Lab', location: 'BT7 13.65', instructors: 'Köpcke, Roose', weeks: '45', weeks_array: expandWeeks('45'), module_type: 'database', group: '01' },
  { semester: 'IE4', day: 'Monday', start_time: '12:10', end_time: '13:40', code: 'IE4-DBL/02', full_name: 'Databases Lab', location: 'BT7 13.65', instructors: 'Köpcke, Roose', weeks: '47,50,3', weeks_array: expandWeeks('47,50,3'), module_type: 'database', group: '02' },
  { semester: 'IE4', day: 'Monday', start_time: '12:10', end_time: '13:40', code: 'IE4-DBL/02', full_name: 'Databases Lab', location: 'BT7 13.65', instructors: 'Köpcke, Roose', weeks: '45', weeks_array: expandWeeks('45'), module_type: 'database', group: '02' },
  
  // IE4 - Tuesday
  { semester: 'IE4', day: 'Tuesday', start_time: '08:10', end_time: '09:40', code: 'IE4-MC', full_name: 'Microcontrollers', location: 'BT7 10.65', instructors: 'Buczek, Edeler', weeks: '41-51,2-4', weeks_array: expandWeeks('41-51,2-4'), module_type: 'microcontroller' },
  { semester: 'IE4', day: 'Tuesday', start_time: '09:55', end_time: '11:25', code: 'IE4-MCL/03', full_name: 'Microcontrollers Lab', location: 'BT7 8.80', instructors: 'Haarring, Schröder', weeks: '45,47,49,51,3', weeks_array: expandWeeks('45,47,49,51,3'), module_type: 'microcontroller', group: '03' },
  { semester: 'IE4', day: 'Tuesday', start_time: '12:10', end_time: '13:40', code: 'IE4-SE', full_name: 'Software Engineering', location: 'BT7 14.65', instructors: 'Eger', weeks: '41-51', weeks_array: expandWeeks('41-51'), module_type: 'software' },
  { semester: 'IE4', day: 'Tuesday', start_time: '14:10', end_time: '15:40', code: 'IE4-SEL/01', full_name: 'Software Engineering Lab', location: 'BT7 13.65', instructors: 'Eger', weeks: '46,49,2', weeks_array: expandWeeks('46,49,2'), module_type: 'software', group: '01' },
  { semester: 'IE4', day: 'Tuesday', start_time: '14:10', end_time: '15:40', code: 'IE4-SEL/01', full_name: 'Software Engineering Lab', location: 'BT7 13.65', instructors: 'Eger', weeks: '44', weeks_array: expandWeeks('44'), module_type: 'software', group: '01' },
  { semester: 'IE4', day: 'Tuesday', start_time: '15:55', end_time: '17:25', code: 'IE4-SEL/02', full_name: 'Software Engineering Lab', location: 'BT7 13.65', instructors: 'Eger', weeks: '47,50,3', weeks_array: expandWeeks('47,50,3'), module_type: 'software', group: '02' },
  { semester: 'IE4', day: 'Tuesday', start_time: '15:55', end_time: '17:25', code: 'IE4-SEL/02', full_name: 'Software Engineering Lab', location: 'BT7 13.65', instructors: 'Eger', weeks: '44', weeks_array: expandWeeks('44'), module_type: 'software', group: '02' },
  { semester: 'IE4', day: 'Tuesday', start_time: '17:40', end_time: '19:10', code: 'IE4-SEL/03', full_name: 'Software Engineering Lab', location: 'BT7 13.65', instructors: 'Eger', weeks: '48,51,4', weeks_array: expandWeeks('48,51,4'), module_type: 'software', group: '03' },
  { semester: 'IE4', day: 'Tuesday', start_time: '17:40', end_time: '19:10', code: 'IE4-SEL/03', full_name: 'Software Engineering Lab', location: 'BT7 5.65', instructors: 'Eger', weeks: '45', weeks_array: expandWeeks('45'), module_type: 'software', group: '03' },
  
  // IE4 - Wednesday
  { semester: 'IE4', day: 'Wednesday', start_time: '08:10', end_time: '09:40', code: 'IE4-DBL/03', full_name: 'Databases Lab', location: 'BT7 13.60', instructors: 'Herster', weeks: '48,51,4', weeks_array: expandWeeks('48,51,4'), module_type: 'database', group: '03' },
  { semester: 'IE4', day: 'Wednesday', start_time: '08:10', end_time: '09:40', code: 'IE4-DBL/03', full_name: 'Databases Lab', location: 'BT7 13.65', instructors: 'Herster', weeks: '45', weeks_array: expandWeeks('45'), module_type: 'database', group: '03' },
  { semester: 'IE4', day: 'Wednesday', start_time: '09:55', end_time: '11:25', code: 'IE4-DS', full_name: 'Digital Systems', location: 'BT7 6.60', instructors: 'Schulz', weeks: '42-51', weeks_array: expandWeeks('42-51'), module_type: 'digital' },
  { semester: 'IE4', day: 'Wednesday', start_time: '09:55', end_time: '11:25', code: 'IE4-DS', full_name: 'Digital Systems', location: 'Stift69 110', instructors: 'Schulz', weeks: '41', weeks_array: expandWeeks('41'), module_type: 'digital' },
  { semester: 'IE4', day: 'Wednesday', start_time: '12:10', end_time: '13:40', code: 'IE4-DSL/01', full_name: 'Digital Systems Lab', location: 'BT7 8.01', instructors: 'Gassinez, Schulz', weeks: '47,50,3', weeks_array: expandWeeks('47,50,3'), module_type: 'digital', group: '01' },
  { semester: 'IE4', day: 'Wednesday', start_time: '12:10', end_time: '13:40', code: 'IE4-DSL/01', full_name: 'Digital Systems Lab', location: 'BT7 8.01', instructors: 'Gassinez, Schulz', weeks: '45', weeks_array: expandWeeks('45'), module_type: 'digital', group: '01' },
  { semester: 'IE4', day: 'Wednesday', start_time: '14:10', end_time: '15:40', code: 'IE4-DSL/02', full_name: 'Digital Systems Lab', location: 'BT7 8.01', instructors: 'Gassinez, Schulz', weeks: '48,51,4', weeks_array: expandWeeks('48,51,4'), module_type: 'digital', group: '02' },
  { semester: 'IE4', day: 'Wednesday', start_time: '14:10', end_time: '15:40', code: 'IE4-DSL/02', full_name: 'Digital Systems Lab', location: 'BT7 8.01', instructors: 'Gassinez, Schulz', weeks: '45', weeks_array: expandWeeks('45'), module_type: 'digital', group: '02' },
  { semester: 'IE4', day: 'Wednesday', start_time: '15:55', end_time: '17:25', code: 'IE4-DSL/03', full_name: 'Digital Systems Lab', location: 'BT7 8.01', instructors: 'Gassinez, Schulz', weeks: '46,49,2', weeks_array: expandWeeks('46,49,2'), module_type: 'digital', group: '03' },
  { semester: 'IE4', day: 'Wednesday', start_time: '15:55', end_time: '17:25', code: 'IE4-DSL/03', full_name: 'Digital Systems Lab', location: 'BT7 8.01', instructors: 'Gassinez, Schulz', weeks: '44', weeks_array: expandWeeks('44'), module_type: 'digital', group: '03' },
  
  // IE4 - Thursday
  { semester: 'IE4', day: 'Thursday', start_time: '08:10', end_time: '09:40', code: 'IE4-MCL/01', full_name: 'Microcontrollers Lab', location: 'BT7 8.80', instructors: 'Haarring, Schröder', weeks: '45,47,49,51,3', weeks_array: expandWeeks('45,47,49,51,3'), module_type: 'microcontroller', group: '01' },
  { semester: 'IE4', day: 'Thursday', start_time: '09:55', end_time: '11:25', code: 'IE4-MCL/02', full_name: 'Microcontrollers Lab', location: 'BT7 8.80', instructors: 'Haarring, Schröder', weeks: '46,48,50,2,4', weeks_array: expandWeeks('46,48,50,2,4'), module_type: 'microcontroller', group: '02' },
  
  // IE4 - Friday
  { semester: 'IE4', day: 'Friday', start_time: '08:10', end_time: '09:40', code: 'IE4-SS2', full_name: 'Signals and Systems 2', location: 'BT7 6.60', instructors: 'Lange', weeks: '41-43,45-51', weeks_array: expandWeeks('41-43,45-51'), module_type: 'signals' },
  { semester: 'IE4', day: 'Friday', start_time: '09:55', end_time: '11:25', code: 'IE4-SSL2/01', full_name: 'Signals and Systems 2 Lab', location: 'BT7 13.65', instructors: 'Lange', weeks: '48,51,4', weeks_array: expandWeeks('48,51,4'), module_type: 'signals', group: '01' },
  { semester: 'IE4', day: 'Friday', start_time: '09:55', end_time: '11:25', code: 'IE4-SSL2/01', full_name: 'Signals and Systems 2 Lab', location: 'BT7 13.65', instructors: 'Lange', weeks: '45', weeks_array: expandWeeks('45'), module_type: 'signals', group: '01' },
  { semester: 'IE4', day: 'Friday', start_time: '12:10', end_time: '13:40', code: 'IE4-SSL2/02', full_name: 'Signals and Systems 2 Lab', location: 'BT7 13.65', instructors: 'Lange', weeks: '46,49,2', weeks_array: expandWeeks('46,49,2'), module_type: 'signals', group: '02' },
  { semester: 'IE4', day: 'Friday', start_time: '12:10', end_time: '13:40', code: 'IE4-SSL2/02', full_name: 'Signals and Systems 2 Lab', location: 'BT7 5.65', instructors: 'Lange', weeks: '45', weeks_array: expandWeeks('45'), module_type: 'signals', group: '02' },
  { semester: 'IE4', day: 'Friday', start_time: '14:10', end_time: '15:40', code: 'IE4-SSL2/03', full_name: 'Signals and Systems 2 Lab', location: 'BT7 13.65', instructors: 'Lange', weeks: '47,50,3', weeks_array: expandWeeks('47,50,3'), module_type: 'signals', group: '03' },
  { semester: 'IE4', day: 'Friday', start_time: '14:10', end_time: '15:40', code: 'IE4-SSL2/03', full_name: 'Signals and Systems 2 Lab', location: 'BT7 5.65', instructors: 'Lange', weeks: '45', weeks_array: expandWeeks('45'), module_type: 'signals', group: '03' },
  
  // IE3 - Monday
  { semester: 'IE3', day: 'Monday', start_time: '08:10', end_time: '09:40', code: 'IE3-AD', full_name: 'Algorithms and Data Structures', location: 'BT7 10.60', instructors: 'Gottfried-Krambeer', weeks: '41-51', weeks_array: expandWeeks('41-51'), module_type: 'software' },
  { semester: 'IE3', day: 'Monday', start_time: '09:55', end_time: '11:25', code: 'IE3-ADL/03', full_name: 'Algorithms and Data Structures Lab', location: 'BT7 13.60', instructors: 'Gottfried-Krambeer', weeks: '45', weeks_array: expandWeeks('45'), module_type: 'software', group: '03' },
  { semester: 'IE3', day: 'Monday', start_time: '12:10', end_time: '13:40', code: 'IE3-EME/01', full_name: 'Economics and Management Exercises', location: 'BT7 14.86', instructors: 'Shook', weeks: '44,47,50', weeks_array: expandWeeks('44,47,50'), module_type: 'economics', group: '01' },
  { semester: 'IE3', day: 'Monday', start_time: '12:10', end_time: '13:40', code: 'IE3-EME/02', full_name: 'Economics and Management Exercises', location: 'BT7 14.86', instructors: 'Shook', weeks: '45,48,51', weeks_array: expandWeeks('45,48,51'), module_type: 'economics', group: '02' },
  { semester: 'IE3', day: 'Monday', start_time: '12:10', end_time: '13:40', code: 'IE3-EME/03', full_name: 'Economics and Management Exercises', location: 'BT7 14.86', instructors: 'Shook', weeks: '46,49,2', weeks_array: expandWeeks('46,49,2'), module_type: 'economics', group: '03' },
  
  // IE3 - Tuesday
  { semester: 'IE3', day: 'Tuesday', start_time: '08:10', end_time: '09:40', code: 'IE3-DI', full_name: 'Digital Circuits', location: 'Stein94 0.02', instructors: 'Rust', weeks: '41-51', weeks_array: expandWeeks('41-51'), module_type: 'digital' },
  { semester: 'IE3', day: 'Tuesday', start_time: '09:55', end_time: '11:25', code: 'IE3-EL2', full_name: 'Electronics 2', location: 'BT7 6.60', instructors: 'Radt', weeks: '41-51,2-4', weeks_array: expandWeeks('41-51,2-4'), module_type: 'electronics' },
  { semester: 'IE3', day: 'Tuesday', start_time: '12:10', end_time: '13:40', code: 'IE3-ELL2/01', full_name: 'Electronics 2 Lab', location: 'BT7 5.05', instructors: 'Al Hajsaeed, Radt', weeks: '45,47,49', weeks_array: expandWeeks('45,47,49'), module_type: 'electronics', group: '01' },
  { semester: 'IE3', day: 'Tuesday', start_time: '12:10', end_time: '13:40', code: 'IE3-ELL2/01', full_name: 'Electronics 2 Lab', location: 'BT7 8.04', instructors: 'Al Hajsaeed, Radt', weeks: '51,3', weeks_array: expandWeeks('51,3'), module_type: 'electronics', group: '01' },
  { semester: 'IE3', day: 'Tuesday', start_time: '14:10', end_time: '15:40', code: 'IE3-ELL2/02', full_name: 'Electronics 2 Lab', location: 'BT7 5.05', instructors: 'Al Hajsaeed, Radt', weeks: '46,48,50', weeks_array: expandWeeks('46,48,50'), module_type: 'electronics', group: '02' },
  { semester: 'IE3', day: 'Tuesday', start_time: '14:10', end_time: '15:40', code: 'IE3-ELL2/02', full_name: 'Electronics 2 Lab', location: 'BT7 8.04', instructors: 'Al Hajsaeed, Radt', weeks: '2,4', weeks_array: expandWeeks('2,4'), module_type: 'electronics', group: '02' },
  { semester: 'IE3', day: 'Tuesday', start_time: '15:55', end_time: '17:25', code: 'IE3-ELL2/03', full_name: 'Electronics 2 Lab', location: 'BT7 5.05', instructors: 'Al Hajsaeed, Radt', weeks: '46,48,50', weeks_array: expandWeeks('46,48,50'), module_type: 'electronics', group: '03' },
  { semester: 'IE3', day: 'Tuesday', start_time: '15:55', end_time: '17:25', code: 'IE3-ELL2/03', full_name: 'Electronics 2 Lab', location: 'BT7 8.04', instructors: 'Al Hajsaeed, Radt', weeks: '2,4', weeks_array: expandWeeks('2,4'), module_type: 'electronics', group: '03' },
  
  // IE3 - Wednesday
  { semester: 'IE3', day: 'Wednesday', start_time: '08:10', end_time: '09:40', code: 'IE3-SS1', full_name: 'Signals and Systems 1', location: 'Stift69 106', instructors: 'Lehmann', weeks: '41-51', weeks_array: expandWeeks('41-51'), module_type: 'signals' },
  { semester: 'IE3', day: 'Wednesday', start_time: '09:55', end_time: '11:25', code: 'IE3-SSL1/01', full_name: 'Signals and Systems 1 Lab', location: 'BT7 13.60', instructors: 'Lehmann', weeks: '44', weeks_array: expandWeeks('44'), module_type: 'signals', group: '01' },
  { semester: 'IE3', day: 'Wednesday', start_time: '09:55', end_time: '11:25', code: 'IE3-SSL1/02', full_name: 'Signals and Systems 1 Lab', location: 'BT7 13.60', instructors: 'Lehmann', weeks: '44', weeks_array: expandWeeks('44'), module_type: 'signals', group: '02' },
  
  // IE3 - Thursday
  { semester: 'IE3', day: 'Thursday', start_time: '08:10', end_time: '09:40', code: 'IE3-ADL/01', full_name: 'Algorithms and Data Structures Lab', location: 'BT7 13.65', instructors: 'Gottfried-Krambeer', weeks: '46,49,2', weeks_array: expandWeeks('46,49,2'), module_type: 'software', group: '01' },
  { semester: 'IE3', day: 'Thursday', start_time: '08:10', end_time: '09:40', code: 'IE3-ADL/01', full_name: 'Algorithms and Data Structures Lab', location: 'BT7 13.65', instructors: 'Gottfried-Krambeer', weeks: '45', weeks_array: expandWeeks('45'), module_type: 'software', group: '01' },
  { semester: 'IE3', day: 'Thursday', start_time: '09:55', end_time: '11:25', code: 'IE3-ADL/02', full_name: 'Algorithms and Data Structures Lab', location: 'BT7 13.65', instructors: 'Gottfried-Krambeer', weeks: '47,50,3', weeks_array: expandWeeks('47,50,3'), module_type: 'software', group: '02' },
  { semester: 'IE3', day: 'Thursday', start_time: '09:55', end_time: '11:25', code: 'IE3-ADL/02', full_name: 'Algorithms and Data Structures Lab', location: 'BT7 13.65', instructors: 'Gottfried-Krambeer', weeks: '45', weeks_array: expandWeeks('45'), module_type: 'software', group: '02' },
  { semester: 'IE3', day: 'Thursday', start_time: '12:10', end_time: '13:40', code: 'IE3-ADL/03', full_name: 'Algorithms and Data Structures Lab', location: 'BT7 13.65', instructors: 'Gottfried-Krambeer', weeks: '48,51,4', weeks_array: expandWeeks('48,51,4'), module_type: 'software', group: '03' },
  { semester: 'IE3', day: 'Thursday', start_time: '14:10', end_time: '15:40', code: 'IE3-EM', full_name: 'Economics and Management', location: 'BT7 12.60', instructors: 'Shook', weeks: '42-51,2', weeks_array: expandWeeks('42-51,2'), module_type: 'economics' },
  
  // IE3 - Friday
  { semester: 'IE3', day: 'Friday', start_time: '08:10', end_time: '09:40', code: 'IE3-DIL/01', full_name: 'Digital Circuits Lab', location: 'BT7 8.01', instructors: 'Al-Mohamed Zein, Rust', weeks: '48,51,4', weeks_array: expandWeeks('48,51,4'), module_type: 'digital', group: '01' },
  { semester: 'IE3', day: 'Friday', start_time: '08:10', end_time: '09:40', code: 'IE3-DIL/01', full_name: 'Digital Circuits Lab', location: 'BT7 8.01', instructors: 'Al-Mohamed Zein, Rust', weeks: '45', weeks_array: expandWeeks('45'), module_type: 'digital', group: '01' },
  { semester: 'IE3', day: 'Friday', start_time: '09:55', end_time: '11:25', code: 'IE3-DIL/02', full_name: 'Digital Circuits Lab', location: 'BT7 8.01', instructors: 'Al-Mohamed Zein, Rust', weeks: '46,49,2', weeks_array: expandWeeks('46,49,2'), module_type: 'digital', group: '02' },
  { semester: 'IE3', day: 'Friday', start_time: '09:55', end_time: '11:25', code: 'IE3-DIL/02', full_name: 'Digital Circuits Lab', location: 'BT7 8.01', instructors: 'Al-Mohamed Zein, Rust', weeks: '45', weeks_array: expandWeeks('45'), module_type: 'digital', group: '02' },
  { semester: 'IE3', day: 'Friday', start_time: '12:10', end_time: '13:40', code: 'IE3-DIL/03', full_name: 'Digital Circuits Lab', location: 'BT7 8.01', instructors: 'Al-Mohamed Zein, Rust', weeks: '47,50,3', weeks_array: expandWeeks('47,50,3'), module_type: 'digital', group: '03' },
  { semester: 'IE3', day: 'Friday', start_time: '12:10', end_time: '13:40', code: 'IE3-DIL/03', full_name: 'Digital Circuits Lab', location: 'BT7 8.01', instructors: 'Al-Mohamed Zein, Rust', weeks: '45', weeks_array: expandWeeks('45'), module_type: 'digital', group: '03' },
  
  // IE3 - Saturday
  { semester: 'IE3', day: 'Saturday', start_time: '08:10', end_time: '09:40', code: 'IE3-SSL1/01', full_name: 'Signals and Systems 1 Lab', location: 'BT7 13.60', instructors: 'Lehmann', weeks: '46,49,2', weeks_array: expandWeeks('46,49,2'), module_type: 'signals', group: '01' },
  { semester: 'IE3', day: 'Saturday', start_time: '09:55', end_time: '11:25', code: 'IE3-SSL1/02', full_name: 'Signals and Systems 1 Lab', location: 'BT7 13.60', instructors: 'Lehmann', weeks: '47,50,3', weeks_array: expandWeeks('47,50,3'), module_type: 'signals', group: '02' },
  { semester: 'IE3', day: 'Saturday', start_time: '12:10', end_time: '13:40', code: 'IE3-SSL1/03', full_name: 'Signals and Systems 1 Lab', location: 'BT7 13.60', instructors: 'Lehmann', weeks: '48,51,4', weeks_array: expandWeeks('48,51,4'), module_type: 'signals', group: '03' },
  { semester: 'IE3', day: 'Saturday', start_time: '12:10', end_time: '13:40', code: 'IE3-SSL1/03', full_name: 'Signals and Systems 1 Lab', location: 'BT7 13.60', instructors: 'Lehmann', weeks: '45', weeks_array: expandWeeks('45'), module_type: 'signals', group: '03' },
  
  // IE2 - Monday
  { semester: 'IE2', day: 'Monday', start_time: '08:10', end_time: '09:40', code: 'IE2-ELL1/01', full_name: 'Electronics 1 Lab', location: 'BT7 5.05', instructors: 'Al Hajsaeed, Kruse', weeks: '45', weeks_array: expandWeeks('45'), module_type: 'electronics', group: '01' },
  { semester: 'IE2', day: 'Monday', start_time: '08:10', end_time: '09:40', code: 'IE2-ELL1/02', full_name: 'Electronics 1 Lab', location: 'BT7 5.05', instructors: 'Al Hajsaeed, Lehmann', weeks: '45', weeks_array: expandWeeks('45'), module_type: 'electronics', group: '02' },
  { semester: 'IE2', day: 'Monday', start_time: '09:55', end_time: '11:25', code: 'IE2-LSL', full_name: 'Learning and Study Methods', location: 'BT7 8.85', instructors: '', weeks: '41', weeks_array: expandWeeks('41'), module_type: 'intercultural' },
  { semester: 'IE2', day: 'Monday', start_time: '09:55', end_time: '11:25', code: 'E2-LP', full_name: 'Lab Practice', location: 'BT5 1.13', instructors: 'Herster, Kronauge', weeks: '41', weeks_array: expandWeeks('41'), module_type: 'intercultural' },
  { semester: 'IE2', day: 'Monday', start_time: '12:10', end_time: '13:40', code: 'E2-LP', full_name: 'Lab Practice', location: 'BT7 5.01, BT7 5.02, BT7 8.01, BT7 5.05, BT7 8.80', instructors: '', weeks: '41', weeks_array: expandWeeks('41'), module_type: 'intercultural' },
  { semester: 'IE2', day: 'Monday', start_time: '14:10', end_time: '15:40', code: 'IE2-MA2', full_name: 'Mathematics 2', location: 'BT5 1.13', instructors: 'Neumann', weeks: '42-51,2-4', weeks_array: expandWeeks('42-51,2-4'), module_type: 'math' },
  { semester: 'IE2', day: 'Monday', start_time: '15:55', end_time: '17:25', code: 'IE2-SOL2/01', full_name: 'Software Construction 2 Lab', location: 'BT7 13.60', instructors: 'Moldenhauer, Yildirim', weeks: '48,51,4', weeks_array: expandWeeks('48,51,4'), module_type: 'software', group: '01' },
  { semester: 'IE2', day: 'Monday', start_time: '15:55', end_time: '17:25', code: 'IE2-SOL2/01', full_name: 'Software Construction 2 Lab', location: 'BT7 13.60', instructors: 'Moldenhauer, Yildirim', weeks: '45', weeks_array: expandWeeks('45'), module_type: 'software', group: '01' },
  { semester: 'IE2', day: 'Monday', start_time: '17:40', end_time: '19:10', code: 'IE2-SOL2/02', full_name: 'Software Construction 2 Lab', location: 'BT7 13.60', instructors: 'Moldenhauer, Yildirim', weeks: '46,49,2', weeks_array: expandWeeks('46,49,2'), module_type: 'software', group: '02' },
  { semester: 'IE2', day: 'Monday', start_time: '17:40', end_time: '19:10', code: 'IE2-SOL2/02', full_name: 'Software Construction 2 Lab', location: 'BT7 13.60', instructors: 'Moldenhauer, Yildirim', weeks: '44', weeks_array: expandWeeks('44'), module_type: 'software', group: '02' },
  { semester: 'IE2', day: 'Monday', start_time: '18:00', end_time: '19:10', code: 'IE2-SOL2/03', full_name: 'Software Construction 2 Lab', location: 'BT7 13.60', instructors: 'Moldenhauer, Yildirim', weeks: '47,50,3', weeks_array: expandWeeks('47,50,3'), module_type: 'software', group: '03' },
  { semester: 'IE2', day: 'Monday', start_time: '18:00', end_time: '19:10', code: 'IE2-SOL2/03', full_name: 'Software Construction 2 Lab', location: 'BT7 13.60', instructors: 'Moldenhauer, Yildirim', weeks: '44', weeks_array: expandWeeks('44'), module_type: 'software', group: '03' },
  
  // IE2 - Tuesday  
  { semester: 'IE2', day: 'Tuesday', start_time: '08:10', end_time: '09:40', code: 'IE2-ELL1/01', full_name: 'Electronics 1 Lab', location: 'BT7 5.05', instructors: 'Al Hajsaeed, Kruse', weeks: '47,50,3', weeks_array: expandWeeks('47,50,3'), module_type: 'electronics', group: '01' },
  { semester: 'IE2', day: 'Tuesday', start_time: '09:55', end_time: '11:25', code: 'IE2-ELL1/02', full_name: 'Electronics 1 Lab', location: 'BT7 5.05', instructors: 'Al Hajsaeed, Lehmann', weeks: '48,51,4', weeks_array: expandWeeks('48,51,4'), module_type: 'electronics', group: '02' },
  { semester: 'IE2', day: 'Tuesday', start_time: '12:10', end_time: '13:40', code: 'IE2-ELL1/03', full_name: 'Electronics 1 Lab', location: 'BT7 5.05', instructors: 'Al Hajsaeed, Lehmann', weeks: '46,49,2', weeks_array: expandWeeks('46,49,2'), module_type: 'electronics', group: '03' },
  { semester: 'IE2', day: 'Tuesday', start_time: '12:10', end_time: '13:40', code: 'IE2-ELL1/03', full_name: 'Electronics 1 Lab', location: 'BT7 5.05', instructors: 'Al Hajsaeed, Lehmann', weeks: '44', weeks_array: expandWeeks('44'), module_type: 'electronics', group: '03' },
  { semester: 'IE2', day: 'Tuesday', start_time: '14:10', end_time: '15:40', code: 'IE2-IC/01', full_name: 'Intercultural Competence', location: 'BT7 8.61', instructors: 'Shook', weeks: '43,45,47,49,51', weeks_array: expandWeeks('43,45,47,49,51'), module_type: 'economics', group: '01' },
  { semester: 'IE2', day: 'Tuesday', start_time: '14:10', end_time: '15:40', code: 'IE2-IC/01', full_name: 'Intercultural Competence', location: 'BT7 6.60', instructors: 'Shook', weeks: '48,3-4', weeks_array: expandWeeks('48,3-4'), module_type: 'economics', group: '01' },
  { semester: 'IE2', day: 'Tuesday', start_time: '14:10', end_time: '15:40', code: 'IE2-IC/02', full_name: 'Intercultural Competence', location: 'BT7 8.61', instructors: 'Shook', weeks: '42,44,46,50,2', weeks_array: expandWeeks('42,44,46,50,2'), module_type: 'economics', group: '02' },
  { semester: 'IE2', day: 'Tuesday', start_time: '14:10', end_time: '15:40', code: 'IE2-IC/02', full_name: 'Intercultural Competence', location: 'BT7 6.60', instructors: 'Shook', weeks: '48,3-4', weeks_array: expandWeeks('48,3-4'), module_type: 'economics', group: '02' },
  { semester: 'IE2', day: 'Tuesday', start_time: '15:55', end_time: '17:25', code: 'E2-LP', full_name: 'Lab Practice', location: 'BT7 5.01, BT7 8.01, BT7 8.04, BT7 5.05, BT7 5.02, BT7 8.80', instructors: '', weeks: '41', weeks_array: expandWeeks('41'), module_type: 'intercultural' },
  { semester: 'IE2', day: 'Tuesday', start_time: '17:40', end_time: '19:10', code: 'E2-LP', full_name: 'Lab Practice', location: 'BT7 5.01, BT7 8.04, BT7 8.01, BT7 8.80, BT7 5.02, BT7 5.05', instructors: '', weeks: '41', weeks_array: expandWeeks('41'), module_type: 'intercultural' },
  { semester: 'IE2', day: 'Tuesday', start_time: '18:00', end_time: '19:10', code: 'IE2-MAE2/01', full_name: 'Mathematics 2 Exercises', location: 'BT7 8.61', instructors: 'Maesaka', weeks: '43,45,47,49,51,3', weeks_array: expandWeeks('43,45,47,49,51,3'), module_type: 'math', group: '01' },
  { semester: 'IE2', day: 'Tuesday', start_time: '18:00', end_time: '19:10', code: 'IE2-MAE2/02', full_name: 'Mathematics 2 Exercises', location: 'BT7 8.61', instructors: 'Maesaka', weeks: '43,45,47,49,51,3', weeks_array: expandWeeks('43,45,47,49,51,3'), module_type: 'math', group: '02' },
  
  // IE2 - Wednesday
  { semester: 'IE2', day: 'Wednesday', start_time: '08:10', end_time: '09:40', code: 'IE2-EL1', full_name: 'Electronics 1', location: 'Stein94 0.02', instructors: 'Haase', weeks: '42-51,2', weeks_array: expandWeeks('42-51,2'), module_type: 'electronics' },
  { semester: 'IE2', day: 'Wednesday', start_time: '09:55', end_time: '11:25', code: 'IE2-EE2', full_name: 'Electrical Engineering 2', location: 'Stein94 0.02', instructors: 'Lehmann', weeks: '42-51,2', weeks_array: expandWeeks('42-51,2'), module_type: 'electronics' },
  { semester: 'IE2', day: 'Wednesday', start_time: '12:10', end_time: '13:40', code: 'IE2-EEL2/01', full_name: 'Electrical Engineering 2 Lab', location: 'BT7 5.01', instructors: 'Lehmann, Wittmar', weeks: '46,49,2', weeks_array: expandWeeks('46,49,2'), module_type: 'electronics', group: '01' },
  { semester: 'IE2', day: 'Wednesday', start_time: '12:10', end_time: '13:40', code: 'IE2-EEL2/01', full_name: 'Electrical Engineering 2 Lab', location: 'BT7 5.01', instructors: 'Lehmann, Wittmar', weeks: '44', weeks_array: expandWeeks('44'), module_type: 'electronics', group: '01' },
  { semester: 'IE2', day: 'Wednesday', start_time: '14:10', end_time: '15:40', code: 'IE2-EEL2/02', full_name: 'Electrical Engineering 2 Lab', location: 'BT7 5.01', instructors: 'Lehmann, Wittmar', weeks: '47,50,3', weeks_array: expandWeeks('47,50,3'), module_type: 'electronics', group: '02' },
  { semester: 'IE2', day: 'Wednesday', start_time: '14:10', end_time: '15:40', code: 'IE2-EEL2/02', full_name: 'Electrical Engineering 2 Lab', location: 'BT7 5.01', instructors: 'Lehmann, Wittmar', weeks: '44', weeks_array: expandWeeks('44'), module_type: 'electronics', group: '02' },
  { semester: 'IE2', day: 'Wednesday', start_time: '15:55', end_time: '17:25', code: 'IE2-EEL2/03', full_name: 'Electrical Engineering 2 Lab', location: 'BT7 5.01', instructors: 'Lehmann, Wittmar', weeks: '48,51,4', weeks_array: expandWeeks('48,51,4'), module_type: 'electronics', group: '03' },
  { semester: 'IE2', day: 'Wednesday', start_time: '15:55', end_time: '17:25', code: 'IE2-EEL2/03', full_name: 'Electrical Engineering 2 Lab', location: 'BT7 5.01', instructors: 'Lehmann, Wittmar', weeks: '45', weeks_array: expandWeeks('45'), module_type: 'electronics', group: '03' },
  { semester: 'IE2', day: 'Wednesday', start_time: '17:40', end_time: '19:10', code: 'E2-LP', full_name: 'Lab Practice', location: 'BT7 5.01, BT7 8.80, BT7 5.02, BT7 8.01, BT7 8.04, BT7 5.05', instructors: '', weeks: '41', weeks_array: expandWeeks('41'), module_type: 'intercultural' },
  
  // IE2 - Thursday
  { semester: 'IE2', day: 'Thursday', start_time: '08:10', end_time: '09:40', code: 'E2-LP', full_name: 'Lab Practice', location: 'BT7 5.01, BT7 8.80, BT7 8.04, BT7 5.02, BT7 5.05, BT7 8.01', instructors: '', weeks: '41', weeks_array: expandWeeks('41'), module_type: 'intercultural' },
  { semester: 'IE2', day: 'Thursday', start_time: '09:55', end_time: '11:25', code: 'E2-LP', full_name: 'Lab Practice', location: 'BT7 5.01, BT7 5.02, BT7 8.04, BT7 8.80, BT7 8.01, BT7 5.05', instructors: '', weeks: '41', weeks_array: expandWeeks('41'), module_type: 'intercultural' },
  { semester: 'IE2', day: 'Thursday', start_time: '12:10', end_time: '13:40', code: 'E2-LP', full_name: 'Lab Practice', location: 'BT7 5.01, BT7 8.01, BT7 5.05, BT7 8.80, BT7 5.02, BT7 8.04', instructors: '', weeks: '41', weeks_array: expandWeeks('41'), module_type: 'intercultural' },
  { semester: 'IE2', day: 'Thursday', start_time: '14:10', end_time: '15:40', code: 'E2-LP', full_name: 'Lab Practice', location: 'BT7 5.01, BT7 5.02, BT7 8.01, BT7 5.05, BT7 8.80, BT7 8.04', instructors: '', weeks: '41', weeks_array: expandWeeks('41'), module_type: 'intercultural' },
  { semester: 'IE2', day: 'Thursday', start_time: '15:55', end_time: '17:25', code: 'E2-LP', full_name: 'Lab Practice', location: 'BT7 5.01, BT7 8.01, BT7 5.05, BT7 8.80, BT7 5.02, BT7 8.04', instructors: '', weeks: '41', weeks_array: expandWeeks('41'), module_type: 'intercultural' },
  { semester: 'IE2', day: 'Thursday', start_time: '17:40', end_time: '19:10', code: 'E2-LP', full_name: 'Lab Practice', location: 'BT5 1.13', instructors: '', weeks: '41', weeks_array: expandWeeks('41'), module_type: 'intercultural' },
  
  // IE2 - Friday
  { semester: 'IE2', day: 'Friday', start_time: '08:10', end_time: '09:40', code: 'IE2-MA2', full_name: 'Mathematics 2', location: 'Stein94 0.02', instructors: 'Neumann', weeks: '46,48,50,2', weeks_array: expandWeeks('46,48,50,2'), module_type: 'math' },
  { semester: 'IE2', day: 'Friday', start_time: '09:55', end_time: '11:25', code: 'IE2-SO2', full_name: 'Software Construction 2', location: 'BT7 12.60', instructors: 'Antosch', weeks: '42-51,2', weeks_array: expandWeeks('42-51,2'), module_type: 'software' },
  
  // IE1 - Monday
  { semester: 'IE1', day: 'Monday', start_time: '08:10', end_time: '11:25', code: 'IE1-LSL/02', full_name: 'Learning and Study Methods', location: 'Stift69 106', instructors: 'Leutelt', weeks: '45,47,49,51', weeks_array: expandWeeks('45,47,49,51'), module_type: 'intercultural', group: '02' },
  { semester: 'IE1', day: 'Monday', start_time: '12:10', end_time: '13:40', code: 'IE1-EEL1/01', full_name: 'Electrical Engineering 1 Lab', location: 'BT7 5.01', instructors: 'Hansen, Wittmar', weeks: '46,49,2', weeks_array: expandWeeks('46,49,2'), module_type: 'electronics', group: '01' },
  { semester: 'IE1', day: 'Monday', start_time: '12:10', end_time: '13:40', code: 'IE1-EEL1/02', full_name: 'Electrical Engineering 1 Lab', location: 'BT7 5.01', instructors: 'Hansen, Wittmar', weeks: '47,50,3', weeks_array: expandWeeks('47,50,3'), module_type: 'electronics', group: '02' },
  { semester: 'IE1', day: 'Monday', start_time: '12:10', end_time: '13:40', code: 'IE1-EEL1/02', full_name: 'Electrical Engineering 1 Lab', location: 'BT7 5.01', instructors: 'Hansen, Wittmar', weeks: '44', weeks_array: expandWeeks('44'), module_type: 'electronics', group: '02' },
  { semester: 'IE1', day: 'Monday', start_time: '12:10', end_time: '13:40', code: 'IE1-EEL1/03', full_name: 'Electrical Engineering 1 Lab', location: 'BT7 5.01', instructors: 'Hansen, Wittmar', weeks: '48,51,4', weeks_array: expandWeeks('48,51,4'), module_type: 'electronics', group: '03' },
  { semester: 'IE1', day: 'Monday', start_time: '12:10', end_time: '13:40', code: 'IE1-EEL1/03', full_name: 'Electrical Engineering 1 Lab', location: 'BT7 5.01', instructors: 'Hansen, Wittmar', weeks: '45', weeks_array: expandWeeks('45'), module_type: 'electronics', group: '03' },
  { semester: 'IE1', day: 'Monday', start_time: '14:10', end_time: '15:40', code: 'IE1-EEL1/01', full_name: 'Electrical Engineering 1 Lab', location: 'BT7 5.01', instructors: 'Hansen, Wittmar', weeks: '44', weeks_array: expandWeeks('44'), module_type: 'electronics', group: '01' },
  { semester: 'IE1', day: 'Monday', start_time: '14:10', end_time: '15:40', code: 'IE1-EEL1/04', full_name: 'Electrical Engineering 1 Lab', location: 'BT7 5.01', instructors: 'Hansen, Wittmar', weeks: '45', weeks_array: expandWeeks('45'), module_type: 'electronics', group: '04' },
  { semester: 'IE1', day: 'Monday', start_time: '15:55', end_time: '19:10', code: 'IE1-SOL1/01', full_name: 'Software Construction 1 Lab', location: 'BT7 13.65', instructors: 'Hensel', weeks: '45,47,49,51,3', weeks_array: expandWeeks('45,47,49,51,3'), module_type: 'software', group: '01' },
  { semester: 'IE1', day: 'Monday', start_time: '15:55', end_time: '19:10', code: 'IE1-SOL1/02', full_name: 'Software Construction 1 Lab', location: 'BT7 13.65', instructors: 'Hensel', weeks: '46,48,50,2,4', weeks_array: expandWeeks('46,48,50,2,4'), module_type: 'software', group: '02' },
  { semester: 'IE1', day: 'Monday', start_time: '15:55', end_time: '19:10', code: 'IE1-SOL1/03', full_name: 'Software Construction 1 Lab', location: 'BT7 13.60', instructors: 'Schüthe', weeks: '45,47,49,51,3', weeks_array: expandWeeks('45,47,49,51,3'), module_type: 'software', group: '03' },
  { semester: 'IE1', day: 'Monday', start_time: '15:55', end_time: '19:10', code: 'IE1-SOL1/04', full_name: 'Software Construction 1 Lab', location: 'BT7 13.60', instructors: 'Schüthe', weeks: '46,48,50,2,4', weeks_array: expandWeeks('46,48,50,2,4'), module_type: 'software', group: '04' },
  
  // IE1 - Tuesday
  { semester: 'IE1', day: 'Tuesday', start_time: '08:10', end_time: '11:25', code: 'IE1-LSL/03', full_name: 'Learning and Study Methods', location: 'BT7 14.86', instructors: 'Radt', weeks: '45,47,49,51', weeks_array: expandWeeks('45,47,49,51'), module_type: 'intercultural', group: '03' },
  { semester: 'IE1', day: 'Tuesday', start_time: '12:10', end_time: '13:40', code: 'IE1-LSE/01', full_name: 'Learning and Study Methods Exercises', location: 'BT7 14.65', instructors: 'McCabe', weeks: '43,45,47,49,51,3', weeks_array: expandWeeks('43,45,47,49,51,3'), module_type: 'intercultural', group: '01' },
  { semester: 'IE1', day: 'Tuesday', start_time: '12:10', end_time: '13:40', code: 'IE1-LSE/02', full_name: 'Learning and Study Methods Exercises', location: 'BT7 14.65', instructors: 'McCabe', weeks: '42,44,46,48,50,2,4', weeks_array: expandWeeks('42,44,46,48,50,2,4'), module_type: 'intercultural', group: '02' },
  
  // IE1 - Wednesday
  { semester: 'IE1', day: 'Wednesday', start_time: '08:10', end_time: '09:40', code: 'IE1-EEL1/04', full_name: 'Electrical Engineering 1 Lab', location: 'BT7 5.01', instructors: 'Hansen, Wittmar', weeks: '48,51,4', weeks_array: expandWeeks('48,51,4'), module_type: 'electronics', group: '04' },
  { semester: 'IE1', day: 'Wednesday', start_time: '12:10', end_time: '13:40', code: 'IE1-MA1', full_name: 'Mathematics 1', location: 'BT5 1.13', instructors: 'Nieder', weeks: '43,45,47,49,51', weeks_array: expandWeeks('43,45,47,49,51'), module_type: 'math' },
  { semester: 'IE1', day: 'Wednesday', start_time: '15:55', end_time: '17:25', code: 'IE1-SO1', full_name: 'Software Construction 1', location: 'BT5 1.13', instructors: 'Hensel', weeks: '42-51,2-4', weeks_array: expandWeeks('42-51,2-4'), module_type: 'software' },
  
  // IE1 - Thursday
  { semester: 'IE1', day: 'Thursday', start_time: '08:10', end_time: '09:40', code: 'IE1-MAE1/01', full_name: 'Mathematics 1 Exercises', location: 'BT7 10.65', instructors: 'Nieder', weeks: '43,45,47,49,51,3', weeks_array: expandWeeks('43,45,47,49,51,3'), module_type: 'math', group: '01' },
  { semester: 'IE1', day: 'Thursday', start_time: '09:55', end_time: '11:25', code: 'IE1-GE/01', full_name: 'German', location: 'BT7 14.65', instructors: 'Appel', weeks: '42-51,2-4', weeks_array: expandWeeks('42-51,2-4'), module_type: 'intercultural', group: '01' },
  { semester: 'IE1', day: 'Thursday', start_time: '09:55', end_time: '11:25', code: 'IE1-MAE1/02', full_name: 'Mathematics 1 Exercises', location: 'BT7 10.65', instructors: 'Nieder', weeks: '43,45,47,49,51,3', weeks_array: expandWeeks('43,45,47,49,51,3'), module_type: 'math', group: '02' },
  { semester: 'IE1', day: 'Thursday', start_time: '12:10', end_time: '13:40', code: 'IE1-GE/02', full_name: 'German', location: 'BT7 12.81', instructors: 'Appel', weeks: '42-51,2-4', weeks_array: expandWeeks('42-51,2-4'), module_type: 'intercultural', group: '02' },
  { semester: 'IE1', day: 'Thursday', start_time: '14:10', end_time: '15:40', code: 'IE1-LSL/01', full_name: 'Learning and Study Methods', location: 'BT7 8.61', instructors: 'Lapke', weeks: '45,47,49,51', weeks_array: expandWeeks('45,47,49,51'), module_type: 'intercultural', group: '01' },
  { semester: 'IE1', day: 'Thursday', start_time: '15:55', end_time: '17:25', code: 'IE1-LSL', full_name: 'Learning and Study Methods', location: 'BT7 12.60', instructors: 'Lapke, Leutelt, Radt', weeks: '43,3', weeks_array: expandWeeks('43,3'), module_type: 'intercultural' },
  
  // IE1 - Friday
  { semester: 'IE1', day: 'Friday', start_time: '08:10', end_time: '09:40', code: 'IE1-EE1', full_name: 'Electrical Engineering 1', location: 'BT5 1.13', instructors: 'Hansen', weeks: '42-43,45-51,2-4', weeks_array: expandWeeks('42-43,45-51,2-4'), module_type: 'electronics' },
  { semester: 'IE1', day: 'Friday', start_time: '12:10', end_time: '13:40', code: 'IE1-MA1', full_name: 'Mathematics 1', location: 'BT7 12.60', instructors: 'Nieder', weeks: '42-43,45-51,2-4', weeks_array: expandWeeks('42-43,45-51,2-4'), module_type: 'math' },

  // IE5 - Scientific and Project Work
  { semester: 'IE5', day: 'Monday', start_time: '08:10', end_time: '09:40', code: 'IE5-SP', full_name: 'Scientific and Project Work', location: 'BT7 14.86', instructors: 'Becker', weeks: '45-49', weeks_array: expandWeeks('45-49'), module_type: 'intercultural' },
  { semester: 'IE5', day: 'Tuesday', start_time: '08:10', end_time: '09:40', code: 'IE5-SP', full_name: 'Scientific and Project Work', location: 'BT7 14.86', instructors: 'Becker', weeks: '45-49', weeks_array: expandWeeks('45-49'), module_type: 'intercultural' },
  { semester: 'IE5', day: 'Wednesday', start_time: '08:10', end_time: '09:40', code: 'IE5-SP', full_name: 'Scientific and Project Work', location: 'BT7 14.86', instructors: 'Becker', weeks: '45-49', weeks_array: expandWeeks('45-49'), module_type: 'intercultural' },

  // IE6 - Operating Systems
  { semester: 'IE6', day: 'Monday', start_time: '08:10', end_time: '09:40', code: 'IE6-OS', full_name: 'Operating Systems', location: 'BT7 8.61', instructors: 'Buczek', weeks: '41-51', weeks_array: expandWeeks('41-51'), module_type: 'software' },
  { semester: 'IE6', day: 'Monday', start_time: '09:55', end_time: '11:25', code: 'IE6-OSL/01', full_name: 'Operating Systems Lab', location: 'BT7 8.80', instructors: 'Gassinez, Westerkamp', weeks: '44,45', weeks_array: expandWeeks('44,45'), module_type: 'software', group: '01' },
  { semester: 'IE6', day: 'Monday', start_time: '12:10', end_time: '13:40', code: 'IE6-OSL/02', full_name: 'Operating Systems Lab', location: 'BT7 8.80', instructors: 'Gassinez, Westerkamp', weeks: '46,49,2', weeks_array: expandWeeks('46,49,2'), module_type: 'software', group: '02' },
  
  // IE6 - Tuesday
  { semester: 'IE6', day: 'Tuesday', start_time: '08:10', end_time: '09:40', code: 'IE6-BU', full_name: 'Bus Systems and Sensors', location: 'Stift69 110', instructors: 'Rettig', weeks: '41-51', weeks_array: expandWeeks('41-51'), module_type: 'electronics' },
  { semester: 'IE6', day: 'Tuesday', start_time: '09:55', end_time: '11:25', code: 'IE6-BUL/01', full_name: 'Bus Systems and Sensors Lab', location: 'BT7 8.04', instructors: 'Rettig', weeks: '44,45', weeks_array: expandWeeks('44,45'), module_type: 'electronics', group: '01' },
  { semester: 'IE6', day: 'Tuesday', start_time: '12:10', end_time: '13:40', code: 'IE6-BUL/02', full_name: 'Bus Systems and Sensors Lab', location: 'BT7 8.65', instructors: 'Rettig', weeks: '46,49,2', weeks_array: expandWeeks('46,49,2'), module_type: 'electronics', group: '02' },
  { semester: 'IE6', day: 'Tuesday', start_time: '14:10', end_time: '15:40', code: 'IE6-BUL/03', full_name: 'Bus Systems and Sensors Lab', location: 'BT7 8.04', instructors: 'Rettig', weeks: '47,50,3', weeks_array: expandWeeks('47,50,3'), module_type: 'electronics', group: '03' },
  { semester: 'IE6', day: 'Tuesday', start_time: '15:55', end_time: '17:25', code: 'IE6-OSL/03', full_name: 'Operating Systems Lab', location: 'BT7 8.80', instructors: 'Gassinez, Westerkamp', weeks: '47,50,3', weeks_array: expandWeeks('47,50,3'), module_type: 'software', group: '03' },
  
  // IE6 - Wednesday
  { semester: 'IE6', day: 'Wednesday', start_time: '08:10', end_time: '09:40', code: 'IE6-DP', full_name: 'Digital Signal Processing', location: 'BT7 8.61', instructors: 'Kronauge', weeks: '41-51', weeks_array: expandWeeks('41-51'), module_type: 'signals' },
  { semester: 'IE6', day: 'Wednesday', start_time: '09:55', end_time: '11:25', code: 'IE6-DPL/01', full_name: 'Digital Signal Processing Lab', location: 'BT7 8.85', instructors: 'Kronauge, Kupke', weeks: '44,45', weeks_array: expandWeeks('44,45'), module_type: 'signals', group: '01' },
  { semester: 'IE6', day: 'Wednesday', start_time: '12:10', end_time: '13:40', code: 'IE6-DPL/02', full_name: 'Digital Signal Processing Lab', location: 'BT7 8.85', instructors: 'Kronauge, Kupke', weeks: '46,49,2', weeks_array: expandWeeks('46,49,2'), module_type: 'signals', group: '02' },
  { semester: 'IE6', day: 'Wednesday', start_time: '14:10', end_time: '15:40', code: 'IE6-DPL/03', full_name: 'Digital Signal Processing Lab', location: 'BT7 8.85', instructors: 'Kronauge, Kupke', weeks: '47,50,3', weeks_array: expandWeeks('47,50,3'), module_type: 'signals', group: '03' },
  { semester: 'IE6', day: 'Wednesday', start_time: '15:55', end_time: '17:25', code: 'IE6-BUL/04', full_name: 'Bus Systems and Sensors Lab', location: 'BT7 8.04', instructors: 'Rettig', weeks: '48,51,4', weeks_array: expandWeeks('48,51,4'), module_type: 'electronics', group: '04' },
  
  // IE6 - Thursday
  { semester: 'IE6', day: 'Thursday', start_time: '08:10', end_time: '09:40', code: 'IE6-OS', full_name: 'Operating Systems', location: 'BT7 8.62', instructors: 'Buczek', weeks: '42-51', weeks_array: expandWeeks('42-51'), module_type: 'software' },
  { semester: 'IE6', day: 'Thursday', start_time: '09:55', end_time: '11:25', code: 'IE6-DPL/04', full_name: 'Digital Signal Processing Lab', location: 'BT7 8.85', instructors: 'Kronauge, Kupke', weeks: '48,51,4', weeks_array: expandWeeks('48,51,4'), module_type: 'signals', group: '04' },
  
  // IE6 - Friday
  { semester: 'IE6', day: 'Friday', start_time: '08:10', end_time: '09:40', code: 'IE6-DC', full_name: 'Digital Communication Systems', location: 'BT7 14.05', instructors: 'Schoenen', weeks: '41-43,45-51', weeks_array: expandWeeks('41-43,45-51'), module_type: 'digital' },
  { semester: 'IE6', day: 'Friday', start_time: '09:55', end_time: '11:25', code: 'IE6-DCL/01', full_name: 'Digital Communication Systems Lab', location: 'BT7 14.85', instructors: 'Neugebauer, Schoenen', weeks: '45', weeks_array: expandWeeks('45'), module_type: 'digital', group: '01' },
  { semester: 'IE6', day: 'Friday', start_time: '12:10', end_time: '13:40', code: 'IE6-DCL/02', full_name: 'Digital Communication Systems Lab', location: 'BT7 14.85', instructors: 'Neugebauer, Schoenen', weeks: '46,49,2', weeks_array: expandWeeks('46,49,2'), module_type: 'digital', group: '02' },
  { semester: 'IE6', day: 'Friday', start_time: '14:10', end_time: '15:40', code: 'IE6-DCL/03', full_name: 'Digital Communication Systems Lab', location: 'BT7 14.85', instructors: 'Neugebauer, Schoenen', weeks: '47,50,3', weeks_array: expandWeeks('47,50,3'), module_type: 'digital', group: '03' },

  // IE7 - Electives and Projects
  { semester: 'IE7', day: 'Monday', start_time: '08:10', end_time: '09:40', code: 'E7-WP-Rust', full_name: 'Elective: Architectures of Digital Signal Processing', location: 'BT7 12.81', instructors: 'Rust', weeks: '41-46,48-49,51,2,4', weeks_array: expandWeeks('41-46,48-49,51,2,4'), module_type: 'signals' },
  { semester: 'IE7', day: 'Monday', start_time: '09:55', end_time: '11:25', code: 'E7-WP-Titova', full_name: 'Elective: Solar Energy', location: 'BT7 8.61', instructors: 'Titova', weeks: '41-47,49-50,2-3', weeks_array: expandWeeks('41-47,49-50,2-3'), module_type: 'electronics' },
  { semester: 'IE7', day: 'Monday', start_time: '12:10', end_time: '13:40', code: 'E7-PRO-Meiners', full_name: 'Project: Meiners', location: 'BT7 6.06', instructors: 'Huß, Meiners', weeks: '41-43,45-51,2-4', weeks_array: expandWeeks('41-43,45-51,2-4'), module_type: 'intercultural' },
  { semester: 'IE7', day: 'Tuesday', start_time: '08:10', end_time: '09:40', code: 'E7-WP-Winzenick', full_name: 'Elective: Electrical Energy Systems', location: 'Stift69 107', instructors: 'Winzenick', weeks: '41-43,45,47-48,50-51,3-4', weeks_array: expandWeeks('41-43,45,47-48,50-51,3-4'), module_type: 'electronics' },
  { semester: 'IE7', day: 'Tuesday', start_time: '09:55', end_time: '11:25', code: 'E7-WP-Schulz', full_name: 'Elective: Embedded Systems Verification and Test', location: 'BT7 14.65', instructors: 'Schulz', weeks: '41-43,45-46,48-49,51,2,4', weeks_array: expandWeeks('41-43,45-46,48-49,51,2,4'), module_type: 'software' },
  { semester: 'IE7', day: 'Wednesday', start_time: '08:10', end_time: '09:40', code: 'E7-PRO-Conjeti', full_name: 'Project: Conjeti', location: 'BT7 10.65', instructors: 'Conjeti', weeks: '41-43,45-51,2-4', weeks_array: expandWeeks('41-43,45-51,2-4'), module_type: 'intercultural' },
  { semester: 'IE7', day: 'Wednesday', start_time: '12:10', end_time: '13:40', code: 'E7-WP-Neumann', full_name: 'Elective: Introduction to Cryptography', location: 'Stift69 106', instructors: 'Neumann', weeks: '41-43,45,47-48,50-51,3-4', weeks_array: expandWeeks('41-43,45,47-48,50-51,3-4'), module_type: 'software' },
  { semester: 'IE7', day: 'Thursday', start_time: '08:10', end_time: '09:40', code: 'E7-WP-Noack', full_name: 'Elective: LED Technology', location: 'BT7 8.61', instructors: 'Noack', weeks: '41-43,45-46,48-49,51,2,4', weeks_array: expandWeeks('41-43,45-46,48-49,51,2,4'), module_type: 'electronics' },
  { semester: 'IE7', day: 'Friday', start_time: '08:10', end_time: '09:40', code: 'E7-WP-Radt', full_name: 'Elective: Peer Leaders', location: 'BT7 10.65', instructors: 'Radt', weeks: '41-43,45-47,49-50,2-3', weeks_array: expandWeeks('41-43,45-47,49-50,2-3'), module_type: 'intercultural' },
];

export class ScheduleBlock {
  static async list(): Promise<ScheduleBlockType[]> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));
    return realSchedule;
  }
}
