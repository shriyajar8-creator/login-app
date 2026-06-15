import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function DashboardChart({ title, labels, data, color }) {
  const chartData = {
    labels,
    datasets: [
      {
        label: title,
        data,
        borderColor: color,
        backgroundColor: `${color}55`,
        fill: true,
        tension: 0.35,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: { grid: { display: false } },
      y: { grid: { color: "rgba(148, 163, 184, 0.15)" }, beginAtZero: true },
    },
  };

  return (
    <div style={{ minHeight: 260, width: "100%" }}>
      <h3 style={{ marginBottom: 14, color: "#0f172a" }}>{title}</h3>
      <Line data={chartData} options={options} />
    </div>
  );
}

export default DashboardChart;
