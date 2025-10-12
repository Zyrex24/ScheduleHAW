# Schedule HAW

A modern schedule management application for HAW Hamburg, featuring a bold brutalist design aesthetic and comprehensive filtering capabilities for managing academic schedules.

## Overview

Schedule HAW is a web application designed to help students at HAW Hamburg visualize and organize their course schedules. The application allows users to select courses from their enrolled programs and view them in a weekly timetable format, with support for multiple semesters and detailed filtering options.

## Key Features

**Course Selection System**
The application provides an intuitive course catalog organized by semester, allowing students to select specific courses and course groups they are enrolled in. The catalog spans all seven semesters of the Information Engineering program, including compulsory courses, electives, and project work.

**Interactive Schedule Grid**
Courses are displayed in a color-coded weekly grid format, showing time slots from Monday through Saturday. Each course block displays comprehensive information including course code, full name, location, instructor, and applicable weeks throughout the semester.

**Advanced Filtering**
Multiple filter options enable precise schedule customization:
- Week-by-week navigation through the semester (weeks 41-52 and 1-4)
- Semester-based filtering (IE1 through IE7)
- Instructor-based filtering
- Selected course filtering

**Conflict Detection**
The built-in conflict detector analyzes selected courses and identifies scheduling conflicts, showing specific details about overlapping time slots, conflicting weeks, and course types. This helps students make informed decisions when planning their schedules.

**Calendar Export**
Users can export their customized schedules to ICS format, compatible with most calendar applications including Google Calendar, Apple Calendar, and Outlook.

## Technical Architecture

**Frontend Framework**
Built with Next.js 14 using the App Router architecture, providing server-side rendering capabilities and optimized performance. The application is written entirely in TypeScript for type safety and enhanced developer experience.

**UI Components**
The interface utilizes shadcn/ui components built on Radix UI primitives, ensuring accessibility and consistent behavior. Custom components are styled with Tailwind CSS, following a brutalist design philosophy with bold borders, vibrant colors, and strong shadows.

**State Management**
The application uses React hooks for local state management, with course selection, filter states, and UI preferences managed through controlled components.

**Data Structure**
Schedule data is organized into typed entities representing course blocks, with each block containing:
- Course identification (code, full name, module type)
- Timing information (day, start time, end time)
- Location and instructor details
- Week applicability (as both ranges and arrays)
- Semester and group associations

## Design System

**Color Coding**
Courses are color-coded by module type for visual distinction:
- Cyan (`#00D9FF`): Database and Digital Systems
- Purple (`#7209B7`): Microcontroller and Signal Processing
- Green (`#8AC926`): Electronics and Electrical Engineering
- Pink (`#FF006E`): Software Engineering and Mathematics
- Orange (`#FB5607`): Economics and Management
- Yellow (`#FFBE0B`): Intercultural Competence and General courses

**Visual Language**
The brutalist design aesthetic features:
- Bold 4-6px black borders on all elements
- Prominent drop shadows with solid black offsets
- High contrast color combinations
- Geometric layouts with grid-based positioning
- Strong typography with uppercase headings

## Project Structure

The codebase is organized into distinct layers:

**Components Layer**
Schedule-specific React components handle visualization and user interaction, including the schedule grid, course filters, individual schedule blocks, and conflict detection displays.

**Entities Layer**
Data models and business logic define the structure of schedule information and provide methods for data retrieval and manipulation.

**Pages Layer**
Top-level page components orchestrate the application layout and coordinate between filters, data, and display components.

**Library Utilities**
Helper functions handle specialized tasks such as ICS file generation for calendar exports.

## Data Management

**Course Data**
The application maintains comprehensive course information for all Information Engineering semesters, including:
- Lecture schedules with full timing details
- Laboratory and exercise sessions with group divisions
- Project work and elective courses
- Instructor assignments and room locations
- Week-by-week occurrence patterns

**Week Calculations**
The academic year is divided into week numbers (41-52 for fall semester, 1-4 for winter semester), with the Christmas break period (weeks 52 and 1) specially indicated. The application automatically filters courses based on selected weeks and highlights schedule-free periods.

## User Workflow

Students interact with the application through a structured workflow:

1. Browse the course catalog organized by semester
2. Select relevant courses and course groups
3. View the personalized schedule in the weekly grid
4. Adjust filters to focus on specific weeks or semesters
5. Review any detected conflicts between selected courses
6. Export the finalized schedule to a calendar application

The interface provides clear visual feedback throughout the process, with selected courses displayed as removable tags and empty states guiding users to take appropriate actions.

## Browser Compatibility

The application is compatible with modern web browsers supporting ES6+ JavaScript and CSS Grid layouts. Recommended browsers include the latest versions of Chrome, Firefox, Safari, and Edge.

## License

This project is licensed under the MIT License.