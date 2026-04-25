import React, { useState } from "react";
import Dashboard from "./Dashboard";

export default function App() {
  const [user, setUser] = useState(null);

  const handleLogin = (role) => {
    setUser({ role });
  };

  if (!user) {
    return (
      <div style={{ textAlign: "center", marginTop: "100px" }}>
        <h1>Login</h1>
        <button onClick={() => handleLogin("admin")}>Login sebagai Admin</button>
        <br /><br />
        <button onClick={() => handleLogin("siswa")}>Login sebagai Siswa</button>
      </div>
    );
  }

  return <Dashboard role={user.role} />;
}
