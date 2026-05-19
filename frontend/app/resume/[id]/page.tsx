import { ResultView } from "@/components/result-view";

export default async function ResumeResultPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <main className="min-h-screen bg-background">
      <section className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <ResultView resumeId={id} />
      </section>
    </main>
  );
}
