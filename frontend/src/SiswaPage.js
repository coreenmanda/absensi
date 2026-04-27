function SiswaPage({ user }) {
  const [inputCode, setInputCode] = React.useState("");

  const submitAttendance = async () => {
    const res = await fetch("http://localhost:5000/check-code", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code: inputCode }),
    });

    const data = await res.json();
    alert(data.message);
  };

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>Selamat datang Siswa, {user.username}</h1>

      <input
        placeholder="Masukkan kode"
        value={inputCode}
        onChange={(e) => setInputCode(e.target.value)}
      />

      <button onClick={submitAttendance}>Absen Hadir</button>
    </div>
  );
}
