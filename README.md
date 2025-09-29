# Professional Grading System

A modern, industry-standard grading system built with Next.js, TypeScript, and Prisma.

## Features

- **Teacher Authentication**: Secure login and signup system
- **Professional UI**: Clean blue and white color scheme
- **Responsive Design**: Works on all device sizes
- **Section Management**: Navigate between different sections
- **Modern Architecture**: Built with Next.js 15 and TypeScript

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Custom implementation with bcryptjs

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/gradingsystem"
   ```

4. Set up the database:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. **Sign Up**: Create a new teacher account
2. **Login**: Sign in with your credentials
3. **Dashboard**: Access the main dashboard with section navigation
4. **Navigation**: Use the left sidebar to switch between sections

## Project Structure

```
app/
├── api/auth/          # Authentication API routes
├── components/        # Reusable UI components
├── dashboard/         # Main dashboard page
├── login/            # Login page
├── signup/           # Signup page
├── lib/              # Utility functions and Prisma client
└── globals.css       # Global styles

prisma/
└── schema.prisma     # Database schema
```

## Database Schema

The system includes the following models:
- **Teachers**: Teacher accounts and authentication
- **Section**: Class sections managed by teachers
- **Students**: Students enrolled in sections
- **Grade**: Student grades and academic records

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.# gradingsystem
