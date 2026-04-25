const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const { createClient } = require("@supabase/supabase-js");

const app = express();
app.use(cors());
app.use(express.json());

const supabase = createClient(
  "https://vamvaksaazbnktijczjn.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZhbXZha3NhYXpibmt0aWpjempuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwOTIzODgsImV4cCI6MjA5MjY2ODM4OH0.62kmhKcDWBLVmkje3_zXp-OGkclafX4TQzolnXqyEyc"
);

/* ================= REGISTER ================= */
app.post("/register", async (req, res) => {
  const { username, password, role } = req.body;

  const hashed = await bcrypt.hash(password, 10);

  const { data, error } = await supabase
    .from("users")
    .insert([
      {
        username,
        password: hashed,
        role,
      },
    ])
    .select()
    .single();

  if (error) {
    return res.status(500).json({
      message: "Register gagal",
      error: error.message,
    });
  }

  res.json({
    message: "Register berhasil",
    user: data,
  });
});

/* ================= LOGIN (FIX 401 CLEAN) ================= */
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("username", username)
    .maybeSingle();

  if (error || !data) {
    return res.status(401).json({
      message: "User tidak ditemukan",
    });
  }

  const match = await bcrypt.compare(password, data.password);

  if (!match) {
    return res.status(401).json({
      message: "Password salah",
    });
  }

  res.json({ user: data });
});

/* ================= GENERATE CODE ================= */
app.post("/generate-code", async (req, res) => {
  const code = Math.random().toString(36).substring(2, 8).toUpperCase();

  await supabase.from("attendance_codes").delete().neq("id", 0);

  const { data, error } = await supabase
    .from("attendance_codes")
    .insert([{ code }])
    .select()
    .single();

  if (error) {
    return res.status(500).json({
      message: "Gagal generate code",
    });
  }

  res.json({ code: data.code });
});

/* ================= ABSENSI ================= */
app.post("/check-code", async (req, res) => {
  const { username, code, status } = req.body;

  const { data: validCode } = await supabase
    .from("attendance_codes")
    .select("*")
    .eq("code", code)
    .maybeSingle();

  if (!validCode) {
    return res.status(400).json({ message: "Kode salah" });
  }

  const { data: already } = await supabase
    .from("absensi")
    .select("*")
    .eq("username", username)
    .eq("code", code)
    .maybeSingle();

  if (already) {
    return res.status(400).json({ message: "Sudah absen" });
  }

  const { error } = await supabase.from("absensi").insert([
    {
      username,
      code,
      status: status || "Hadir",
      tanggal: new Date().toISOString().split("T")[0],
    },
  ]);

  if (error) {
    return res.status(500).json({
      message: "Gagal simpan absensi",
    });
  }

  res.json({ message: "Absensi berhasil" });
});

/* ================= RIWAYAT ================= */
app.get("/riwayat", async (req, res) => {
  const { username, tanggal } = req.query;

  let query = supabase.from("absensi").select("*");

  if (username) query = query.eq("username", username);
  if (tanggal) query = query.eq("tanggal", tanggal);

  const { data, error } = await query;

  if (error) {
    return res.status(500).json({ message: "Gagal ambil data" });
  }

  res.json(data || []);
});

/* ================= ADMIN ================= */
app.get("/admin-absensi", async (req, res) => {
  const { search, tanggal } = req.query;

  let query = supabase.from("absensi").select("*");

  if (tanggal) query = query.eq("tanggal", tanggal);

  const { data } = await query;

  let result = data || [];

  if (search) {
    result = result.filter((x) =>
      x.username.toLowerCase().includes(search.toLowerCase())
    );
  }

  res.json(result);
});

/* ================= SERVER ================= */
app.listen(5000, () => {
  console.log("Server jalan di http://localhost:5000");
});
