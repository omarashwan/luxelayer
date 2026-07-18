import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Home, Mail, Phone, MapPin, Send } from 'lucide-react';
import { submitContact } from '../lib/api';
import { useToast } from '../context/ToastContext';
import { Reveal } from '../components/ui/Reveal';

export function ContactPage() {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await submitContact(form.name, form.email, form.subject, form.message);
    if (error) {
      toast(error, 'error');
    } else {
      toast('Message sent — we will be in touch within 24 hours');
      setForm({ name: '', email: '', subject: '', message: '' });
    }
    setSubmitting(false);
  };

  return (
    <div className="bg-ivory">
      <div className="border-b border-ink-100 bg-warmwhite">
        <div className="container-luxe py-10">
          <nav className="flex items-center gap-1.5 text-xs text-ink-500">
            <Link to="/" className="flex items-center gap-1 hover:text-ink-800"><Home className="h-3 w-3" />Home</Link>
            <span>/</span>
            <span className="text-ink-800">Contact</span>
          </nav>
          <Reveal>
            <h1 className="mt-4 font-display text-display-lg font-medium text-ink-900">Client Care</h1>
          </Reveal>
          <Reveal delay={80}>
            <p className="mt-3 max-w-2xl text-sm text-ink-600">
              Our beauty advisors are here to help — from shade matching to order tracking.
            </p>
          </Reveal>
        </div>
      </div>

      <div className="container-luxe py-12">
        <div className="grid gap-10 lg:grid-cols-3">
          <div className="space-y-6">
            {[
              { icon: Mail, title: 'Email Us', detail: 'clientcare@luxelayer.com', sub: 'We reply within 24 hours' },
              { icon: Phone, title: 'Call Us', detail: '+1 (800) 583-9529', sub: 'Mon–Fri, 9am–6pm EST' },
              { icon: MapPin, title: 'Visit', detail: '12 Rue Saint-Honoré, Paris', sub: 'By appointment only' },
            ].map((c) => (
              <div key={c.title} className="card-luxe p-6">
                <c.icon className="h-6 w-6 text-champagne-600" />
                <h3 className="mt-3 font-display text-lg font-medium text-ink-900">{c.title}</h3>
                <p className="mt-1 text-sm text-ink-800">{c.detail}</p>
                <p className="text-xs text-ink-500">{c.sub}</p>
              </div>
            ))}
          </div>

          <form onSubmit={onSubmit} className="lg:col-span-2 card-luxe space-y-4 p-8">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label-luxe">Full Name</label>
                <input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="input-luxe" />
              </div>
              <div>
                <label className="label-luxe">Email</label>
                <input required type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} className="input-luxe" />
              </div>
            </div>
            <div>
              <label className="label-luxe">Subject</label>
              <input value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))} className="input-luxe" />
            </div>
            <div>
              <label className="label-luxe">Message</label>
              <textarea required rows={6} value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} className="input-luxe resize-none" />
            </div>
            <button type="submit" disabled={submitting} className="btn-primary w-full">
              <Send className="h-4 w-4" />
              {submitting ? 'Sending…' : 'Send Message'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
