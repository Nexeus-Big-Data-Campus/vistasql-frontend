import React from "react";
import { AppBar, Toolbar, Typography, Grid, Card, CardContent, Box } from "@mui/material";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";

type Props = {
  userStats: { total_users: number; last_month: number } | null;
  averageSessionDuration: string;
  registrationData: { date: string; count: number }[];
};

const Dashboard: React.FC<Props> = ({ userStats, averageSessionDuration, registrationData }) => (
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
            <Typography variant="subtitle1">Last month</Typography>
            <Typography variant="h3">{userStats?.last_month ?? "-"}</Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={3.5}>
        <Card>
          <CardContent>
            <Typography variant="subtitle1">Avg session duration</Typography>
            <Typography variant="h3">{averageSessionDuration ?? "00:00:00"}</Typography>
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

export default Dashboard;