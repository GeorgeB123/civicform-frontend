# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server with Turbopack (runs on http://localhost:3000)
- `npm run build` - Build the application for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint to check code quality

## Project Architecture

This is a Next.js 15 application using the App Router architecture with the following key characteristics:

- **Framework**: Next.js 15.3.4 with React 19
- **Styling**: Tailwind CSS v4 with PostCSS
- **TypeScript**: Fully typed with strict mode enabled
- **Fonts**: Uses Geist font family (sans and mono variants) via `next/font/google`
- **Structure**: Standard Next.js App Router structure with `src/app/` directory

### Key Configuration

- **TypeScript**: Configured with `@/*` path alias pointing to `./src/*`
- **Next.js**: Uses Turbopack for development mode (`--turbopack` flag)
- **ESLint**: Configured with Next.js ESLint config
- **Tailwind**: v4 with PostCSS integration

### Application Structure

- `src/app/layout.tsx` - Root layout with font configuration and basic HTML structure
- `src/app/page.tsx` - Home page component with default Next.js landing page
- `src/app/globals.css` - Global CSS styles
- `public/` - Static assets (SVG icons for Next.js, Vercel, etc.)

## Multi-Step Form System

This application includes a comprehensive multi-step form system designed to work with Drupal 11 webforms:

### Key Features

- **Dynamic Form Generation**: Automatically parses Drupal webform structure from REST API
- **Multi-Step Navigation**: Progress indicators, step validation, and wizard-style navigation  
- **Field Type Support**:
  - Text fields and text areas
  - Select dropdowns with options
  - Date pickers
  - Checkboxes
  - File uploads with drag-and-drop
  - Email confirmation fields
  - Composite fields (Address, Full Name)
- **Real-time Validation**: Client-side validation with error handling
- **Responsive Design**: Works on all device sizes
- **Security**: Cloudflare Turnstile integration for bot protection

### Drupal Integration

The system expects Drupal webform data from the endpoint `webform_rest/{webform_id}/fields` and submits to `webform_rest/{webform_id}/submit`.

### Environment Setup

Copy `.env.local.example` to `.env.local` and configure:
- `DRUPAL_URL`: Your Drupal backend URL
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY`: Your Cloudflare Turnstile site key
- `TURNSTILE_SECRET_KEY`: Your Cloudflare Turnstile secret key

### Usage

- `/form` - Demo form with example data
- `/form/[webformId]` - Dynamic form loaded from Drupal backend

This system supports all Drupal webform field types and composite elements found in the provided example structure.

## Security Features

### Cloudflare Turnstile Integration

The application includes Cloudflare Turnstile for bot protection on form submissions:

- **Client-side**: Turnstile widget appears on the final step of multi-step forms
- **Server-side**: Token verification before processing form submissions
- **Configuration**: Requires `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY` environment variables
- **Fallback**: Uses demo keys if environment variables are not configured

The Turnstile component is implemented without third-party libraries and handles:
- Script loading and widget rendering
- Token verification and error handling
- Theme and size customization
- Automatic cleanup on component unmount

#### Development Testing

For development testing, you have two options:

**Option 1: Use Cloudflare Test Keys (Recommended for Development)**
```bash
NEXT_PUBLIC_TURNSTILE_SITE_KEY=1x00000000000000000000AA
TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA
```
These test keys always pass verification and work on any domain.

**Option 2: Create Development Turnstile Site**
1. Go to [Cloudflare Dashboard > Turnstile](https://dash.cloudflare.com/)
2. Create a new site for development
3. Set domain to `localhost` (without port number)
4. Copy the Site Key and Secret Key to your `.env.local`

#### Production Setup

Create separate Turnstile sites for each production domain:
- `*.vercel.app` (for Vercel deployments)
- `*.civicform.net` (for custom domain)
- Set environment variables in Vercel dashboard for production keys