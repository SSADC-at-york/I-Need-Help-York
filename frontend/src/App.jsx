import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import {
  AppBar,
  Toolbar,
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Button,
  Link,
  Stack,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Search,
  LocationOn,
  Book,
  Business,
  HelpOutline
} from '@mui/icons-material';
import { useState, useEffect } from 'react';
import { fetchResources } from './services/api';

const theme = createTheme({
  palette: {
    primary: {
      main: '#E31837',
      contrastText: '#fff'
    },
    secondary: {
      main: '#8A0027',
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 4,
        },
      },
    },
  },
});

const Navbar = () => {
  return (
    <AppBar position="sticky" elevation={0}>
      <Toolbar>
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ 
            flexGrow: 1, 
            fontWeight: 500,
            fontSize: '1.2rem'
          }}
        >
          INeedHelp@YorkU
        </Typography>
        <Button 
          color="inherit" 
          startIcon={<HelpOutline />}
          sx={{ 
            textTransform: 'none',
            fontWeight: 400,
          }}
        >
          Get Help
        </Button>
      </Toolbar>
    </AppBar>
  );
};

const CategoryButtons = ({ selectedCategory, onCategoryChange }) => {
  const categories = ['ALL', 'ACADEMIC', 'HEALTH', 'ADMINISTRATIVE', 'STUDENT LIFE'];
  
  return (
    <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
      {categories.map(category => (
        <Button
          key={category}
          variant={selectedCategory === category ? "contained" : "text"}
          onClick={() => onCategoryChange(category)}
          sx={{
            bgcolor: selectedCategory === category ? 'primary.main' : 'transparent',
            color: selectedCategory === category ? 'white' : 'text.primary',
            '&:hover': {
              bgcolor: selectedCategory === category ? 'primary.dark' : 'rgba(0, 0, 0, 0.04)',
            },
            textTransform: 'uppercase',
            fontSize: '0.875rem',
            fontWeight: 500,
            minWidth: 'auto',
            padding: '6px 16px',
            borderRadius: '4px',
          }}
        >
          {category}
        </Button>
      ))}
    </Stack>
  );
};

const ResourceCard = ({ resource }) => {
  return (
    <Card 
      variant="outlined" 
      sx={{ 
        height: '100%',
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        '&:hover': { 
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)' 
        }
      }}
    >
      <CardContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 500 }}>
            {resource.name}
          </Typography>
          <Typography 
            variant="caption" 
            sx={{ 
              display: 'inline-block',
              bgcolor: 'primary.main',
              color: 'white',
              px: 1,
              py: 0.5,
              borderRadius: 1,
              mt: 1,
              fontSize: '0.75rem'
            }}
          >
            {resource.category}
          </Typography>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {resource.description}
        </Typography>

        <Stack spacing={1}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Business fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              Offered by: {resource.offered_by}
            </Typography>
          </Box>

          {resource.location && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocationOn fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                {resource.location}
              </Typography>
            </Box>
          )}

          {resource.link && (
            <Link
              href={resource.link}
              target="_blank"
              rel="noopener noreferrer"
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                color: 'primary.main',
                textDecoration: 'none',
                '&:hover': {
                  textDecoration: 'underline'
                }
              }}
            >
              <Book fontSize="small" />
              <Typography variant="body2">Visit Resource</Typography>
            </Link>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

const ResourceList = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  useEffect(() => {
    const loadResources = async () => {
      try {
        setLoading(true);
        const data = await fetchResources();
        setResources(data);
        setError(null);
      } catch (err) {
        setError('Failed to load resources. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadResources();
  }, []);
  
  const filteredResources = resources.filter(resource => {
    const matchesSearch = 
      resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.offered_by.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || resource.category.toUpperCase() === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <Box sx={{ width: '100%', p: 4 }}>
      <Typography 
        variant="h4" 
        component="h1" 
        sx={{ 
          mb: 4,
          fontSize: '2rem',
          fontWeight: 500,
        }}
      >
      </Typography>

      <Stack spacing={3} sx={{ mb: 4, width: '100%' }}>
        <TextField
          fullWidth
          placeholder="Search resources..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <Search color="action" sx={{ mr: 1 }} />,
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '4px',
            }
          }}
        />

        <CategoryButtons 
          selectedCategory={selectedCategory} 
          onCategoryChange={setSelectedCategory}
        />
      </Stack>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 4 }}>{error}</Alert>
      ) : (
        <>
          <Grid container spacing={3}>
            {filteredResources.map(resource => (
              <Grid item xs={12} sm={6} md={4} key={resource.id}>
                <ResourceCard resource={resource} />
              </Grid>
            ))}
          </Grid>

          {filteredResources.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="text.secondary" variant="h6">
                No resources found matching your criteria.
              </Typography>
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ 
        minHeight: '100vh',
        width: '100vw',
        bgcolor: 'background.default',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <Navbar />
        <Box component="main" sx={{ 
          flexGrow: 1,
          width: '100%',
          overflowX: 'hidden'
        }}>
          <ResourceList />
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
