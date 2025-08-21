import { BugReport, Comment } from "@mui/icons-material";
import { Box, Button, Dialog, DialogContent, DialogTitle, FormControl, InputLabel, Menu, MenuItem, Select, Snackbar, TextField } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../contexts/UserContext";
import { ApiService } from "../../services/ApiService";
import { CustomSnackbarProps } from "./CustomSnackbar";
import { useTranslation } from "react-i18next";

enum FeedbackType {
    FEEDBACK_MESSAGE = "message",
    BUG_REPORT = "bug"
}

export interface CreateFeedback {
    userId: string;
    messageType: FeedbackType;
    message: string;
}

interface Props {
    open: boolean;
    onClose: () => void;
    onSnackbar: (_: CustomSnackbarProps) => void
}

const FeedbackModal = ({open, onClose, onSnackbar}: Props) => {
    const {t} = useTranslation();
    const BUG_REPORT_LABEL = t('feedbackModal.bugLabel');
    const FEEDBACK_COMMENT_LABEL = t('feedbackModal.commentLabel');

    const [feedbackType, setFeedbackType] = useState(FeedbackType.FEEDBACK_MESSAGE);
    const [messageFieldLabel, setMessageFieldLabel] = useState(FEEDBACK_COMMENT_LABEL);
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const {user, jwtToken} = useContext(UserContext);
    const apiService = ApiService.getInstance();

    useEffect(() => {
        setMessageFieldLabel(feedbackType === FeedbackType.FEEDBACK_MESSAGE ? FEEDBACK_COMMENT_LABEL : BUG_REPORT_LABEL);
    }, [feedbackType]);

    const onSendSuccess = () => {
        onSnackbar({
            open: true,
            severity: 'success',
            text: t('feedbackModal.success'),
        });

        setIsLoading(false);
        onClose();
    };

    const onSendError = () => {
        onSnackbar({
            open: true,
            severity: 'error',
            text: t('api.error')
        });

        setIsLoading(false);
    };
    
    const sendFeedback = async () => {
        setIsLoading(true);
        try {
            const input: CreateFeedback = {
                userId: user?.id ?? '',
                messageType: feedbackType,
                message: message,
            };
            const res = await apiService.sendFeedback(input, jwtToken ?? '');

            if (!("error" in res)) {
                onSendSuccess();
            } else {
                onSendError();
            }
        } catch {
            onSendError();
        }
    };

    return <Dialog 
        open={open}
        onClose={onClose}
        >
        <DialogTitle>{t('feedbackModal.title')}</DialogTitle>
        <DialogContent sx={{width: '550px', padding: '1rem'}}>
            <p className="text-xs mb-8">{t('feedbackModal.subtitle')}</p>
            
            <FormControl fullWidth>
                <InputLabel id="feedback-type-label">{t('feedbackModal.feebackType')}</InputLabel>
                <Select 
                    labelId="feedback-type-label" 
                    id="feedback-type" 
                    value={feedbackType}
                    label="Feedback type"
                    onChange={(e) => setFeedbackType(e.target.value)}
                >

                    <MenuItem value={FeedbackType.FEEDBACK_MESSAGE}>
                        <Comment sx={{fontSize: '1rem', marginRight: '0.5rem'}}></Comment>
                        {t('feedbackModal.commentType')}
                    </MenuItem>
                    <MenuItem value={FeedbackType.BUG_REPORT}>
                        <BugReport sx={{fontSize: '1rem', marginRight: '0.5rem'}}></BugReport>
                        {t('feedbackModal.bugType')}
                    </MenuItem>
                </Select>
            </FormControl>

            <FormControl fullWidth sx={{margin: '1rem 0'}}>
                <TextField multiline
                    id="feedback-message"
                    label={messageFieldLabel}
                    variant="outlined"
                    rows={10}
                    onChange={(e) => setMessage(e.target.value)}
                    >
                </TextField>
            </FormControl>

            {!isLoading && 
            <Box sx={{display: 'flex', justifyContent: 'end', gap: '1rem'}}>
                <Button variant="text" onClick={onClose}>Close</Button>
                <Button variant="contained" type="submit" disabled={message.length === 0} onClick={sendFeedback}>Send</Button>
            </Box>
            }
        </DialogContent>
    </Dialog>
};

export default FeedbackModal;