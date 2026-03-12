import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const faqs = [
  {
    question: "How does pitchdeck.biz create my pitch deck?",
    answer:
      "Our AI analyzes your business information — whether you upload documents, paste text, or record audio — and generates a professionally designed pitch deck tailored to your industry. It structures your story with proven frameworks that investors and buyers expect to see.",
  },
  {
    question: "What file formats can I upload?",
    answer:
      "You can upload PDFs, Word documents (.doc, .docx), plain text files, or simply record audio directly in the browser. You can also paste text or type your business description manually. The AI works with whatever you have.",
  },
  {
    question: "How long does it take?",
    answer:
      "Most decks are ready in under 5 minutes. Once you provide your business information, the AI generates your complete pitch deck, sell sheet, one-pager, and branding kit almost instantly. You can start editing right away.",
  },
  {
    question: "Can I edit the deck after it's generated?",
    answer:
      "Yes, you get a fully editable PowerPoint (.pptx) file that you can customize in PowerPoint, Google Slides, or Keynote. Every element — text, images, colors, layout — is fully editable. You also get a polished PDF export for sharing.",
  },
  {
    question: "What if I don't have written materials?",
    answer:
      "No problem! Just use our voice recording feature. Talk about your business for a few minutes — your vision, what you do, your market, your team — and the AI will structure everything into a professional pitch deck. Many of our best decks start as voice memos.",
  },
  {
    question: "Is my business information secure?",
    answer:
      "Absolutely. All data is encrypted in transit and at rest. We never share your business information with third parties, and you can delete your data at any time. Your intellectual property remains yours — we don't use your content to train our models.",
  },
  {
    question: "What's included in the subscription?",
    answer:
      "The monthly subscription includes a token allocation for generating branding assets on demand — social media graphics, product mockups, marketing collateral, and brand identity materials. Tokens refresh monthly, and unused tokens roll over. You also get priority support and access to new asset types as we add them.",
  },
  {
    question: "Can I get a refund?",
    answer:
      "Yes, we offer a 100% satisfaction guarantee within 7 days of purchase. If you're not happy with the results, contact us and we'll issue a full refund — no questions asked.",
  },
]

export function FAQ() {
  return (
    <section id="faq" className="py-20 md:py-32 border-t border-border">
      <div className="max-w-[1280px] mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Left: Header */}
          <div>
            <p className="text-sm text-muted-foreground uppercase tracking-wider mb-4">FAQ</p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight">
              Frequently asked questions
            </h2>
            <p className="mt-6 text-muted-foreground text-lg leading-relaxed max-w-md">
              Everything you need to know about pitchdeck.biz. Can't find the answer you're looking for? Reach out to our team.
            </p>
            <a
              href="mailto:hello@pitchdeck.biz"
              className="inline-flex items-center mt-6 text-sm font-medium transition-colors hover:underline"
              style={{ color: "#203eec" }}
            >
              Contact support
            </a>
          </div>

          {/* Right: Accordion */}
          <div>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border-b border-border">
                  <AccordionTrigger className="text-left text-base font-medium py-5 hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed text-sm pb-5">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>
    </section>
  )
}
