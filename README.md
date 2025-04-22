# Project Management Application

A React-based project management application that provides intuitive interfaces for project tracking, editing, and collaboration.

## Features

- View, create, edit, and delete projects
- Favorite projects for quick access
- Responsive design for mobile and desktop
- Error handling and loading states
- Simulated network conditions for realistic testing

## Technical Stack

- **Frontend**: React 18 with TypeScript
- **Bundling**: Webpack
- **UI Framework**: Material UI with @emotion/styled for CSS-in-JS
- **State Management**: React Query for server state
- **Routing**: wouter for client-side routing
- **Backend**: Express mock API

## Project Structure

- `client/`: Frontend React application
  - `src/components/`: UI components
  - `src/pages/`: Main application pages
  - `src/hooks/`: Custom React hooks
  - `src/lib/`: Utility functions

- `server/`: Backend Express application
  - `routes.ts`: API route definitions
  - `storage.ts`: Data storage implementation
  - `index.ts`: Server entry point

- `shared/`: Shared types and schemas between frontend and backend

## Development

### Running the Project

```bash
# Start the development server
npm run dev
```

This will start both the backend API server and the frontend development server.

### API Endpoints

- `GET /api/projects`: Get all projects
- `GET /api/projects/:id`: Get a project by ID
- `GET /api/projects/favorites`: Get favorite projects
- `POST /api/projects`: Create a new project
- `PATCH /api/projects/:id`: Update a project
- `DELETE /api/projects/:id`: Delete a project
- `POST /api/projects/:id/toggle-favorite`: Toggle a project's favorite status

## Error Handling and Testing

The application includes:

- Loading indicators for API requests
- Error states with retry options
- Simulated network delays and random failures in the mock API
- Responsive design for different screen sizes

## Future Improvements

- Add authentication and user management
- Implement project filters and search
- Add more detailed project analytics
- Integrate with a real database