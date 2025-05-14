import React, { lazy } from "react";
import {
	BrowserRouter as Router,
	Routes,
	Route,
	Navigate,
} from "react-router-dom";
import Sidebar from "./Includes/Sidebar";
import Header from "./Includes/Header";
import { ContentContainer, ThemeProv } from "./Includes/styledComponents";
import LoadingScreen from "./Includes/LoadingScreen";
import { useAuth } from "./utils/useAuth";
import SchoolsTable from "./Pages/SchoolsTable";
import DailyRecord from "./Pages/DailyRecord";
import Dashboard from "./Pages/Dashboard";
import Login from "./Pages/Login";
import HealthData from "./Pages/HealthData";
const Registration = lazy(() => import("./Pages/Registration"));
const StudentsTable = lazy(() => import("./Pages/StudentsTable"));
const App = () => {
	// Consume Auth context values using the useAuth hook
	const { isLoggedIn, user, loading, setIsLoggedIn } = useAuth();

	// Protected route wrapper
	const ProtectedRoute = ({ element, role }) => {
		if (!isLoggedIn) {
			console.log("User is not logged in. Redirecting to login...");
			return <Navigate to="/login" />;
		}

		if (role && user?.role !== role) {
			console.log(`Unauthorized access attempt to ${role}-only page.`);
			return <Navigate to="/dashboard" />;
		}

		return element;
	};
	if (loading) return <LoadingScreen />;

	return (
		<div>
			<Router>
				<div style={{ display: "flex", height: "100vh" }}>
					<div>{isLoggedIn && <Sidebar />}</div>
					<div
						style={{ width: "100%", display: "flex", flexDirection: "column" }}
					>
						{isLoggedIn && <Header user={user} />}
						<div
							style={{
								padding: isLoggedIn ? "20px" : 0,
								overflowY: "auto",
								flex: 1,
							}}
						>
							{isLoggedIn ? (
								<ThemeProv>
									<ContentContainer>
										<Routes>
											<Route path="/" element={<Navigate to="/dashboard" />} />

											<Route
												path="/dashboard"
												element={<ProtectedRoute element={<Dashboard />} />}
											/>

											<Route
												path="/users"
												element={<ProtectedRoute element={<Registration />} />}
											/>
											<Route
												path="/studentsbiorecords"
												element={<ProtectedRoute element={<StudentsTable />} />}
											/>
											<Route
												path="/studentshealthdata"
												element={<ProtectedRoute element={<HealthData />} />}
											/>
											<Route
												path="/schools"
												element={<ProtectedRoute element={<SchoolsTable />} />}
											/>
											<Route
												path="/dailyattendance"
												element={<ProtectedRoute element={<DailyRecord />} />}
											/>
											<Route
												path="/login"
												element={
													isLoggedIn ? (
														<Navigate to="/" />
													) : (
														<Login setIsLoggedIn={setIsLoggedIn} />
													)
												}
											/>
										</Routes>
									</ContentContainer>
								</ThemeProv>
							) : (
								<ThemeProv>
									<Routes>
										<Route
											path="/login"
											element={<Login setIsLoggedIn={setIsLoggedIn} />}
										/>
										<Route path="*" element={<Navigate to="/login" />} />
									</Routes>
								</ThemeProv>
							)}
						</div>
					</div>
				</div>
			</Router>
		</div>
	);
};

export default App;
