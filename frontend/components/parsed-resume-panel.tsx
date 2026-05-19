"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ParsedResume } from "@/lib/api";

export function ParsedResumePanel({ resume }: { resume: ParsedResume }) {
  const name = resume.full_name ?? resume.name ?? "Unknown candidate";

  return (
    <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
      <Card>
        <CardHeader>
          <CardTitle>{name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <Field label="Email" value={resume.email} />
          <Field label="Phone" value={resume.phone} />
          <Field label="Location" value={resume.location} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Skills</CardTitle>
        </CardHeader>
        <CardContent>
          {resume.skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {resume.skills.map((skill) => (
                <span key={skill} className="rounded-md border px-2.5 py-1 text-xs font-medium">
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No skills extracted.</p>
          )}
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Structured JSON</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="max-h-[32rem] overflow-auto rounded-md bg-muted p-4 text-xs leading-6 sm:text-sm">
            {JSON.stringify(resume, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <dt className="font-medium">{label}</dt>
      <dd className="mt-1 text-muted-foreground">{value || "Not extracted"}</dd>
    </div>
  );
}
