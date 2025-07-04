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

### Drupal Integration

The system expects Drupal webform data from the endpoint `webform_rest/{webform_id}/fields` and submits to `webform_rest/{webform_id}/submit`.

### Environment Setup

Copy `.env.local.example` to `.env.local` and configure:
- `NEXT_PUBLIC_DRUPAL_URL`: Your Drupal backend URL

### Usage

- `/form` - Demo form with example data
- `/form/[webformId]` - Dynamic form loaded from Drupal backend

This system supports all Drupal webform field types and composite elements found in the provided example structure.