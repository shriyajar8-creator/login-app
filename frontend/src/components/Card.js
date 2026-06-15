
function Card({ title, value }) {
	return (
		<div
			style={{
				backgroundColor: "white",
				width: "220px",
				padding: "20px",
				borderRadius: "10px",
				boxShadow: "0px 2px 10px rgba(0,0,0,0.1)",
			}}
		>
			<h3>{title}</h3>
			<h1>{value}</h1>
		</div>
	);
}

export default Card;
