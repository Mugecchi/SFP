import { useState, useEffect, useMemo, isValidElement } from "react";
import {
	CircularProgress,
	TextField,
	Table,
	TableHead,
	TableRow,
	TableCell,
	TableBody,
	TableContainer,
	TablePagination,
	Box,
} from "@mui/material";
import PrintTableSummary from "../Includes/PrintTableSummary";
import { renderToStaticMarkup } from "react-dom/server";
export default function AutoTable({
	fetchDataFn,
	tableColumns,
	searchPlaceholder = "Search Record",
	children,
	refreshTrigger,
	print = false,
}) {
	const [data, setData] = useState([]);
	const [searchQuery, setSearchQuery] = useState("");
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(10);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState({
		open: false,
		message: "",
		severity: "info",
	});

	useEffect(() => {
		fetchData();
	}, [refreshTrigger]);

	const fetchData = async () => {
		try {
			const response = await fetchDataFn();
			setData(response || []);
		} catch (err) {
			setError({
				open: true,
				message: "Failed to fetch data.",
				severity: "error",
			});
		} finally {
			setLoading(false);
		}
	};

	const filteredData = useMemo(() => {
		const searchLower = searchQuery.toLowerCase();

		return data.filter((record) => {
			return tableColumns.some((col) => {
				if (col.type === "actions" || typeof col.accessor !== "function")
					return false;

				const value = col.accessor(record);

				if (value === null || value === undefined) return false;

				// Handle JSX output from accessor
				if (isValidElement(value)) {
					const htmlString = renderToStaticMarkup(value);
					return htmlString.toLowerCase().includes(searchLower);
				}

				// For string, number, etc.
				return value.toString().toLowerCase().includes(searchLower);
			});
		});
	}, [searchQuery, data, tableColumns]);

	const handlePageChange = (event, newPage) => setPage(newPage);
	const handleRowsPerPageChange = (event) => {
		setRowsPerPage(parseInt(event.target.value, 10));
		setPage(0);
	};

	const formatCurrency = (amount) => {
		if (!amount || isNaN(amount)) return "₱0.00";
		return new Intl.NumberFormat("en-PH", {
			style: "currency",
			currency: "PHP",
			minimumFractionDigits: 2,
		}).format(amount);
	};

	if (loading) return <CircularProgress />;

	return (
		<div>
			<Box
				display="flex"
				justifyContent="space-between"
				alignItems="center"
				gap={2}
				flexWrap="wrap"
			>
				<TextField
					label={searchPlaceholder}
					variant="outlined"
					margin="normal"
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
				/>

				<Box
					display="flex"
					alignItems="center"
					gap={1}
					flexWrap="wrap"
					justifyContent="center"
					flexDirection="row"
				>
					{print && (
						<PrintTableSummary
							records={filteredData}
							tableColumns={tableColumns}
						/>
					)}
					{children}
				</Box>
			</Box>

			<TableContainer>
				<Table>
					<TableHead>
						<TableRow>
							{tableColumns.map((col, idx) => (
								<TableCell key={idx}>{col.label}</TableCell>
							))}
						</TableRow>
					</TableHead>
					<TableBody>
						{filteredData
							.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
							.map((record, id) => (
								<TableRow key={record.id || id}>
									{tableColumns.map((col, idx) => (
										<TableCell key={idx}>
											{col.render
												? col.render(record)
												: col.type === "currency"
												? formatCurrency(col.accessor(record))
												: col.accessor(record)}
										</TableCell>
									))}
								</TableRow>
							))}
					</TableBody>
				</Table>
			</TableContainer>

			<Box sx={{ position: "absolute", bottom: 0, right: 0 }}>
				<TablePagination
					rowsPerPageOptions={[10, 20, 100]}
					component="div"
					count={filteredData.length}
					rowsPerPage={rowsPerPage}
					page={page}
					onPageChange={handlePageChange}
					onRowsPerPageChange={handleRowsPerPageChange}
				/>
			</Box>
		</div>
	);
}
