import React, { useState, useEffect } from "react";
import { AppBar, Toolbar, Button, Card, CardContent, Divider, FormControlLabel, Typography, List, ListItem, ListItemText, Rating, Switch,} from "@mui/material";
import PaginationControls from "../../components/PaginationControls";

interface Feedback {
  id: number;
  message: string;
  user: string;
  rating: number;
  hidden: boolean;
}
const FEEDBACKS_PER_PAGE = 15;

// Simula feedbacks con rating
const allFeedbacks = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  message: `Comentario ${i + 1}`,
  user: `Usuario ${i + 1}`,
  rating: (i % 5) + 1,
  hidden: false,
}));

// Guardar datos en localStorage
if (!localStorage.getItem("feedbacks")) {
  localStorage.setItem("feedbacks", JSON.stringify(allFeedbacks));
}

interface FeedbackSectionProps {
  usersFeedback: Feedback[];
}

export default function FeedbackSection({ usersFeedback }: FeedbackSectionProps) {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>(usersFeedback && usersFeedback.length > 0 ? usersFeedback : allFeedbacks);
  const [page, setPage] = useState(1);
  const [showHidden, setShowHidden] = useState(false);

  useEffect(() => {
    setFeedbacks(usersFeedback && usersFeedback.length > 0 ? usersFeedback : allFeedbacks);
  }, [usersFeedback]);
    
  // Filtra los comentarios
  const visibleFeedbacks = showHidden
    ? feedbacks
    : feedbacks.filter((fb) => !fb.hidden);

  // Calcula totalPages y los feedbacks paginados usando solo los visibles
  const totalPages = Math.ceil(feedbacks.length / FEEDBACKS_PER_PAGE);
  const startIndex = (page - 1) * FEEDBACKS_PER_PAGE;
  const paginatedFeedbacks = visibleFeedbacks.slice(
    startIndex,
    startIndex + FEEDBACKS_PER_PAGE
  );

  const toggleVisibility = (id: number) => {
    const updated = feedbacks.map((fb) =>
      fb.id === id ? { ...fb, hidden: !fb.hidden } : fb
    );
    setFeedbacks(updated);
    localStorage.setItem("feedbacks", JSON.stringify(updated));
  };

  return (
  <>
    <AppBar position="static" sx={{ bgcolor: "#d3d3d3", boxShadow: "none", mb: 2 }}>
      <Toolbar>
        <Typography variant="subtitle1" component="div">
          FEEDBACK
        </Typography>
      </Toolbar>
    </AppBar>    
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Comentarios de usuarios
        </Typography>
        <FormControlLabel
          control={
            <Switch
              checked={showHidden}
              onChange={() => setShowHidden((v) => !v)}
              color="primary"
            />
          }
          label="Mostrar comentarios ocultos"
        />
        <List>
          {paginatedFeedbacks.map((fb, idx) => (
            <React.Fragment key={fb.id}>
              <ListItem key={fb.id} alignItems="center">
                <Rating
                  name={`rating-${fb.id}`}
                  value={fb.rating}
                  readOnly
                  size="small"
                  sx={{ marginRight: 2 }}
                  precision={0.5}
                />
                <ListItemText
                  primary={fb.message}
                  secondary={`Enviado por: ${fb.user}`}
                />
                <Button
                  size="small"
                  onClick={() => toggleVisibility(fb.id)}
                  color={fb.hidden ? "success" : "primary"}
                >
                  {fb.hidden ? "Mostrar" : "Ocultar"}
                </Button>
              </ListItem>
              {idx < feedbacks.length - 1 && <Divider component="li" />}
            </React.Fragment>
          ))}
        </List>
        <PaginationControls
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </CardContent>
    </Card>
  </>
  );
}
