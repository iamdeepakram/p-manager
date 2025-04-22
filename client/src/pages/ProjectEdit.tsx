import { useState, useEffect } from "react";
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
  Stack,
  TextField,
  Typography,
  Alert,
  useMediaQuery
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';

export default function ProjectEdit() {
  const params = useParams();
  const projectId = params.id ? parseInt(params.id) : null;
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  
  // Check if viewport is mobile sized
  const isMobile = useMediaQuery('(max-width:768px)');
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    projectManager: "",
    isFavorite: false
  });
  
  // Form errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Loading state
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Fetch project data
  const { data: project = {} as Project, isLoading, error } = useQuery<Project>({
    queryKey: [`/api/projects/${projectId}`],
    enabled: !!projectId,
  });
  
  // Fetch favorite projects
  const { data: favoriteProjects = [] } = useQuery<Project[]>({
    queryKey: ['/api/projects/favorites'],
  });
  
  // Update form data when project is loaded
  useEffect(() => {
    if (project && project.id) {
      const typedProject = project as Project;
      
      try {
        // Format dates for date inputs, with error handling
        let formattedStartDate = '';
        let formattedEndDate = '';
        
        if (typedProject.startDate) {
          // Handle string or Date object
          const startDate = typeof typedProject.startDate === 'string' 
            ? new Date(typedProject.startDate) 
            : typedProject.startDate;
          formattedStartDate = startDate.toISOString().split('T')[0];
        }
        
        if (typedProject.endDate) {
          // Handle string or Date object
          const endDate = typeof typedProject.endDate === 'string' 
            ? new Date(typedProject.endDate) 
            : typedProject.endDate;
          formattedEndDate = endDate.toISOString().split('T')[0];
        }
        
        setFormData({
          name: typedProject.name || '',
          description: typedProject.description || '',
          startDate: formattedStartDate,
          endDate: formattedEndDate,
          projectManager: typedProject.projectManager || '',
          isFavorite: typedProject.isFavorite || false
        });
      } catch (error) {
        console.error('Error formatting project dates:', error);
        setErrors({
          form: 'Error loading project data. Please try again.'
        });
      }
    }
  }, [project]);
  
  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when field is modified
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ""
      });
    }
  };
  
  // Validate form data
  const validateForm = () => {
    let isValid = true;
    const newErrors: Record<string, string> = {};
    
    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = "Project name is required";
      isValid = false;
    }
    
    // Validate description
    if (!formData.description.trim()) {
      newErrors.description = "Project description is required";
      isValid = false;
    }
    
    // Validate start date
    if (!formData.startDate) {
      newErrors.startDate = "Start date is required";
      isValid = false;
    }
    
    // Validate end date
    if (!formData.endDate) {
      newErrors.endDate = "End date is required";
      isValid = false;
    } else if (formData.startDate && new Date(formData.endDate) < new Date(formData.startDate)) {
      newErrors.endDate = "End date cannot be before start date";
      isValid = false;
    }
    
    // Validate project manager
    if (!formData.projectManager.trim()) {
      newErrors.projectManager = "Project manager is required";
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !projectId) return;
    
    setIsSubmitting(true);
    
    try {
      // Format dates as ISO strings
      const projectData = {
        ...formData,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString()
      };
      
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(projectData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update project');
      }
      
      // Invalidate queries
      await queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}`] });
      await queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      await queryClient.invalidateQueries({ queryKey: ['/api/projects/favorites'] });
      
      // Redirect to project detail
      navigate(`/projects/${projectId}`);
    } catch (error) {
      console.error('Error updating project:', error);
      
      setErrors({
        ...errors,
        form: error instanceof Error ? error.message : 'An unexpected error occurred'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error || !project) {
    return (
      <Box sx={{ my: 4, p: { xs: 2, md: 3 } }}>
        <Typography variant="h4" gutterBottom>
          Edit Project
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
          <Typography color="error">
            Error loading project. Please try again later.
          </Typography>
        </Paper>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/")}
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
        </Card>
      </Box>
      
      {/* Main content */}
      <Box sx={{ flex: 1 }}>
        <Typography variant="h4" gutterBottom>
          Edit Project: {(project as Project).name}
        </Typography>
        
        <Paper sx={{ p: { xs: 2, md: 3 }, mb: 3 }}>
          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <TextField
                fullWidth
                required
                label="Project Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={!!errors.name}
                helperText={errors.name}
                disabled={isSubmitting}
                variant="outlined"
              />
              
              <TextField
                fullWidth
                required
                multiline
                rows={4}
                label="Project Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                error={!!errors.description}
                helperText={errors.description}
                disabled={isSubmitting}
                variant="outlined"
              />
              
              <Box sx={{ 
                display: 'flex', 
                flexDirection: isMobile ? 'column' : 'row',
                gap: 2 
              }}>
                <TextField
                  fullWidth
                  required
                  type="date"
                  label="Start Date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  error={!!errors.startDate}
                  helperText={errors.startDate}
                  disabled={isSubmitting}
                  InputLabelProps={{ shrink: true }}
                  variant="outlined"
                />
                
                <TextField
                  fullWidth
                  required
                  type="date"
                  label="End Date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  error={!!errors.endDate}
                  helperText={errors.endDate}
                  disabled={isSubmitting}
                  InputLabelProps={{ shrink: true }}
                  variant="outlined"
                />
              </Box>
              
              <TextField
                fullWidth
                required
                label="Project Manager"
                name="projectManager"
                value={formData.projectManager}
                onChange={handleChange}
                error={!!errors.projectManager}
                helperText={errors.projectManager}
                disabled={isSubmitting}
                variant="outlined"
              />
              
              {errors.form && (
                <Alert severity="error">
                  {errors.form}
                </Alert>
              )}
              
              <Box sx={{ 
                display: 'flex', 
                flexDirection: isMobile ? 'column' : 'row',
                gap: 2, 
                mt: 2 
              }}>
                <Button
                  fullWidth={isMobile}
                  variant="contained"
                  color="primary"
                  type="submit"
                  disabled={isSubmitting}
                  startIcon={<SaveIcon />}
                >
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
                
                <Button
                  fullWidth={isMobile}
                  variant="outlined"
                  onClick={() => navigate(`/projects/${projectId}`)}
                  disabled={isSubmitting}
                  startIcon={<ArrowBackIcon />}
                >
                  Cancel
                </Button>
              </Box>
            </Stack>
          </form>
        </Paper>
      </Box>
    </Box>
  );
}