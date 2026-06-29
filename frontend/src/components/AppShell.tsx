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
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import ListAltIcon from '@mui/icons-material/ListAlt';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import HomeIcon from '@mui/icons-material/Home';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import PriceCheckIcon from '@mui/icons-material/PriceCheck';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import PeopleIcon from '@mui/icons-material/People';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import SettingsIcon from '@mui/icons-material/Settings';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import { AppBar, Avatar, Box, CssBaseline, Divider, Drawer, IconButton, List, ListItemButton, ListItemIcon, ListItemText, Toolbar, Typography, Button, Collapse, Tooltip } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { setToken, getUser, homePath } from '../api/client';

const drawerWidth = 280;

const teacherTopNav = [
  { label: 'Dashboard', path: '/dashboard', icon: <DashboardIcon fontSize="small" /> },
  { label: 'Attendance', path: '/attendance', icon: <FactCheckIcon fontSize="small" /> },
  { label: 'Batches', path: '/batches', icon: <CalendarMonthIcon fontSize="small" /> },
  { label: 'Homework', path: '/homework', icon: <AssignmentIcon fontSize="small" /> },
  { label: 'Exams', path: '/exams', icon: <AssessmentIcon fontSize="small" /> },
  { label: 'Results', path: '/results', icon: <EmojiEventsOutlinedIcon fontSize="small" /> },
  { label: 'Topics Master', path: '/topics-master', icon: <ListAltIcon fontSize="small" /> }
];

const teacherAdminNav = [
  { label: 'Students', path: '/students', icon: <GroupIcon fontSize="small" /> },
  { label: 'Finance', path: '/finance', icon: <PaymentsIcon fontSize="small" /> },
  { label: 'Reports', path: '/reports', icon: <AssessmentIcon fontSize="small" /> },
  { label: 'Notifications', path: '/notifications', icon: <NotificationsIcon fontSize="small" /> }
];

const portalNav = [
  { label: 'My Portal', path: '/portal', icon: <DashboardIcon fontSize="small" /> },
  { label: 'Results', path: '/results', icon: <EmojiEventsOutlinedIcon fontSize="small" /> }
];

const clarityNav = [
  { label: 'Dashboard', path: '/clarity-home?tab=dashboard', icon: <DashboardIcon fontSize="small" /> },
  { label: 'Income & Expenses', path: '/clarity-home?tab=income-expenses', icon: <AccountBalanceWalletIcon fontSize="small" /> },
  { label: 'Budgets & Bills', path: '/clarity-home?tab=budgets-bills', icon: <NotificationsActiveIcon fontSize="small" /> },
  { label: 'Loans & EMIs', path: '/clarity-home?tab=loans-emis', icon: <PriceCheckIcon fontSize="small" /> },
  { label: 'Investments', path: '/clarity-home?tab=investments', icon: <ShowChartIcon fontSize="small" /> },
  { label: 'Assets & Debts', path: '/clarity-home?tab=assets-debts', icon: <AccountBalanceIcon fontSize="small" /> },
  { label: 'Family & Payments', path: '/clarity-home?tab=family-payments', icon: <PeopleIcon fontSize="small" /> },
  { label: 'Reports & Exporter', path: '/clarity-home?tab=reports-exporter', icon: <AssessmentIcon fontSize="small" /> },
  { label: 'System Settings', path: '/clarity-home?tab=system-settings', icon: <SettingsIcon fontSize="small" /> }
];

export function AppShell({ children }: PropsWithChildren) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const user = getUser();
  const isClarityHome = location.pathname.startsWith('/clarity-home');
  const backPath = homePath(user?.role);
  
  const [adminOpen, setAdminOpen] = useState(() => {
    const subPaths = ['/students', '/notifications', '/finance', '/reports'];
    return subPaths.some(p => location.pathname.startsWith(p));
  });

  const portalLabel = user?.role === 'PARENT' ? 'Parent portal' : user?.role === 'STUDENT' ? 'Student portal' : 'Teacher Portal';

  const drawer = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Toolbar sx={{ px: 2.5, py: 2.5, minHeight: 88, display: 'flex', alignItems: 'center' }}>
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
          {isClarityHome ? <HomeIcon fontSize="small" /> : <SchoolIcon fontSize="small" />}
        </Avatar>
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2, color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {isClarityHome ? 'Clarity' : 'Clarity'}
          </Typography>
          <Typography variant="caption" sx={{ color: alpha('#ffffff', 0.55), letterSpacing: '0.04em', textTransform: 'uppercase', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>
            {isClarityHome ? 'Home Finance' : portalLabel}
          </Typography>
        </Box>
        <Tooltip title={isClarityHome ? "Back to Portal" : "Clarity Home (Personal Finance)"}>
          <IconButton
            component={Link}
            to={isClarityHome ? backPath : "/clarity-home"}
            sx={{
              color: '#c7d2fe',
              bgcolor: alpha('#818cf8', 0.1),
              '&:hover': {
                bgcolor: alpha('#818cf8', 0.2)
              },
              p: 1,
              border: '1px solid',
              borderColor: alpha('#818cf8', 0.2)
            }}
          >
            {isClarityHome ? <SchoolIcon fontSize="small" /> : <HomeIcon fontSize="small" />}
          </IconButton>
        </Tooltip>
      </Toolbar>
      <Divider sx={{ borderColor: alpha('#ffffff', 0.08), mx: 2 }} />
      <List sx={{ px: 1.5, py: 2, flexGrow: 1 }}>
        {isClarityHome ? (
          clarityNav.map((item) => {
            const currentTab = new URLSearchParams(location.search).get('tab') || 'dashboard';
            const itemTab = item.path.split('tab=')[1] || 'dashboard';
            const isSelected = currentTab === itemTab;
            return (
              <ListItemButton
                key={item.path}
                component={Link}
                to={item.path}
                selected={isSelected}
                onClick={() => setMobileOpen(false)}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            );
          })
        ) : user?.role === 'PARENT' || user?.role === 'STUDENT' ? (
          portalNav.map((item) => (
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
          ))
        ) : (
          <>
            {teacherTopNav.map((item) => (
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

            <ListItemButton onClick={() => setAdminOpen(!adminOpen)}>
              <ListItemIcon><AdminPanelSettingsIcon fontSize="small" /></ListItemIcon>
              <ListItemText primary="Administration" />
              {adminOpen ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
            
            <Collapse in={adminOpen} timeout="auto" unmountOnExit>
              <List component="div" disablePadding sx={{ pl: 2 }}>
                {teacherAdminNav.map((item) => (
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
            </Collapse>
          </>
        )}
      </List>
      <Divider sx={{ borderColor: alpha('#ffffff', 0.08), mx: 2 }} />
      <List sx={{ px: 1.5, py: 1 }}>
        <ListItemButton onClick={() => { setToken(null); navigate('/login'); setMobileOpen(false); }}>
          <ListItemIcon sx={{ color: '#ef4444' }}><LogoutIcon fontSize="small" /></ListItemIcon>
          <ListItemText primary="Logout" sx={{ color: '#ef4444' }} />
        </ListItemButton>
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
          ml: { sm: `${drawerWidth}px` },
          display: isClarityHome ? { xs: 'flex', sm: 'none' } : 'flex'
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
            {!isClarityHome && (
              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary' }}>
                {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </Typography>
            )}
          </Box>

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
          mt: isClarityHome ? { xs: 8, sm: 0 } : { xs: 8, sm: 9 }
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
