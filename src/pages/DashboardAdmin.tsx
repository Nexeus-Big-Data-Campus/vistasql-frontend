import React, { useEffect, useState } from "react";
import { Divider, Button, Box, Drawer, List, ListItem, ListItemText, AppBar, Toolbar, Typography, Grid, Card, CardContent } from "@mui/material";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";

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
  const [registrationData, setRegistrationData] = useState<RegistrationData[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {    
    fetch("/api/user-stats")
      .then(res => res.json())
      .then(setUserStats);    
    fetch("/api/user-registration")
      .then(res => res.json())
      .then(setRegistrationData);
  }, []);

const renderMainContent = () => {
    if (selectedIndex === 0) {
      // Dashboard
      return (
        <>
          <AppBar position="static" sx={{ bgcolor: "#d3d3d3", boxShadow: "none", mb: 2 }}>
            <Toolbar>
              <Typography variant="subtitle1" component="div">
                DASHBOARD
              </Typography>
            </Toolbar>
          </AppBar>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1">Total users</Typography>
                  <Typography variant="h3">{userStats?.total_users ?? "-"}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1">Avg session duration</Typography>
                  <Typography variant="h3">00:30:20</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          <Box mt={4}>
            <Typography variant="subtitle1" gutterBottom>
              User registrations
            </Typography>
            <Card>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={registrationData}>
                    <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke="#8884d8" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Box>
        </>
      );
    } else if (selectedIndex === 1) {
      // Users
      return (
        <AppBar position="static" sx={{ bgcolor: "#d3d3d3", boxShadow: "none", mb: 2 }}>
          <Toolbar>
            <Typography variant="subtitle1" component="div">
              USERS
            </Typography>
          </Toolbar>
        </AppBar>
      );
    } else if (selectedIndex === 2) {
      // Feedback
      return (
        <AppBar position="static" sx={{ bgcolor: "#d3d3d3", boxShadow: "none", mb: 2 }}>
          <Toolbar>
            <Typography variant="subtitle1" component="div">
              FEEDBACK
            </Typography>
          </Toolbar>
        </AppBar>
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
            <ListItem
              button
              key={item.label}
              selected={selectedIndex === index}
              onClick={() => setSelectedIndex(index)}
              sx={{
                bgcolor: selectedIndex === index ? "#bdbdbd" : "inherit",
                "&:hover": { bgcolor: "#bdbdbd" }
              }}
            >
              <ListItemText primary={item.label} />
            </ListItem>
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