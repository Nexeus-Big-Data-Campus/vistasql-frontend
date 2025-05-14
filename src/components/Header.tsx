import { Button, Typography } from "@mui/material";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import feedbackform from "./feedbackForm";
import { useState } from "react";
import FeedbackForm from "./feedbackForm";


export default function Header() {
    const [openFeedback, setOpenFeedback] = useState(false);

    return (
        <>
            <AppBar component="nav" position="relative">
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        VistaSQL
                    </Typography>

                    <Button
                        variant="contained"
                        color="secondary"
                        onClick={() => setOpenFeedback(true)}
                    >
                        Enviar Feedback
                    </Button>
                </Toolbar>
            </AppBar>

            {/* Popup modal del formulario */}
            <FeedbackForm open={openFeedback} onClose={() => setOpenFeedback(false)} />
        </>
    );
}