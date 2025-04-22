import { useState } from "react";
import { useParams, useLocation } from "wouter";
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
  List,
  ListItem,
  ListItemText,
  Paper,
  Typography,
  useMediaQuery
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  ArrowBack as ArrowBackIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

export default function ProjectDetail() {
  const params = useParams();
  const projectId = params.id ? parseInt(params.id) : null;
  const [, navigate] = useLocation();
  
  // Check if viewport is mobile sized - must be called at the top level before any conditional returns
  const isMobile = useMediaQuery('(max-width:768px)');
  
  // Fetch project data
  const { 
    data: project = {} as Project, 
    isLoading, 
    error,
    isError,
    refetch: refetchProject 
  } = useQuery<Project>({
    queryKey: [`/api/projects/${projectId}`],
    enabled: !!projectId,
    retry: 2, // Retry failed requests twice
  });
  
  // Fetch favorite projects
  const { 
    data: favoriteProjects = [],
    isLoading: isFavoritesLoading,
    isError: isFavoritesError,
    error: favoritesError,
    refetch: refetchFavorites
  } = useQuery<Project[]>({
    queryKey: ['/api/projects/favorites'],
    retry: 2, // Retry failed requests twice
  });
  
  // Delete project handler
  const [isDeletingProject, setIsDeletingProject] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  
  const deleteProject = async () => {
    if (!projectId) return;
    
    if (!window.confirm('Are you sure you want to delete this project?')) {
      return;
    }
    
    try {
      setIsDeletingProject(true);
      setDeleteError(null);
      
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete project');
      }
      
      // Navigate back to projects list after successful deletion
      navigate('/');
    } catch (error) {
      console.error('Error deleting project:', error);
      setDeleteError((error as Error)?.message || 'Failed to delete project. Please try again.');
    } finally {
      setIsDeletingProject(false);
    }
  };
  
  // Toggle favorite status
  const queryClient = useQueryClient();
  const [isUpdatingFavorite, setIsUpdatingFavorite] = useState(false);
  const [favoriteError, setFavoriteError] = useState<string | null>(null);
  
  const toggleFavorite = async () => {
    if (!projectId) return;
    
    try {
      setIsUpdatingFavorite(true);
      setFavoriteError(null);
      const response = await fetch(`/api/projects/${projectId}/toggle-favorite`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update favorite status');
      }
      
      // Invalidate queries to refresh data
      await queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}`] });
      await queryClient.invalidateQueries({ queryKey: ['/api/projects/favorites'] });
      await queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      
    } catch (error) {
      console.error('Error toggling favorite status:', error);
      setFavoriteError((error as Error)?.message || 'Failed to update favorite status. Please try again.');
    } finally {
      setIsUpdatingFavorite(false);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError || !project.id) {
    return (
      <Box sx={{ my: 4, p: { xs: 2, md: 3 } }}>
        <Typography variant="h4" gutterBottom>
          Project Details
        </Typography>
        <Paper 
          sx={{ 
            p: { xs: 2, md: 3 }, 
            bgcolor: '#fff4f5', 
            border: '1px solid #ffcdd2',
            borderRadius: 1,
            mb: 3
          }}
        >
          <Typography color="error" variant="body1" gutterBottom>
            <strong>Error loading project details:</strong> {(error as Error)?.message || "Could not load project information. Please try again."}
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => refetchProject()}
            sx={{ mt: 2 }}
          >
            Retry
          </Button>
        </Paper>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/")}
          sx={{ mr: 2 }}
        >
          Back to Projects
        </Button>
      </Box>
    );
  }
  
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
          
          {isFavoritesLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
              <CircularProgress size={24} />
            </Box>
          ) : isFavoritesError ? (
            <Box sx={{ p: 1 }}>
              <Typography color="error" variant="body2" sx={{ mb: 1 }}>
                Error loading favorites
              </Typography>
              <Button 
                size="small" 
                variant="outlined" 
                onClick={() => refetchFavorites()}
                startIcon={<RefreshIcon />}
              >
                Retry
              </Button>
            </Box>
          ) : (
            <List disablePadding>
              {favoriteProjects.length === 0 && (
                <ListItem disablePadding>
                  <ListItemText primary="No favorite projects" />
                </ListItem>
              )}
              {favoriteProjects.map((favProject: Project) => (
                <ListItem key={favProject.id} disablePadding sx={{ mb: 1 }}>
                  <ListItemText 
                    primary={
                      <Box 
                        component="a" 
                        href={`/projects/${favProject.id}`}
                        sx={{ 
                          textDecoration: 'none', 
                          color: 'primary.main',
                          '&:hover': { 
                            textDecoration: 'underline' 
                          } 
                        }}
                      >
                        {favProject.name}
                      </Box>
                    } 
                  />
                </ListItem>
              ))}
            </List>
          )}
          
        </Card>
      </Box>
      
      {/* Main content */}
      <Box sx={{ flex: 1 }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between', 
          alignItems: isMobile ? 'stretch' : 'flex-start', 
          mb: 3 
        }}>
          <Typography variant="h4" sx={{ mb: isMobile ? 2 : 0 }}>
            {(project as Project).name}
          </Typography>
          <Box sx={{ 
            display: 'flex', 
            gap: 1,
            flexDirection: isMobile ? 'column' : 'row',
            width: isMobile ? '100%' : 'auto'
          }}>
            <Button
              fullWidth={isMobile}
              variant={(project as Project).isFavorite ? "contained" : "outlined"}
              color={(project as Project).isFavorite ? "warning" : "primary"}
              onClick={toggleFavorite}
              disabled={isUpdatingFavorite}
              startIcon={isUpdatingFavorite ? undefined : ((project as Project).isFavorite ? <StarIcon /> : <StarBorderIcon />)}
            >
              {isUpdatingFavorite ? (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  Updating...
                </Box>
              ) : ((project as Project).isFavorite ? "Remove from Favorites" : "Add to Favorites")}
            </Button>
            <Button
              fullWidth={isMobile}
              variant="outlined"
              color="primary"
              startIcon={<EditIcon />}
              onClick={() => navigate(`/projects/${projectId}/edit`)}
            >
              Edit
            </Button>
            <Button
              fullWidth={isMobile}
              variant="outlined"
              color="error"
              startIcon={isDeletingProject ? undefined : <DeleteIcon />}
              onClick={deleteProject}
              disabled={isDeletingProject}
            >
              {isDeletingProject ? (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CircularProgress size={20} sx={{ mr: 1 }} color="error" />
                  Deleting...
                </Box>
              ) : "Delete"}
            </Button>
          </Box>
        </Box>
        
        {(deleteError || favoriteError) && (
          <Paper 
            sx={{ 
              p: 2, 
              mb: 3, 
              bgcolor: '#fff4f5', 
              border: '1px solid #ffcdd2',
              borderRadius: 1 
            }}
          >
            <Typography color="error" variant="body2">
              <strong>Error:</strong> {deleteError || favoriteError}
            </Typography>
            <Button 
              size="small" 
              variant="outlined" 
              color="error" 
              onClick={() => {
                setDeleteError(null);
                setFavoriteError(null);
              }}
              sx={{ mt: 1 }}
            >
              Dismiss
            </Button>
          </Paper>
        )}
        
        <Paper sx={{ p: { xs: 2, md: 3 }, mb: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ pb: 1, borderBottom: '1px solid #eee' }}>
            Project Details
          </Typography>
          
          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', my: 2 }}>
            {(project as Project).description}
          </Typography>
          
          <Box sx={{ mt: 3 }}>
            <Box sx={{ 
              display: 'flex', 
              mb: 2,
              flexDirection: isMobile ? 'column' : 'row'
            }}>
              <Typography 
                variant="subtitle2" 
                color="text.secondary" 
                sx={{ 
                  width: isMobile ? '100%' : 140,
                  mb: isMobile ? 0.5 : 0
                }}
              >
                Project ID
              </Typography>
              <Typography variant="body1">
                project_{(project as Project).id}
              </Typography>
            </Box>
            
            <Box sx={{ 
              display: 'flex', 
              mb: 2,
              flexDirection: isMobile ? 'column' : 'row'
            }}>
              <Typography 
                variant="subtitle2" 
                color="text.secondary" 
                sx={{ 
                  width: isMobile ? '100%' : 140,
                  mb: isMobile ? 0.5 : 0
                }}
              >
                Project Manager
              </Typography>
              <Typography variant="body1">
                {(project as Project).projectManager}
              </Typography>
            </Box>
            
            <Box sx={{ 
              display: 'flex', 
              mb: 2,
              flexDirection: isMobile ? 'column' : 'row'
            }}>
              <Typography 
                variant="subtitle2" 
                color="text.secondary" 
                sx={{ 
                  width: isMobile ? '100%' : 140,
                  mb: isMobile ? 0.5 : 0
                }}
              >
                Start Date
              </Typography>
              <Typography variant="body1">
                {formatDate((project as Project).startDate)}
              </Typography>
            </Box>
            
            <Box sx={{ 
              display: 'flex', 
              mb: 2,
              flexDirection: isMobile ? 'column' : 'row'
            }}>
              <Typography 
                variant="subtitle2" 
                color="text.secondary" 
                sx={{ 
                  width: isMobile ? '100%' : 140,
                  mb: isMobile ? 0.5 : 0
                }}
              >
                End Date
              </Typography>
              <Typography variant="body1">
                {formatDate((project as Project).endDate)}
              </Typography>
            </Box>
          </Box>
        </Paper>
        
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/")}
        >
          Back to Projects
        </Button>
      </Box>
    </Box>
  );
}