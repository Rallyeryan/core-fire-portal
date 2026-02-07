# Core Fire Portal

A comprehensive fire equipment service agreement management system built with React, TypeScript, and tRPC.

## Overview

Core Fire Portal is a full-stack web application designed for Core Fire Protection to manage fire equipment service agreements, client information, and administrative tasks. The system provides an interactive agreement form, PDF generation, email notifications, and an admin dashboard for managing all agreements.

## Features

- **Interactive Agreement Form**: Dynamic form with equipment scheduling, pricing calculations, and digital signatures
- **PDF Generation**: Automated PDF creation with company branding and watermarks
- **Email Notifications**: Automated email delivery of signed agreements
- **Admin Dashboard**: Comprehensive dashboard for viewing, searching, and managing agreements
- **Authentication**: Secure OAuth-based authentication system
- **Database Integration**: MySQL/TiDB database with Drizzle ORM
- **Responsive Design**: Mobile-friendly interface with dark theme and modern UI components

## Tech Stack

### Frontend
- **React 19** - UI framework
- **TypeScript** - Type-safe development
- **Vite** - Build tool and dev server
- **TailwindCSS 4** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **tRPC** - End-to-end typesafe APIs
- **React Query** - Data fetching and caching
- **Wouter** - Lightweight routing
- **Framer Motion** - Animation library

### Backend
- **Node.js** - Runtime environment
- **Express** - Web server framework
- **tRPC** - API layer
- **Drizzle ORM** - Type-safe database toolkit
- **MySQL2** - Database driver
- **PDFKit** - PDF generation
- **AWS S3** - File storage for signatures and PDFs

### Development Tools
- **TypeScript 5.9** - Static type checking
- **Vitest** - Unit testing framework
- **Prettier** - Code formatting
- **ESBuild** - Fast bundling

## Project Structure

```
core-fire-portal/
├── client/               # Frontend application
│   ├── public/          # Static assets
│   └── src/
│       ├── components/  # Reusable UI components
│       ├── pages/       # Page components
│       ├── hooks/       # Custom React hooks
│       ├── lib/         # Utility functions
│       └── contexts/    # React contexts
├── server/              # Backend application
│   ├── _core/          # Core server functionality
│   ├── routers.ts      # tRPC routers
│   ├── db.ts           # Database operations
│   ├── pdfGenerator.ts # PDF generation logic
│   └── emailService.ts # Email sending logic
├── shared/              # Shared code between client and server
│   ├── _core/          # Core shared utilities
│   ├── types.ts        # Shared TypeScript types
│   └── const.ts        # Shared constants
├── drizzle/             # Database schema and migrations
│   ├── schema.ts       # Database schema definitions
│   └── migrations/     # SQL migration files
└── patches/             # Package patches

```

## Getting Started

### Prerequisites

- Node.js 22.x or higher
- pnpm 10.x or higher
- MySQL 8.x or compatible database (TiDB supported)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Rallyeryan/core-fire-portal.git
cd core-fire-portal
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
Create a `.env` file in the root directory with the following variables:
```env
DATABASE_URL=mysql://user:password@host:port/database
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=your_aws_region
AWS_S3_BUCKET=your_s3_bucket_name
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_smtp_username
SMTP_PASS=your_smtp_password
```

4. Run database migrations:
```bash
pnpm db:push
```

### Development

Start the development server:
```bash
pnpm dev
```

The application will be available at `http://localhost:5000`

### Building for Production

Build the application:
```bash
pnpm build
```

Start the production server:
```bash
pnpm start
```

### Testing

Run the test suite:
```bash
pnpm test
```

Run type checking:
```bash
pnpm check
```

## Database Schema

The application uses the following main tables:

- **users**: User authentication and profile information
- **agreements**: Service agreement records
- **equipment**: Equipment items associated with agreements

See `drizzle/schema.ts` for complete schema definitions.

## API Routes

The application uses tRPC for type-safe API communication. Main procedures include:

- `agreements.submit` - Submit a new agreement
- `agreements.list` - List all agreements (admin only)
- `agreements.get` - Get a specific agreement
- `agreements.search` - Search agreements
- `agreements.generatePDF` - Generate PDF for an agreement
- `agreements.sendEmail` - Send agreement via email

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | MySQL connection string | Yes |
| `AWS_ACCESS_KEY_ID` | AWS access key for S3 | Yes |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key for S3 | Yes |
| `AWS_REGION` | AWS region | Yes |
| `AWS_S3_BUCKET` | S3 bucket name | Yes |
| `SMTP_HOST` | SMTP server host | Yes |
| `SMTP_PORT` | SMTP server port | Yes |
| `SMTP_USER` | SMTP username | Yes |
| `SMTP_PASS` | SMTP password | Yes |

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For issues, questions, or support, please contact Core Fire Protection or open an issue on GitHub.

## Acknowledgments

- Built with [Vite](https://vitejs.dev/)
- UI components from [Radix UI](https://www.radix-ui.com/)
- Styled with [TailwindCSS](https://tailwindcss.com/)
- Type-safe APIs with [tRPC](https://trpc.io/)
