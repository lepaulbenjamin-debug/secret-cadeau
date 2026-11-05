import { JsonLd } from "./json-ld";

export type QR = { q: string; r: string };

/**
 * Questions-réponses visibles ET balisées en FAQPage : le format que les
 * moteurs de recherche et les assistants reprennent le plus volontiers.
 * Les réponses sont du texte simple, complètes sans le reste de la page.
 */
export function Faq({ questions, titre = "Questions fréquentes" }: { questions: QR[]; titre?: string }) {
  return (
    <section>
      <JsonLd
        donnees={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: questions.map(({ q, r }) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: r } })),
        }}
      />
      <h2>{titre}</h2>
      <div className="not-prose divide-y divide-trait rounded-2xl border border-trait bg-carte">
        {questions.map(({ q, r }) => (
          <details key={q} className="group px-5 py-4">
            <summary className="cursor-pointer font-semibold">{q}</summary>
            <p className="mt-2 text-doux">{r}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
