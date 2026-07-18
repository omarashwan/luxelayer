import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

const CONTENT: Record<string, { title: string; body: { heading?: string; text: string }[] }> = {
  shipping: {
    title: 'Shipping & Returns',
    body: [
      { heading: 'Shipping', text: 'Complimentary standard shipping is included on all orders over $75 within the continental United States. Express and overnight options are available at checkout. We ship internationally to over 90 countries, with duties and taxes calculated at checkout.' },
      { heading: 'Processing Time', text: 'Orders are processed within 1–2 business days. You will receive a confirmation email with tracking information once your order ships.' },
      { heading: 'Returns', text: 'Unopened products may be returned within 30 days of delivery for a full refund. Used items may be exchanged within 14 days if defective. Final-sale items are non-returnable. To initiate a return, visit your account dashboard or contact client care.' },
      { heading: 'Exchanges', text: 'We offer free exchanges within 30 days. Contact our team and we will arrange a prepaid return label for your exchange.' },
    ],
  },
  privacy: {
    title: 'Privacy Policy',
    body: [
      { text: 'LuxeLayer is committed to protecting your privacy. This policy explains what information we collect, how we use it, and your rights regarding your personal data.' },
      { heading: 'Information We Collect', text: 'We collect information you provide directly — such as your name, email, shipping address, and payment details — when you create an account or place an order. We also collect browsing data via cookies and similar technologies.' },
      { heading: 'How We Use Information', text: 'We use your information to process orders, communicate with you about your purchases, personalize your shopping experience, and improve our services. We never sell your personal data to third parties.' },
      { heading: 'Your Rights', text: 'You have the right to access, correct, or delete your personal data, and to opt out of marketing communications at any time. Contact us at privacy@luxelayer.com to exercise these rights.' },
    ],
  },
  terms: {
    title: 'Terms of Service',
    body: [
      { text: 'By accessing LuxeLayer, you agree to these terms. Please read them carefully.' },
      { heading: 'Use of Service', text: 'You agree to use LuxeLayer only for lawful purposes and in a manner that does not infringe the rights of others. You must be 18 or older to place an order.' },
      { heading: 'Products & Pricing', text: 'We strive for accuracy in product descriptions, images, and pricing. However, colors may vary by screen, and we reserve the right to correct errors. All products are subject to availability.' },
      { heading: 'Orders', text: 'All orders are subject to acceptance and availability. We reserve the right to refuse or cancel any order. Payment is processed at the time of order confirmation.' },
      { heading: 'Intellectual Property', text: 'All content on LuxeLayer — including text, images, logos, and design — is the property of LuxeLayer or its licensors and is protected by intellectual property laws.' },
    ],
  },
};

export function StaticPage({ slug }: { slug: 'shipping' | 'privacy' | 'terms' }) {
  const content = CONTENT[slug];
  if (!content) return null;

  return (
    <div className="bg-ivory">
      <div className="border-b border-ink-100 bg-warmwhite">
        <div className="container-luxe py-10">
          <nav className="flex items-center gap-1.5 text-xs text-ink-500">
            <Link to="/" className="flex items-center gap-1 hover:text-ink-800"><Home className="h-3 w-3" />Home</Link>
            <span>/</span>
            <span className="text-ink-800">{content.title}</span>
          </nav>
          <h1 className="mt-4 font-display text-display-lg font-medium text-ink-900">{content.title}</h1>
        </div>
      </div>
      <div className="container-luxe py-12">
        <div className="mx-auto max-w-3xl space-y-8">
          {content.body.map((section, i) => (
            <div key={i}>
              {section.heading && <h2 className="mb-2 font-display text-xl font-medium text-ink-900">{section.heading}</h2>}
              <p className="text-base leading-relaxed text-ink-700">{section.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
