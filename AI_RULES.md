# AI Rules for MyConnect Application

This document outlines the technical stack and specific library usage guidelines for the MyConnect application. Adhering to these rules ensures consistency, maintainability, and leverages the strengths of our chosen technologies.

## Tech Stack Description

*   **Frontend Framework**: React.js for building dynamic and interactive user interfaces.
*   **Language**: TypeScript for type safety, improved code quality, and better developer experience.
*   **Build Tool**: Vite for a fast development server and optimized production builds.
*   **Styling**: Tailwind CSS for utility-first CSS styling, enabling rapid and consistent UI development.
*   **UI Components**: shadcn/ui, built on Radix UI, provides a collection of accessible and customizable UI components.
*   **Routing**: React Router DOM for declarative client-side routing.
*   **Data Fetching & Server State Management**: TanStack Query (React Query) for efficient data fetching, caching, and synchronization.
*   **Icons**: Lucide React for a comprehensive and customizable icon set.
*   **Date Manipulation**: `date-fns` for lightweight and efficient date handling.
*   **Form Management**: React Hook Form for performant and flexible form validation, integrated with Zod for schema definition.
*   **Backend as a Service (BaaS)**: Supabase for authentication, database, and storage services.
*   **Notifications**: Radix UI's Toast component, managed via a custom `useToast` hook, for user feedback.

## Library Usage Rules

To maintain a consistent and efficient codebase, please follow these guidelines for library usage:

*   **UI Components**:
    *   Always prioritize using components from `shadcn/ui`.
    *   If a required component is not available in `shadcn/ui` or needs significant custom behavior, create a new component in `src/components/` and style it exclusively with Tailwind CSS.
    *   **Do not modify `shadcn/ui` components directly.** If a change is needed, create a wrapper component or a new component.
*   **Styling**:
    *   All styling **must** be done using Tailwind CSS utility classes.
    *   Avoid inline styles or creating new `.css` files for components. Global styles are managed in `src/index.css`.
*   **Routing**:
    *   Use `react-router-dom` for all client-side navigation.
    *   All primary application routes should be defined within `src/App.tsx`.
*   **Data Fetching**:
    *   Use `@tanstack/react-query` for all server-side data fetching, caching, and mutations.
*   **Icons**:
    *   All icons used in the application should come from the `lucide-react` library.
*   **Date Handling**:
    *   Use `date-fns` for any date formatting, parsing, or manipulation tasks.
*   **Forms**:
    *   Implement forms using `react-hook-form` for state management and validation.
    *   Define form schemas using `zod` and integrate them with `react-hook-form` using `@hookform/resolvers`.
*   **Notifications**:
    *   Use the `useToast` hook (from `src/hooks/use-toast.ts`, which wraps `@radix-ui/react-toast`) for displaying all transient user notifications and feedback.
    *   The `sonner` library is also available but `useToast` should be the default for consistency.
*   **Backend Interaction**:
    *   All interactions with the backend (authentication, database queries, file storage) must be performed using the `@supabase/supabase-js` client, imported from `src/lib/supabase.ts` or `src/integrations/supabase/client.ts`.