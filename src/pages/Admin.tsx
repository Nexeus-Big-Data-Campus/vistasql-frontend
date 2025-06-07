import React, { useEffect, useState } from "react";
import { ListItemButton, Grid, Divider, Button, Box, Drawer, List, ListItem, ListItemText, AppBar, Toolbar, Typography, Card, CardContent } from "@mui/material";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import Dashboard from "./admin/Dashboard";
import FeedbackSection from "./admin/FeedbackSection";
import UsersSection from "./admin/UserSection";


const drawerWidth = 200;

type UserStats = {
  total_users: number;
  last_month: number;
};

type RegistrationData = {
  date: string;
  count: number;
};

const menuItems = [
  { label: "Dashboard" },
  { label: "Users" },
  { label: "Feedback" },
];

const DashboardAdmin: React.FC = () => {
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [registrationData, setRegistrationData] = useState<RegistrationData[]>([{date:"2025-05-27", count:12}, {date:"2025-05-28", count:8}, {date:"2025-05-29", count:19}]);
  const [averageSessionDuration, setAverageSessionDuration] = useState<string>('00:00:00');
  const [usersData, setUsersData] = useState<any[]>([]);
  const [usersFeedback, setUsersFeedback] = useState<any[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  useEffect(() => {    
    fetch("/api/user-stats")
      .then(res => res.json())
      .then(setUserStats);    
    fetch("/api/user-registration")
      .then(res => res.json())
      .then(setRegistrationData);
    fetch("/api/average-session-duration")
      .then(res => res.json())
      .then(setAverageSessionDuration);
    fetch("/api/users_data")
      .then(res => res.json())
      .then(setUsersData);
    fetch("/api/users_feedback")
      .then(res => res.json())
      .then(setUsersFeedback);
  }, []);

const renderMainContent = () => {
  if (selectedIndex === 0) {
    // Dashboard
    return (
      <Dashboard
        userStats={userStats}
        averageSessionDuration={averageSessionDuration}
        registrationData={registrationData}
      />
    );
  } else if (selectedIndex === 1) {
    // Users
    return (
      <UsersSection usersData={usersData} />
    );
  } else if (selectedIndex === 2) {
    // Feedback
    return (
      <FeedbackSection usersFeedback={usersFeedback} />
    );
  }
};

  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: "border-box", background: "#e0e0e0" },
        }}
      >
        <Toolbar>
          <Typography variant="h6">VistaSQL</Typography>
        </Toolbar>
        <Divider />
        <List>
          {menuItems.map((item, index) => (
            <ListItemButton
              key={item.label}
              selected={selectedIndex === index}
              onClick={() => setSelectedIndex(index)}
              sx={{
                bgcolor: selectedIndex === index ? "#bdbdbd" : "inherit",
                "&:hover": { bgcolor: "#bdbdbd" }
              }}
            >
              <ListItemText primary={item.label} />
            </ListItemButton>
          ))}
        </List>
      </Drawer>

      {/* Main content */}
      <Box component="main" sx={{ flexGrow: 1, bgcolor: "#f5f5f5", p: 3 }}>
        {renderMainContent()}
      </Box>
    </Box>
  );
};

export default DashboardAdmin;