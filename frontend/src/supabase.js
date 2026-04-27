import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://vamvaksaazbnktijczjn.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZhbXZha3NhYXpibmt0aWpjempuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwOTIzODgsImV4cCI6MjA5MjY2ODM4OH0.62kmhKcDWBLVmkje3_zXp-OGkclafX4TQzolnXqyEyc";
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
