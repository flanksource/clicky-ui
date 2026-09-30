import { BestPractice, ReviewVariant } from "../review/ReviewComponents";

export const meta = {
  title: "Review components",
  description:
    "Routable best practices and variants with persistent review decisions.",
  group: "Playground",
};

const VARIANTS = [
  {
    id: "variant-summary-row",
    reviewId: "review-variant-summary-row",
    title: "Summary row",
    verdict:
      "Keeps the decision and its strongest evidence in one scanning line.",
    content: "Decision · Approve · 3 supporting checks · reviewed 4m ago",
  },
  {
    id: "variant-detail-card",
    reviewId: "review-variant-detail-card",
    title: "Detail card",
    verdict:
      "Makes rationale visible but spends more vertical space per option.",
    content:
      "Approve\nRationale: the control passed and the exception has an owner.",
  },
] as const;

export default function ReviewComponentsPage() {
  return (
    <main className="mx-auto max-w-5xl space-y-density-6">
      <header className="space-y-density-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">
          Structured review
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">
          Best practices and variants
        </h1>
        <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
          Best practices keep their anchored ratings. Variants have stable
          review IDs and decisions that persist as comments. Delete removes a
          variant from the page source and its associated feedback.
        </p>
      </header>

      <section className="space-y-density-3" aria-labelledby="practice-heading">
        <h2 id="practice-heading" className="text-lg font-semibold">
          Best practices
        </h2>
        <div className="grid gap-density-3 md:grid-cols-2">
          <BestPractice
            id="practice-preview-first"
            title="Preview before save"
            description="Keep the generated result visible beside configuration so invalid assumptions are caught before persistence."
            tone="do"
          />
          <BestPractice
            id="practice-no-hidden-defaults"
            title="Do not hide required decisions"
            description="A required owner, scope, or destructive outcome stays explicit instead of falling through to a silent default."
            tone="avoid"
          />
        </div>
      </section>

      <section className="space-y-density-3" aria-labelledby="variant-heading">
        <div className="flex flex-wrap items-center justify-between gap-density-2">
          <h2 id="variant-heading" className="text-lg font-semibold">
            Variants
          </h2>
        </div>
        <div className="space-y-density-5">
          {VARIANTS.map((variant, index) => (
            <ReviewVariant
              key={variant.id}
              id={variant.id}
              data-review-id={variant.reviewId}
              title={variant.title}
              verdict={variant.verdict}
              selected={index === 0}
            >
              <div className="whitespace-pre-line rounded-md bg-muted/50 p-density-3 text-sm text-foreground">
                {variant.content}
              </div>
            </ReviewVariant>
          ))}
        </div>
      </section>
    </main>
  );
}
