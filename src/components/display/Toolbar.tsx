import { Feedback } from "@mui/icons-material";
import { Box, IconButton, Tooltip } from "@mui/material";
import { useState } from "react";
import FeedbackModal from "../common/FeedbackModal";
import CustomSnackbar, { CustomSnackbarProps } from "../common/CustomSnackbar";


const Toolbar = () => {
    const [openFeedbackModal, setFeedbackModal] = useState(false);

    const handleFeedbackOpen = () => setFeedbackModal(true);
    const handleFeedbackClose = () => setFeedbackModal(false);

    const [snackbar, setSnackbar] = useState<CustomSnackbarProps>({open: false, severity: 'success', text: ''});

    const handleSnackbarClose = () => {
        setSnackbar(prev => ({ ...prev, open: false }));
    };

    return <>
        <Box component='nav' sx={{width: '100%', padding: '0.5rem', background: 'white', display: 'flex', justifyContent: 'flex-end'}}>
            <Tooltip title='Give us feedback'>
                <IconButton id="feedback-button" onClick={handleFeedbackOpen}>
                    <Feedback sx={{fontSize: '0.9rem'}}></Feedback>
                </IconButton>   
            </Tooltip>
        </Box>

        <FeedbackModal open={openFeedbackModal} onClose={handleFeedbackClose} onSnackbar={setSnackbar}></FeedbackModal>
        <CustomSnackbar {...snackbar} onClose={handleSnackbarClose}></CustomSnackbar>

    </>
};

export default Toolbar;