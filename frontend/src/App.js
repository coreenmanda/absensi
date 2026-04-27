import React, { useState } from "react";

export default function App() {
  const [user, setUser] = useState(null);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("siswa");

  const [inputCode, setInputCode] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");

  const [status, setStatus] = useState("Hadir");

  const [tanggal, setTanggal] = useState("");
  const [riwayat, setRiwayat] = useState([]);

  const [search, setSearch] = useState("");
  const [filterTanggal, setFilterTanggal] = useState("");
  const [absensiAdmin, setAbsensiAdmin] = useState([]);

  /* ================= LOGIN ================= */
  const handleLogin = async () => {
    const res = await fetch("http://localhost:5000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (res.ok) {
      setUser(data.user);
      setInputCode(""); // FIX: reset kode biar tidak nyangkut
    } else {
      alert(data.message);
    }
  };

  /* ================= REGISTER ================= */
  const handleRegister = async () => {
    const res = await fetch("http://localhost:5000/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, role }),
    });

    const data = await res.json();
    alert(data.message);
  };

  /* ================= GENERATE CODE ================= */
  const generateCode = async () => {
    const res = await fetch("http://localhost:5000/generate-code", {
      method: "POST",
    });

    const data = await res.json();

    if (res.ok) {
      setGeneratedCode(data.code);
      setInputCode(""); // FIX: hindari input lama (misalnya 123)
    }
  };

  /* ================= ABSENSI ================= */
  const submitAttendance = async () => {
    const res = await fetch("http://localhost:5000/check-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: user.username,
        code: inputCode, // 🔥 FIX UTAMA: selalu dari state
        status,
      }),
    });

    const data = await res.json();
    alert(data.message);
  };

  /* ================= RIWAYAT ================= */
  const getRiwayat = async () => {
    const res = await fetch(
      `http://localhost:5000/riwayat?username=${user.username}&tanggal=${tanggal}`
    );

    const data = await res.json();
    setRiwayat(Array.isArray(data) ? data : []);
  };

  /* ================= ADMIN FILTER ================= */
  const getAdminAbsensi = async () => {
    let url = "http://localhost:5000/admin-absensi";

    const params = [];
    if (search) params.push(`search=${search}`);
    if (filterTanggal) params.push(`tanggal=${filterTanggal}`);

    if (params.length) url += "?" + params.join("&");

    const res = await fetch(url);
    const data = await res.json();

    setAbsensiAdmin(Array.isArray(data) ? data : []);
  };

  /* ================= COUNT STATUS ================= */
  const countStatus = (type) =>
    absensiAdmin.filter((a) => a.status === type).length;

  const total = absensiAdmin.length;

  const bar = (value, color) => ({
    width: total ? `${(value / total) * 100}%` : "0%",
    height: 20,
    background: color,
    marginBottom: 8,
  });

  /* ================= STYLE ================= */
  const styles = {
    container: {
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      background: "linear-gradient(135deg,#667eea,#764ba2)",
      fontFamily: "Arial",
    },
    card: {
      width: 420,
      padding: 20,
      borderRadius: 15,
      background: "white",
      boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
    },
    input: {
      width: "100%",
      padding: 10,
      marginTop: 10,
      borderRadius: 8,
      border: "1px solid #ddd",
    },
    button: {
      width: "100%",
      padding: 10,
      marginTop: 10,
      borderRadius: 8,
      border: "none",
      background: "#4f46e5",
      color: "white",
      fontWeight: "bold",
      cursor: "pointer",
    },
  };

  /* ================= LOGIN PAGE ================= */
  if (!user) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h2>Login</h2>

          <input
            style={styles.input}
            placeholder="username"
            onChange={(e) => setUsername(e.target.value)}
          />

          <input
            style={styles.input}
            type="password"
            placeholder="password"
            onChange={(e) => setPassword(e.target.value)}
          />

          <select
            style={styles.input}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="siswa">Siswa</option>
            <option value="admin">Admin</option>
          </select>

          <button style={styles.button} onClick={handleLogin}>
            Login
          </button>

          <button
            style={{ ...styles.button, background: "green" }}
            onClick={handleRegister}
          >
            Register
          </button>
        </div>
      </div>
    );
  }

  /* ================= ADMIN ================= */
  if (user.role === "admin") {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h2>Admin Dashboard</h2>
          <p>{user.username}</p>

          <button style={styles.button} onClick={generateCode}>
            Generate Code
          </button>

          {generatedCode && <h3>{generatedCode}</h3>}

          <input
            style={styles.input}
            placeholder="Search nama"
            onChange={(e) => setSearch(e.target.value)}
          />

          <input
            style={styles.input}
            type="date"
            onChange={(e) => setFilterTanggal(e.target.value)}
          />

          <button style={styles.button} onClick={getAdminAbsensi}>
            Filter
          </button>

          <div style={{ marginTop: 15 }}>
            {absensiAdmin.map((a, i) => (
              <div key={i}>
                {a.username} - {a.tanggal} - {a.status}
              </div>
            ))}
          </div>

          <hr />

          <h3>Statistik Absensi</h3>

          <p>Hadir ({countStatus("Hadir")})</p>
          <div style={bar(countStatus("Hadir"), "green")} />

          <p>Sakit ({countStatus("Sakit")})</p>
          <div style={bar(countStatus("Sakit"), "orange")} />

          <p>Izin ({countStatus("Izin")})</p>
          <div style={bar(countStatus("Izin"), "blue")} />

          <p>Alpha ({countStatus("Alpha")})</p>
          <div style={bar(countStatus("Alpha"), "red")} />
        </div>
      </div>
    );
  }

  /* ================= SISWA ================= */
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2>Siswa</h2>
        <p>{user.username}</p>

        {/* 🔥 FIX PENTING: controlled input */}
        <input
          style={styles.input}
          placeholder="kode absensi"
          value={inputCode}
          onChange={(e) => setInputCode(e.target.value)}
        />

        <select
          style={styles.input}
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="Hadir">Hadir</option>
          <option value="Sakit">Sakit</option>
          <option value="Izin">Izin</option>
          <option value="Alpha">Alpha</option>
        </select>

        <button style={styles.button} onClick={submitAttendance}>
          Absen
        </button>

        <hr />

        <input
          style={styles.input}
          type="date"
          onChange={(e) => setTanggal(e.target.value)}
        />

        <button style={styles.button} onClick={getRiwayat}>
          Riwayat
        </button>

        <div>
          {riwayat.map((r, i) => (
            <div key={i}>
              {r.tanggal} - {r.status}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
