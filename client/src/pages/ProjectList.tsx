import { useState } from "react";
import { Link } from "wouter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Project } from "@shared/schema";
import { formatDate } from "@/lib/utils";

// Material UI imports
import {
  Box,
  Button,
  Card,
  CircularProgress,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useMediaQuery
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon
} from '@mui/icons-material';

export default function ProjectList() {
  const queryClient = useQueryClient();
  const [isUpdating, setIsUpdating] = useState<number | null>(null);
  
  // Hook for checking if the viewport is mobile sized
  const isMobile = useMediaQuery('(max-width:768px)');
  
  // Fetch all projects
  const { 
    data: projects = [], 
    isLoading: isProjectsLoading,
    isError: isProjectsError,
    error: projectsError 
  } = useQuery<Project[]>({
    queryKey: ['/api/projects'],
    retry: 2, // Retry failed requests twice
  });
  
  // Fetch favorite projects
  const { 
    data: favoriteProjects = [],
    isLoading: isFavoritesLoading,
    isError: isFavoritesError,
    error: favoritesError
  } = useQuery<Project[]>({
    queryKey: ['/api/projects/favorites'],
    retry: 2, // Retry failed requests twice
  });

  // State for handling errors
  const [error, setError] = useState<string | null>(null);
  
  // Toggle favorite status
  const toggleFavorite = async (projectId: number) => {
    try {
      setIsUpdating(projectId);
      setError(null);
      const response = await fetch(`/api/projects/${projectId}/toggle-favorite`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update favorite status');
      }
      
      // Invalidate queries to refresh data
      await queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      await queryClient.invalidateQueries({ queryKey: ['/api/projects/favorites'] });
    } catch (error) {
      console.error('Error toggling favorite status:', error);
      setError((error as Error)?.message || 'Failed to update favorite status. Please try again.');
    } finally {
      setIsUpdating(null);
    }
  };
  
  // Render mobile project cards
  const renderMobileProjectCards = () => {
    if (projects.length === 0) {
      return (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography>No projects found</Typography>
        </Paper>
      );
    }
    
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {projects.map((project: Project) => (
          <Card key={project.id} variant="outlined" sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
              <Link href={`/projects/${project.id}`} style={{ textDecoration: 'none' }}>
                <Typography 
                  variant="h6" 
                  color="primary"
                  sx={{ 
                    cursor: 'pointer',
                    '&:hover': { textDecoration: 'underline' } 
                  }}
                >
                  {project.name}
                </Typography>
              </Link>
              <Box>
                <IconButton 
                  color={project.isFavorite ? "warning" : "default"} 
                  onClick={() => toggleFavorite(project.id)}
                  disabled={isUpdating === project.id}
                  size="small"
                >
                  {isUpdating === project.id ? (
                    <CircularProgress size={18} color="inherit" />
                  ) : (
                    project.isFavorite ? <StarIcon /> : <StarBorderIcon />
                  )}
                </IconButton>
                <Link href={`/projects/${project.id}/edit`}>
                  <IconButton color="primary" size="small">
                    <EditIcon />
                  </IconButton>
                </Link>
              </Box>
            </Box>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              ID: project_{project.id}
            </Typography>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              Manager: {project.projectManager}
            </Typography>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              Period: {formatDate(project.startDate)} - {formatDate(project.endDate)}
            </Typography>
          </Card>
        ))}
      </Box>
    );
  };
  
  // Render desktop project table
  const renderDesktopProjectTable = () => {
    return (
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell>Project ID</TableCell>
              <TableCell>Project Name</TableCell>
              <TableCell>Start Date</TableCell>
              <TableCell>End Date</TableCell>
              <TableCell>Project Manager</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {projects.map((project: Project) => (
              <TableRow key={project.id}>
                <TableCell>project_{project.id}</TableCell>
                <TableCell>
                  <Link href={`/projects/${project.id}`}>
                    <Typography 
                      color="primary"
                      sx={{ 
                        cursor: 'pointer',
                        '&:hover': { textDecoration: 'underline' } 
                      }}
                    >
                      {project.name}
                    </Typography>
                  </Link>
                </TableCell>
                <TableCell>{formatDate(project.startDate)}</TableCell>
                <TableCell>{formatDate(project.endDate)}</TableCell>
                <TableCell>{project.projectManager}</TableCell>
                <TableCell align="right">
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <IconButton 
                      color={project.isFavorite ? "warning" : "default"} 
                      onClick={() => toggleFavorite(project.id)}
                      disabled={isUpdating === project.id}
                      title={project.isFavorite ? "Remove from favorites" : "Add to favorites"}
                    >
                      {isUpdating === project.id ? (
                        <CircularProgress size={20} color="inherit" />
                      ) : (
                        project.isFavorite ? <StarIcon /> : <StarBorderIcon />
                      )}
                    </IconButton>
                    <Link href={`/projects/${project.id}/edit`}>
                      <IconButton color="primary" title="Edit project">
                        <EditIcon />
                      </IconButton>
                    </Link>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
            {projects.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography sx={{ py: 2 }}>
                    No projects found
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };
  
  return (
    <Box sx={{ 
      display: 'flex', 
      p: { xs: 2, md: 3 },
      flexDirection: isMobile ? 'column' : 'row'
    }}>
      {/* Sidebar with favorite projects */}
      <Box sx={{ 
        width: isMobile ? '100%' : '240px', 
        mb: isMobile ? 3 : 0,
        mr: isMobile ? 0 : 4 
      }}>
        <Card variant="outlined" sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Favorite Projects
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <List disablePadding>
            {favoriteProjects.length === 0 && (
              <ListItem disablePadding>
                <ListItemText primary="No favorite projects" />
              </ListItem>
            )}
            {favoriteProjects.map((project: Project) => (
              <ListItem key={project.id} disablePadding sx={{ mb: 1 }}>
                <Link href={`/projects/${project.id}`}>
                  <ListItemText 
                    primary={project.name} 
                    sx={{ 
                      cursor: 'pointer',
                      '&:hover': { textDecoration: 'underline' } 
                    }} 
                  />
                </Link>
              </ListItem>
            ))}
          </List>
        </Card>
      </Box>

      {/* Main content */}
      <Box sx={{ flex: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">
            Projects
          </Typography>
          <Link href="/projects/new">
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<AddIcon />}
            >
              Create Project
            </Button>
          </Link>
        </Box>

        {/* Show loading state for favorites */}
        {isFavoritesLoading && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, pl: 2 }}>
            <CircularProgress size={20} sx={{ mr: 1 }} />
            <Typography variant="body2">Loading favorites...</Typography>
          </Box>
        )}
        
        {/* Show error message for favorites if there's an error */}
        {(isFavoritesError || error) && (
          <Paper 
            sx={{ 
              p: 2, 
              bgcolor: '#fff4f5', 
              border: '1px solid #ffcdd2',
              borderRadius: 1,
              mb: 3
            }}
          >
            <Typography color="error" variant="body2">
              <strong>Error:</strong> {error || (favoritesError as Error)?.message || "Could not load favorites. Please try again."}
            </Typography>
            <Button 
              size="small" 
              sx={{ mt: 1 }} 
              variant="outlined" 
              color="error"
              onClick={() => {
                setError(null);
                if (isFavoritesError) {
                  queryClient.invalidateQueries({ queryKey: ['/api/projects/favorites'] });
                }
              }}
            >
              Dismiss
            </Button>
          </Paper>
        )}

        {/* Show loading or error state for main project list */}
        {isProjectsLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : isProjectsError ? (
          <Paper 
            sx={{ 
              p: 3, 
              bgcolor: '#fff4f5', 
              border: '1px solid #ffcdd2',
              borderRadius: 1,
              mb: 3
            }}
          >
            <Typography color="error" variant="body1" gutterBottom>
              <strong>Error loading projects:</strong> {(projectsError as Error)?.message || "Could not load projects. Please try again."}
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/projects'] })}
              sx={{ mt: 2 }}
            >
              Retry
            </Button>
          </Paper>
        ) : (
          // Render different views based on screen size
          isMobile ? renderMobileProjectCards() : renderDesktopProjectTable()
        )}
      </Box>
    </Box>
  );
}