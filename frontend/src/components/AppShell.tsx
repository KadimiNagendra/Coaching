import { PropsWithChildren, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import GroupIcon from '@mui/icons-material/Group';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PaymentsIcon from '@mui/icons-material/Payments';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import AssessmentIcon from '@mui/icons-material/Assessment';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import NotificationsIcon from '@mui/icons-material/Notifications';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import SchoolIcon from '@mui/icons-material/School';
import { AppBar, Avatar, Box, CssBaseline, Divider, Drawer, IconButton, List, ListItemButton, ListItemIcon, ListItemText, Toolbar, Typography, Button } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { setToken, getUser } from '../api/client';

const drawerWidth = 280;
const teacherNav = [
  { label: 'Dashboard', path: '/dashboard', icon: <DashboardIcon fontSize="small" /> },
  { label: 'Students', path: '/students', icon: <GroupIcon fontSize="small" /> },
  { label: 'Batches', path: '/batches', icon: <CalendarMonthIcon fontSize="small" /> },
  { label: 'Fees', path: '/fees', icon: <PaymentsIcon fontSize="small" /> },
  { label: 'Attendance', path: '/attendance', icon: <FactCheckIcon fontSize="small" /> },
  { label: 'Exams', path: '/exams', icon: <AssessmentIcon fontSize="small" /> },
  { label: 'Results', path: '/results', icon: <EmojiEventsOutlinedIcon fontSize="small" /> },
  { label: 'Homework', path: '/homework', icon: <AssignmentIcon fontSize="small" /> },
  { label: 'Expenses', path: '/expenses', icon: <ReceiptLongIcon fontSize="small" /> },
  { label: 'Income', path: '/income', icon: <TrendingUpIcon fontSize="small" /> },
  { label: 'Reports', path: '/reports', icon: <AssessmentIcon fontSize="small" /> },
  { label: 'Notifications', path: '/notifications', icon: <NotificationsIcon fontSize="small" /> }
];
const portalNav = [
  { label: 'My Portal', path: '/portal', icon: <DashboardIcon fontSize="small" /> },
  { label: 'Results', path: '/results', icon: <EmojiEventsOutlinedIcon fontSize="small" /> }
];

export function AppShell({ children }: PropsWithChildren) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const user = getUser();
  const nav = user?.role === 'PARENT' || user?.role === 'STUDENT' ? portalNav : teacherNav;
  const portalLabel = user?.role === 'PARENT' ? 'Parent portal' : user?.role === 'STUDENT' ? 'Student portal' : 'Teacher dashboard';

  const drawer = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Toolbar sx={{ px: 2.5, py: 2.5, minHeight: 88 }}>
        <Avatar
          sx={{
            width: 42,
            height: 42,
            mr: 1.5,
            bgcolor: alpha('#818cf8', 0.2),
            color: '#c7d2fe',
            border: '1px solid',
            borderColor: alpha('#818cf8', 0.35)
          }}
        >
          <SchoolIcon fontSize="small" />
        </Avatar>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2, color: '#f8fafc' }}>
            Tuition Manager
          </Typography>
          <Typography variant="caption" sx={{ color: alpha('#ffffff', 0.55), letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            {portalLabel}
          </Typography>
        </Box>
      </Toolbar>
      <Divider sx={{ borderColor: alpha('#ffffff', 0.08), mx: 2 }} />
      <List sx={{ px: 1.5, py: 2, flexGrow: 1 }}>
        {nav.map((item) => (
          <ListItemButton
            key={item.path}
            component={Link}
            to={item.path}
            selected={location.pathname === item.path}
            onClick={() => setMobileOpen(false)}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
      <Box sx={{ px: 2.5, py: 2, borderTop: '1px solid', borderColor: alpha('#ffffff', 0.08) }}>
        <Typography variant="caption" sx={{ color: alpha('#ffffff', 0.45) }}>
          Manage classes, fees & attendance in one place.
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        color="inherit"
        elevation={0}
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` }
        }}
      >
        <Toolbar sx={{ minHeight: { xs: 64, sm: 70 } }}>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setMobileOpen(!mobileOpen)}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
              After-school tuition operations
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </Typography>
          </Box>
          <Button
            startIcon={<LogoutIcon />}
            variant="outlined"
            color="inherit"
            onClick={() => { setToken(null); navigate('/login'); }}
            sx={{
              borderColor: alpha('#0f172a', 0.12),
              color: 'text.secondary',
              '&:hover': { borderColor: alpha('#0f172a', 0.2), bgcolor: alpha('#0f172a', 0.03) }
            }}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{ display: { xs: 'block', sm: 'none' }, '& .MuiDrawer-paper': { width: drawerWidth } }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{ display: { xs: 'none', sm: 'block' }, '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' } }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          p: { xs: 2, md: 3 },
          mt: { xs: 8, sm: 9 }
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
