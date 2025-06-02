import { useState } from "react";
import { Box, Tabs, Tab, Typography } from "@mui/material";
import StatsSection from "./admin/StatsSection";
import UsersSection from "./admin/UserSection";
import FeedbackSection from "./admin/FeedbackSection";

function TabPanel(props: {
  children?: React.ReactNode;
  index: number;
  value: number;
}) {
  const { children, value, index } = props;

  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function AdminDashboard() {
  const [tabIndex, setTabIndex] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  return (
    <Box sx={{ width: "100%", p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Panel de Administrador
      </Typography>
      <Tabs value={tabIndex} onChange={handleTabChange} variant="fullWidth">
        <Tab label="Estadísticas" />
        <Tab label="Usuarios" />
        <Tab label="Comentarios" />
      </Tabs>

      <TabPanel value={tabIndex} index={0}>
        <StatsSection />
      </TabPanel>
      <TabPanel value={tabIndex} index={1}>
        <UsersSection />
      </TabPanel>
      <TabPanel value={tabIndex} index={2}>
        <FeedbackSection />
      </TabPanel>
    </Box>
  );
}
