import { useEffect } from 'react';
import { ResourceList } from './components/ResourceList';
import { LoginForm } from './components/LoginForm';
import { RegisterForm } from './components/RegisterForm';
import ForgotPasswordForm from './components/ForgotPasswordForm';
import AdminPanel from './components/AdminPanel';
import { SuggestResourceForm } from './components/SuggestResourceForm';
import Navbar from './components/NavBar';
import { ResetPasswordForm } from './components/ResetPasswordForm';
import { VerificationSuccess } from './components/VerificationSuccess';
import { VerificationFailed } from './components/VerificationFailed';

import { 
  ThemeProvider, 
  createTheme, 
  CssBaseline, 
  Box, 
  Typography, 
  Button,
  Alert
} from '@mui/material';
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Link as RouterLink, 
  useNavigate 
} from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

const theme = createTheme({
  palette: {
    primary: {
      main: '#E31837',
      contrastText: '#fff',
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

// Banner component that informs users they can suggest resources if they register
const Banner = () => {
  const { user } = useAuth();
  if (user) return null;

  return (
    <Box sx={{ p: 2 }}>
      <Alert severity="info">
        Did you know? If you register, you can{' '}
        <RouterLink 
          to="/suggest-resource" 
          style={{ color: 'inherit', textDecoration: 'underline', fontWeight: 'bold' }}
        >
          suggest resources
        </RouterLink>{' '}
        to help others!
      </Alert>
    </Box>
  );
};

const HomePage = () => {
  return (
    <Box sx={{ p: 4, textAlign: 'center' }}>
      <Typography variant="h3" component="h1" gutterBottom>
        Welcome to INeedHelp@YorkU
      </Typography>
      <Typography variant="h5" component="h2" color="text.secondary" gutterBottom>
        Your one-stop platform for finding resources and support at York University
      </Typography>
      <Button
        variant="contained"
        color="primary"
        size="large"
        component={RouterLink}
        to="/"
        sx={{ mt: 4 }}
      >
        Browse Resources
      </Button>
    </Box>
  );
};

// Protected route component for both normal and admin-only routes
const ProtectedRoute = ({ element: Element, adminOnly = false }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (adminOnly && !['admin', 'root'].includes(user.role.toLowerCase())) {
      navigate('/');
    }
  }, [user, adminOnly, navigate]);

  if (!user) return null;
  if (adminOnly && !['admin', 'root'].includes(user.role.toLowerCase())) return null;

  return <Element />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Box
            sx={{
              minHeight: '100vh',
              width: '100vw',
              bgcolor: 'background.default',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Navbar />
            {/* Banner is shown on all pages when the user is not logged in */}
            <Banner />
            <Box component="main" sx={{ flexGrow: 1, width: '100%', overflowX: 'hidden' }}>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<ResourceList />} />
                <Route path="/login" element={<LoginForm />} />
                <Route path="/register" element={<RegisterForm />} />
                <Route path="/forgot-password" element={<ForgotPasswordForm />} />
                <Route path="/reset-password" element={<ResetPasswordForm />} />
                <Route path="/verification-success" element={<VerificationSuccess />} />
                <Route path="/verification-failed" element={<VerificationFailed />} />

                {/* Protected Routes */}
                <Route 
                  path="/suggest-resource" 
                  element={<ProtectedRoute element={SuggestResourceForm} />} 
                />
                {/* Admin Routes */}
                <Route 
                  path="/admin" 
                  element={<ProtectedRoute element={AdminPanel} adminOnly={true} />} 
                />
              </Routes>
            </Box>
          </Box>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
