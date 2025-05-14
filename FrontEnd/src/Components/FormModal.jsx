import React from "react";
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
} from "@mui/material";
const FormModal = ({ open, onClose, form, title = "" }) => {
	return (
		<Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
			<DialogTitle>{title}</DialogTitle>
			<DialogContent dividers>{form}</DialogContent>
			<DialogActions>
				<Button onClick={onClose} color="secondary">
					Close
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default FormModal;
