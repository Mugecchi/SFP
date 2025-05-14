import { Tooltip } from "@mui/material";
import React from "react";

function AutoToolTip({ children }) {
	return (
		<div>
			<Tooltip title={children} arrow placement="top-start">
				<span>{children}</span>
			</Tooltip>
		</div>
	);
}

export default AutoToolTip;
