// src/pages/Reports.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import { Bar, Pie } from "react-chartjs-2";
import { Chart, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";
Chart.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const Reports = () => {
  const [data, setData] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get("https://hospital-backend-z8cg.onrender.com/api/stats/patient-summary", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setData(res.data);
      } catch (err) {
        console.error("Error loading stats:", err);
        setData(null);
      }
    };
    fetchStats();
  }, [token]);

  if (!data) return <p className="text-center p-4">Loading report...</p>;

  const ageData = {
    labels: Object.keys(data.ageGroups),
    datasets: [
      {
        label: "Patients by Age Group",
        data: Object.values(data.ageGroups),
        backgroundColor: ["#60A5FA", "#34D399", "#FBBF24", "#F87171"],
      },
    ],
  };

  const conditionData = {
    labels: Object.keys(data.conditions),
    datasets: [
      {
        label: "Medical Conditions",
        data: Object.values(data.conditions),
        backgroundColor: [
          "#6366F1", "#EC4899", "#FCD34D", "#10B981",
          "#F87171", "#3B82F6", "#A78BFA", "#F59E0B"
        ],
      },
    ],
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">📊 Patient Analytics</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-4 shadow rounded">
          <h3 className="font-semibold mb-2">Age Distribution</h3>
          <Bar data={ageData} />
        </div>
        <div className="bg-white p-4 shadow rounded">
          <h3 className="font-semibold mb-2">Condition Frequency</h3>
          <Pie data={conditionData} />
        </div>
      </div>
    </div>
  );
};

export default Reports;
