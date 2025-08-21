import { Alert, Snackbar } from "@mui/material";

export interface CustomSnackbarProps {
    text: string;
    open: boolean;
    severity: 'success' | 'error' | 'info';
    onClose?: () => void;
}

const CustomSnackbar = ({text, open, severity, onClose}: CustomSnackbarProps) => {
    const DURATION = 3 * 1000;

    return <Snackbar open={open} anchorOrigin={{vertical: 'bottom', horizontal: 'center'}} autoHideDuration={DURATION} onClose={onClose}>
        <Alert severity={severity}>
            {text}
        </Alert>
    </Snackbar>
};

export default CustomSnackbar;