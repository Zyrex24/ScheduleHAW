# Schedule HAW

A modern, brutalist-styled schedule management system for HAW Hamburg.

## Features

- 🎨 Bold brutalist design with vibrant colors
- 📅 Weekly schedule grid view
- 🔍 Advanced filtering (Semester, Week, Group, Instructor, Courses)
- 📱 Responsive design
- ⚡ Built with Next.js 14 and TypeScript

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run the development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui + Radix UI
- **Animations:** Framer Motion
- **Icons:** Lucide React

## Project Structure

```
ScheduleHAW/
├── app/                    # Next.js app router
├── Components/            # React components
│   └── schedule/         # Schedule-specific components
├── Entities/             # Data models and API logic
├── Pages/                # Page components
├── components/           # shadcn/ui components
└── lib/                  # Utility functions
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Color Palette

The application uses a vibrant brutalist color scheme:
- **Cyan:** `#00D9FF` - Database & Digital courses
- **Purple:** `#7209B7` - Microcontroller & Signals courses
- **Green:** `#8AC926` - Electronics & Electrical courses
- **Pink:** `#FF006E` - Software & Math courses
- **Orange:** `#FB5607` - Economics & Management courses
- **Yellow:** `#FFBE0B` - Intercultural & Default courses

## License

MIT

