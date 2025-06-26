const supabaseUrl = 'https://wtaxqcfooxngulryxkxt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0YXhxY2Zvb3huZ3Vscnl4a3h0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5NTI3MjYsImV4cCI6MjA2NjUyODcyNn0.NBYzZZ1hKtVfkXXkwAdlpsztlUa5Cg48ErOChroYdD0';

// Inicializa o cliente Supabase
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
