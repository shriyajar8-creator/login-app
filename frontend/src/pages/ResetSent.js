function ResetSent() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: "#f4f6f9",
      }}
    >
      <div
        style={{
          width: "400px",
          backgroundColor: "white",
          padding: "30px",
          borderRadius: "10px",
          textAlign: "center",
          boxShadow: "0px 2px 10px rgba(0,0,0,0.1)",
        }}
      >
        <h1>✅ Email Sent</h1>

        <p>
          Password reset link has been sent to your email.
        </p>
      </div>
    </div>
  );
}

export default ResetSent;
