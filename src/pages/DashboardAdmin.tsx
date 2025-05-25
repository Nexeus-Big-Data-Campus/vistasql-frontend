import React, { useEffect, useState } from "react";
import { Card, CardContent, Typography, Grid } from "@mui/material";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";


type UserStats = {
  total_users: number;
  last_month: number;
};

type RegistrationData = {
  date: string;
  count: number;
};

const DashboardAdmin: React.FC = () => {
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [registrationData, setRegistrationData] = useState<RegistrationData[]>([]);

  useEffect(() => {
    //Utilando backend
    /*     fetch("/api/user-stats")
      .then(res => res.json())
      .then(setUserStats); */

    // Simulando datos de estadisticas de usuarios
    setTimeout(() => {
      setUserStats({
        total_users: 10,
        last_month: 3,
      });
    }, 500);

    // Simulando datos de registro de usuarios
/*     fetch("/api/user-registration")
      .then(res => res.json())
      .then(setRegistrationData);
  }, []); */

    // Simulando datos de registro de usuarios
    setTimeout(() => {
      setRegistrationData([
        { date: "2023-10-01", count: 1 },
        { date: "2023-10-02", count: 2 },
        { date: "2023-10-03", count: 3 },
        { date: "2023-10-04", count: 7 },
        { date: "2023-10-05", count: 5 },
      ]);
    }, 500);
  }, []);


  return (
    <div style={{ padding: 24 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">Total Usuarios</Typography>
              <Typography variant="h4">{userStats?.total_users ?? "-"}</Typography>
              <Typography color="text.secondary">
                Registrados el último mes: {userStats?.last_month ?? "-"}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">Registro de usuarios por fecha</Typography>
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
        </Grid>
      </Grid>
    </div>
  );
};

export default DashboardAdmin;