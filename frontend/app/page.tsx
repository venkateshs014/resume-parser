import { UploadForm } from "@/components/upload-form";

export default function UploadPage() {
  return (
    <main className="min-h-screen bg-background">
      <section className="mx-auto flex min-h-screen w-full max-w-5xl flex-col justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div className="space-y-4">
            <p className="text-sm font-medium text-primary">Resume intake</p>
            <h1 className="text-3xl font-semibold tracking-normal sm:text-4xl">AI Resume Parser</h1>
            <p className="max-w-xl text-base leading-7 text-muted-foreground">
              Upload a PDF resume and review the structured candidate profile once backend processing finishes.
            </p>
          </div>
          <UploadForm />
        </div>
      </section>
    </main>
  );
}
