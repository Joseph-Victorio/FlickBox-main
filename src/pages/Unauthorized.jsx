export default function Unauthorized() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-red-500">🚫 Akses Ditolak</h1>
        <p className="mt-2 text-gray-300">Kamu tidak memiliki izin untuk membuka halaman ini.</p>
      </div>
    </div>
  );
}
