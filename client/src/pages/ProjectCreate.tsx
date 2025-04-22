import { useState } from "react";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { insertProjectSchema } from "@shared/schema";

// Material UI imports
import {
  Box,
  Button,
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

export default function ProjectCreate() {
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
    projectManager: ""
  });
  
  // Form errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Loading state
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      // Format dates as ISO strings
      const projectData = {
        ...formData,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString()
      };
      
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(projectData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create project');
      }
      
      // Invalidate projects query
      await queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      
      // Redirect to projects list
      navigate('/');
    } catch (error) {
      console.error('Error creating project:', error);
      
      setErrors({
        ...errors,
        form: error instanceof Error ? error.message : 'An unexpected error occurred'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Typography variant="h4" gutterBottom>
        Create New Project
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
                {isSubmitting ? "Creating..." : "Create Project"}
              </Button>
              
              <Button
                fullWidth={isMobile}
                variant="outlined"
                onClick={() => navigate("/")}
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
  );
}