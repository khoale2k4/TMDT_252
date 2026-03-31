export default function Page({ params }: { params: { id: string } }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <h1 className="text-3xl font-bold">Chi tiết Sân (ID: {params.id})</h1>
    </div>
  );
}
