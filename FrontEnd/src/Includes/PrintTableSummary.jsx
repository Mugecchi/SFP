import { Button } from "@mui/material";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

// Helper: flatten JSX, handle objects, and format values
const formatValue = (value) => {
	if (React.isValidElement(value)) {
		// Convert JSX to plain HTML string
		return renderToStaticMarkup(value);
	} else if (typeof value === "object" && value !== null) {
		return Object.entries(value)
			.map(
				([key, val]) =>
					`<strong>${capitalize(key)}:</strong> ${formatValue(val)}<br/>`
			)
			.join("");
	} else if (typeof value === "string" && !isNaN(Date.parse(value))) {
		return new Date(value).toLocaleDateString();
	}
	return value ?? "N/A";
};

const capitalize = (str) =>
	str.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const PrintTableSummary = ({
	records = [],
	tableColumns = [],
	title = "Records Summary",
}) => {
	const handlePrint = () => {
		// Filter out action columns by type
		const filteredColumns = tableColumns.filter(
			(col) => col.type !== "actions"
		);

		// Format records using the filtered columns
		const formattedRecords = records.map((record) => {
			const entry = {};
			filteredColumns.forEach((col) => {
				const label =
					typeof col.label === "string"
						? col.label
						: renderToStaticMarkup(col.label);
				entry[label] = col.accessor ? col.accessor(record) : "N/A";
			});
			return entry;
		});

		const printWindow = window.open("", "_blank");
		printWindow.document.write(`
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      padding: 40px;
      background-color: #f9fafa;
      color: #2c3e50;
      line-height: 1.6;
    }

    h2 {
      text-align: center;
      margin-bottom: 40px;
      color: #2c3e50;
      font-size: 26px;
      font-weight: bold;
    }

    ol {
      padding-left: 0;
      list-style: none;
      max-width: 900px;
      margin: 0 auto;
    }

    .summary-item {
      background: #fff;
      padding: 24px;
      margin-bottom: 20px;
      border-left: 6px solid #3498db;
      border-radius: 10px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06);
    }

    .summary-details {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      border-bottom: 1px solid #ecf0f1;
      padding-bottom: 4px;
    }

    .summary-row:last-child {
      border-bottom: none;
    }

    .summary-label {
      font-weight: 600;
      color: #34495e;
      flex-basis: 40%;
    }

    .summary-value {
      flex-basis: 55%;
      text-align: right;
      color: #2c3e50;
    }

    .print-btn {
      display: block;
      width: 180px;
      margin: 30px auto;
      padding: 12px 20px;
      text-align: center;
      background: #3498db;
      color: #fff;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 16px;
      font-weight: bold;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    }

    @media print {
      .print-btn { display: none; }
      body { background: #fff; color: #000; padding: 20px; }
      .summary-item { box-shadow: none; page-break-inside: avoid; }
      .summary-row { border-color: #ccc; }
    }
  </style>
</head>
<body>
  <div class="summary-container">
    <h2>${title}</h2>
    <ol>
      ${formattedRecords
				.map(
					(record) => `
        <li class="summary-item">
          <div class="summary-details">
            ${Object.entries(record)
							.map(
								([label, val]) => `
                  <div class="summary-row">
                    <div class="summary-label">${label}:</div>
                    <div class="summary-value">${formatValue(val)}</div>
                  </div>`
							)
							.join("")}
          </div>
        </li>
      `
				)
				.join("")}
    </ol>
    <button class="print-btn" onclick="window.print();">Print Summary</button>
  </div>
</body>
</html>

`);
		printWindow.document.close();
	};

	return (
		<Button onClick={handlePrint} variant="outlined">
			Print Summary
		</Button>
	);
};

export default PrintTableSummary;
