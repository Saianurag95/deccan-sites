const brand = {
  name: "Deccan Sites",
  short: "DS",
  city: "Hyderabad HQ",
};

const packages = [
  {
    name: "Launch Page",
    price: "₹999",
    old: "₹9,999",
    tag: "Starter",
    desc: "A sharp one-page website for businesses that need a fast online presence.",
    items: ["1 responsive page", "WhatsApp CTA", "Basic SEO tags", "Delivery-ready layout"],
  },
  {
    name: "Business Site",
    price: "₹2,999",
    old: "₹24,999",
    tag: "Most chosen",
    desc: "A professional multi-section website for service businesses, shops, clinics, and creators.",
    items: ["Up to 5 pages", "Contact sections", "Gallery or services", "Domain support"],
  },
  {
    name: "Growth Build",
    price: "₹6,999",
    old: "₹59,999",
    tag: "Advanced",
    desc: "A stronger website with lead capture, content structure, and business-ready presentation.",
    items: ["Up to 8 pages", "Lead form setup", "Admin-ready structure", "Hosting guidance"],
  },
];

const estimateTypes = [
  { label: "Landing page", price: 999 },
  { label: "Business website", price: 2499 },
  { label: "E-commerce catalog", price: 4999 },
  { label: "Custom web app", price: 7999 },
];

const estimateAddOns = [
  { label: "Extra page", price: 350 },
  { label: "Logo refresh", price: 599 },
  { label: "Content writing", price: 799 },
  { label: "Booking / enquiry flow", price: 1299 },
  { label: "Payment-ready setup", price: 1999 },
  { label: "Admin dashboard", price: 3999 },
];

const domainOptions = [
  { label: "Already have domain", price: 0 },
  { label: "Domain setup support", price: 599 },
  { label: "Hosting launch support", price: 999 },
  { label: "Domain + hosting support", price: 1499 },
];

const sectionOptions = ["Home", "About", "Services", "Pricing", "Gallery / portfolio", "Testimonials", "Contact", "FAQ", "Blog"];

const contentOptions = ["I have all content ready", "I have some content ready", "I need help with content", "I need complete content writing"];

const logoOptions = ["Logo and colors are ready", "Logo is ready, colors need help", "Need logo refresh", "Need complete brand direction"];

const services = [
  ["Business Websites", "Premium websites for shops, services, cafes, clinics, coaching centers, and startups."],
  ["Landing Pages", "High-conversion pages for offers, campaigns, personal brands, and product launches."],
  ["Web Applications", "Dashboards, booking flows, lead systems, and custom business tools."],
  ["Domain & Hosting", "Guidance for domain connection, hosting setup, SSL, and basic launch support."],
  ["Brand Presence", "Layout, content structure, CTAs, colors, and polished user experience."],
  ["Maintenance", "Small edits, page additions, launch fixes, and website care plans."],
];

const highlights = [
  "Fast delivery for first 5 orders",
  "Responsive on mobile, tablet, and desktop",
  "Modern visual design, not template-looking",
  "Clear call-to-actions for leads",
  "Built for real business use",
  "Hyderabad-based team, wider client service",
];

const demoSites = [
  {
    type: "Restaurant",
    title: "Nizam Table",
    subtitle: "Modern cafe and biryani house landing page",
    accent: "#d24b3c",
    glow: "#f2b45d",
    cta: "Reserve table",
    details: ["Signature menu", "Chef specials", "WhatsApp orders"],
    href: "restaurant-demo.html",
  },
  {
    type: "Education",
    title: "Apex Rank Studio",
    subtitle: "Premium coaching institute website",
    accent: "#355dff",
    glow: "#6fd2ff",
    cta: "Book counselling",
    details: ["Course batches", "Results wall", "Faculty proof"],
    href: "education-demo.html",
  },
  {
    type: "Healthcare",
    title: "Serene Care Clinic",
    subtitle: "Trust-first clinic appointment website",
    accent: "#1b9a78",
    glow: "#9ce8d4",
    cta: "Schedule visit",
    details: ["Doctor profile", "Slots", "Patient trust"],
    href: "healthcare-demo.html",
  },
];

function Header() {
  return (
    <header className="fixed inset-x-3 top-3 z-50 mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#11100d]/78 px-3 py-3 shadow-[0_24px_70px_rgba(0,0,0,.26)] backdrop-blur-2xl md:inset-x-5 md:top-5 md:flex-nowrap">
      <a className="flex items-center gap-3" href="#top" aria-label={`${brand.name} home`}>
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#d7b56d] text-sm font-black text-[#17120b] shadow-[0_0_34px_rgba(215,181,109,.34)]">
          {brand.short}
        </span>
        <span className="text-lg font-extrabold tracking-[-.02em] text-[#fff8e7]">{brand.name}</span>
      </a>
      <nav className="mobile-scroll order-3 flex w-full gap-1 text-sm font-bold text-stone-300 md:order-none md:w-auto">
        {[
          ["Services", "#services"],
          ["Pricing", "#pricing"],
          ["Estimate", "#estimate"],
          ["Portal", "#portal"],
          ["Work", "#work"],
          ["Contact", "#contact"],
        ].map(([label, href]) => (
          <a key={href} className="rounded-xl px-3 py-2 hover:bg-white/10" href={href}>
            {label}
          </a>
        ))}
      </nav>
      <a className="shine-btn rounded-xl bg-[#d7b56d] px-4 py-3 text-sm font-extrabold text-[#17120b]" href="#portal">
        Get a quote
      </a>
    </header>
  );
}

function Hero() {
  return (
    <section id="top" className="relative isolate overflow-hidden px-4 pb-20 pt-56 sm:px-6 sm:pt-44 lg:min-h-[94svh] lg:px-8 lg:pt-40">
      <div className="absolute inset-0 -z-30 hero-bg" />
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_18%_16%,rgba(215,181,109,.24),transparent_30%),radial-gradient(circle_at_84%_14%,rgba(83,150,139,.20),transparent_28%),linear-gradient(180deg,rgba(10,12,12,.82),#0a0b0b_86%)]" />
      <div className="lux-grid" />

      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[minmax(0,1fr)_440px] lg:items-center">
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#d7b56d]/30 bg-[#d7b56d]/10 px-3 py-2 text-[.72rem] font-extrabold uppercase tracking-[.16em] text-[#f3d891]">
            <span className="h-2 w-2 rounded-full bg-[#d7b56d] shadow-[0_0_0_6px_rgba(215,181,109,.16)]" />
            {brand.city} · fast delivery for first 5 orders
          </div>
          <h1 className="mt-7 max-w-4xl font-display text-[clamp(3.45rem,7.5vw,7rem)] leading-[.86] tracking-[-.045em] text-[#fff7e7]">
            Websites that make businesses look expensive.
          </h1>
          <p className="mt-6 max-w-3xl text-[clamp(1.05rem,1.55vw,1.36rem)] font-medium leading-8 text-stone-200">
            Deccan Sites designs clean, responsive websites and web experiences for businesses that want a polished online presence without agency-level pricing.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a className="shine-btn rounded-2xl bg-[#d7b56d] px-5 py-4 text-sm font-black text-[#17120b]" href="#portal">
              Start project portal
            </a>
            <a className="rounded-2xl border border-white/14 bg-white/[.06] px-5 py-4 text-sm font-black text-white backdrop-blur hover:bg-white/[.1]" href="#pricing">
              View pricing
            </a>
          </div>
          <p className="mt-5 max-w-xl rounded-2xl border border-[#d7b56d]/25 bg-[#d7b56d]/10 px-4 py-3 text-sm font-extrabold text-[#f3d891]">
            Launch offer: first 5 confirmed projects get priority fast delivery.
          </p>
          <div className="mt-7 flex max-w-3xl flex-wrap gap-2">
            {highlights.map((item) => (
              <span key={item} className="chip">
                {item}
              </span>
            ))}
          </div>
        </div>

        <aside className="glass rounded-3xl p-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <span className="text-sm font-extrabold text-[#f3d891]">Featured package</span>
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-extrabold text-white">Pilot pricing</span>
          </div>
          <div className="rounded-3xl bg-[linear-gradient(135deg,#1f302e,#6f5630)] p-6">
            <p className="text-xs font-extrabold uppercase tracking-[.14em] text-[#ffe9ad]">Business site</p>
            <h2 className="mt-5 text-4xl font-black leading-none tracking-[-.04em]">₹2,999</h2>
            <p className="mt-4 leading-7 text-stone-100">A professional website for service businesses, shops, cafes, clinics, creators, and local brands.</p>
            <div className="mt-6 grid grid-cols-3 gap-2 text-center text-xs font-extrabold">
              <span className="rounded-xl bg-white/12 px-2 py-2">5 pages</span>
              <span className="rounded-xl bg-white/12 px-2 py-2">Mobile-first</span>
              <span className="rounded-xl bg-white/12 px-2 py-2">SEO-ready</span>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <MiniMetric label="Market value" value="₹24,999" />
            <MiniMetric label="You pay" value="₹2,999" />
          </div>
        </aside>
      </div>
    </section>
  );
}

function MiniMetric({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[.055] p-4">
      <span className="text-xs font-extrabold uppercase text-stone-400">{label}</span>
      <strong className="mt-2 block text-xl leading-5 text-[#fff7e7]">{value}</strong>
    </div>
  );
}

function SectionHead({ eyebrow, title, children }) {
  return (
    <div className="mb-10 max-w-4xl">
      <p className="text-xs font-black uppercase tracking-[.16em] text-[#f3d891]">{eyebrow}</p>
      <h2 className="mt-3 text-[clamp(2.35rem,5vw,4.45rem)] font-black leading-[.98] tracking-[-.045em] text-[#fff7e7]">{title}</h2>
      {children}
    </div>
  );
}

function Services() {
  return (
    <section id="services" className="px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
      <div className="mx-auto max-w-7xl">
        <SectionHead eyebrow="What we create" title="Websites designed to sell trust before anything else." />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {services.map(([title, desc]) => (
            <article key={title} className="panel rounded-3xl p-6">
              <span className="inline-block h-2 w-12 rounded-full bg-[#d7b56d]" />
              <h3 className="mt-7 text-2xl font-black tracking-[-.03em] text-[#fff7e7]">{title}</h3>
              <p className="mt-3 leading-7 text-stone-300">{desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  return (
    <section id="pricing" className="bg-[#11100d] px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
      <div className="mx-auto max-w-7xl">
        <SectionHead eyebrow="Simple pricing" title="Launch pricing that is intentionally affordable." />
        <p className="-mt-5 mb-8 max-w-3xl text-lg leading-8 text-stone-300">
          First 5 confirmed orders receive priority fast delivery. Exact delivery time depends on pages, content readiness, and selected features.
        </p>
        <div className="grid gap-4 lg:grid-cols-3">
          {packages.map((pack, index) => (
            <article key={pack.name} className={`panel rounded-3xl p-6 ${index === 1 ? "border-[#d7b56d]/50 bg-[#1b1812]" : ""}`}>
              <div className="flex items-center justify-between gap-3">
                <span className="chip">{pack.tag}</span>
                <span className="rounded-full bg-white/[.06] px-3 py-1 text-sm font-black text-stone-300 line-through">{pack.old}</span>
              </div>
              <strong className="mt-7 block text-5xl font-black tracking-[-.05em] text-[#f3d891]">{pack.price}</strong>
              <h3 className="mt-4 text-2xl font-black tracking-[-.03em] text-[#fff7e7]">{pack.name}</h3>
              <p className="mt-3 min-h-20 leading-7 text-stone-300">{pack.desc}</p>
              <ul className="mt-6 grid gap-3 text-sm font-bold text-stone-200">
                {pack.items.map((item) => (
                  <li key={item} className="rounded-2xl bg-white/[.055] p-3">
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function formatPrice(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function Estimate() {
  const [typeIndex, setTypeIndex] = React.useState(1);
  const [pages, setPages] = React.useState(5);
  const [domainIndex, setDomainIndex] = React.useState(0);
  const [selectedAddOns, setSelectedAddOns] = React.useState(["Content writing"]);

  const estimate = React.useMemo(() => {
    const base = estimateTypes[typeIndex].price;
    const extraPages = Math.max(0, Number(pages) - 1) * 350;
    const domain = domainOptions[domainIndex].price;
    const addOns = estimateAddOns
      .filter((item) => selectedAddOns.includes(item.label))
      .reduce((total, item) => total + item.price, 0);

    return base + extraPages + domain + addOns;
  }, [typeIndex, pages, domainIndex, selectedAddOns]);

  function toggleAddOn(label) {
    setSelectedAddOns((current) =>
      current.includes(label) ? current.filter((item) => item !== label) : [...current, label]
    );
  }

  return (
    <section id="estimate" className="px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[.9fr_1.1fr] lg:items-start">
        <div>
          <SectionHead eyebrow="Pricing estimate" title="Get a quick idea before sending the brief.">
            <p className="mt-5 max-w-2xl text-lg leading-8 text-stone-300">
              Choose the website type, pages, domain help, and optional features. This gives a starting estimate; the final quote can be confirmed after the requirement form.
            </p>
          </SectionHead>
          <div className="glass rounded-3xl p-6">
            <span className="text-xs font-black uppercase tracking-[.14em] text-[#f3d891]">Estimated starting price</span>
            <strong className="mt-4 block text-[clamp(3rem,7vw,5.6rem)] font-black leading-none tracking-[-.06em] text-[#fff7e7]">
              {formatPrice(estimate)}
            </strong>
            <p className="mt-4 leading-7 text-stone-300">
              Transparent pilot pricing for small businesses, creators, local brands, and service teams that need a polished website without heavy agency cost.
            </p>
            <a className="shine-btn mt-6 inline-flex rounded-2xl bg-[#d7b56d] px-5 py-4 text-sm font-black text-[#17120b]" href="#portal">
              Start project portal
            </a>
          </div>
        </div>

        <div className="panel rounded-3xl p-5 sm:p-6">
          <div className="grid gap-5">
            <label className="grid gap-2">
              <span className="text-sm font-black uppercase tracking-[.12em] text-stone-300">Website type</span>
              <select
                className="rounded-2xl border border-white/10 bg-[#0c0d0d] px-4 py-4 font-bold text-[#fff7e7] outline-none focus:border-[#d7b56d]"
                value={typeIndex}
                onChange={(event) => setTypeIndex(Number(event.target.value))}
              >
                {estimateTypes.map((item, index) => (
                  <option key={item.label} value={index}>
                    {item.label} - {formatPrice(item.price)}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-black uppercase tracking-[.12em] text-stone-300">Pages needed</span>
              <input
                className="rounded-2xl border border-white/10 bg-[#0c0d0d] px-4 py-4 font-bold text-[#fff7e7] outline-none focus:border-[#d7b56d]"
                min="1"
                max="20"
                type="number"
                value={pages}
                onChange={(event) => setPages(event.target.value)}
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-black uppercase tracking-[.12em] text-stone-300">Domain and launch help</span>
              <select
                className="rounded-2xl border border-white/10 bg-[#0c0d0d] px-4 py-4 font-bold text-[#fff7e7] outline-none focus:border-[#d7b56d]"
                value={domainIndex}
                onChange={(event) => setDomainIndex(Number(event.target.value))}
              >
                {domainOptions.map((item, index) => (
                  <option key={item.label} value={index}>
                    {item.label} {item.price ? `- ${formatPrice(item.price)}` : ""}
                  </option>
                ))}
              </select>
            </label>

            <div>
              <span className="text-sm font-black uppercase tracking-[.12em] text-stone-300">Optional features</span>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {estimateAddOns.map((item) => (
                  <label
                    key={item.label}
                    className={`flex cursor-pointer items-center justify-between gap-3 rounded-2xl border p-4 transition ${
                      selectedAddOns.includes(item.label)
                        ? "border-[#d7b56d]/70 bg-[#d7b56d]/12"
                        : "border-white/10 bg-white/[.045]"
                    }`}
                  >
                    <span>
                      <span className="block text-sm font-black text-[#fff7e7]">{item.label}</span>
                      <span className="mt-1 block text-xs font-bold text-stone-400">{formatPrice(item.price)}</span>
                    </span>
                    <input
                      className="h-5 w-5 accent-[#d7b56d]"
                      checked={selectedAddOns.includes(item.label)}
                      onChange={() => toggleAddOn(item.label)}
                      type="checkbox"
                    />
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProjectPortal() {
  const [config, setConfig] = React.useState({ enabled: false, keyId: "" });
  const [form, setForm] = React.useState({
    name: "",
    email: "",
    phone: "",
    businessName: "",
    businessLocation: "",
    businessCategory: "",
    websiteType: "Business website",
    pages: 5,
    domainOption: "Already have domain",
    addOns: ["Content writing"],
    sections: ["Home", "Services", "Contact"],
    idea: "",
    references: "",
    contentReadiness: "I have some content ready",
    logoReadiness: "Logo is ready, colors need help",
    launchDate: "",
    notes: "",
  });
  const [project, setProject] = React.useState(null);
  const [status, setStatus] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    fetch("/api/payments/config")
      .then((response) => response.json())
      .then((data) => setConfig(data))
      .catch(() => setStatus("Payment gateway will activate after backend setup is live."));
  }, []);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function toggleList(field, value) {
    setForm((current) => {
      const list = current[field] || [];
      return {
        ...current,
        [field]: list.includes(value) ? list.filter((item) => item !== value) : [...list, value],
      };
    });
  }

  const estimate = React.useMemo(() => {
    const type = estimateTypes.find((item) => item.label === form.websiteType)?.price || 0;
    const pages = Math.max(1, Number(form.pages || 1));
    const pagePrice = Math.max(0, pages - 1) * 350;
    const domain = domainOptions.find((item) => item.label === form.domainOption)?.price || 0;
    const addOns = estimateAddOns
      .filter((item) => form.addOns.includes(item.label))
      .reduce((total, item) => total + item.price, 0);
    return type + pagePrice + domain + addOns;
  }, [form.websiteType, form.pages, form.domainOption, form.addOns]);

  function loadRazorpayCheckout() {
    if (window.Razorpay) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
      const script = existingScript || document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => (window.Razorpay ? resolve() : reject(new Error("Razorpay checkout did not initialize.")));
      script.onerror = () => reject(new Error("Razorpay checkout could not load. Check internet access, browser blocking, or ad blocker settings."));

      if (!existingScript) {
        document.body.appendChild(script);
      }

      setTimeout(() => {
        if (!window.Razorpay) {
          reject(new Error("Razorpay checkout could not load. Check internet access, browser blocking, or ad blocker settings."));
        }
      }, 12000);
    });
  }

  async function submitProject(event) {
    event.preventDefault();
    setSaving(true);
    setStatus("");

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!data.ok) {
        throw new Error(data.error || "Could not save project details.");
      }
      setProject(data.project);
      setStatus(`Project saved. Opening payment for ${formatPrice(data.estimatedAmount)}.`);
      await startPaymentForProject(data.project);
    } catch (error) {
      setStatus(error.message || "Could not save project details.");
    } finally {
      setSaving(false);
    }
  }

  async function startPaymentForProject(activeProject) {
    setLoading(true);

    try {
      if (!config.enabled) {
        throw new Error("Payment gateway is ready in code. Add Razorpay keys to activate live payments.");
      }

      await loadRazorpayCheckout();

      const orderResponse = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number(activeProject?.estimatedAmount || estimate),
          projectId: activeProject?.projectId,
          name: form.name,
          email: form.email,
          phone: form.phone,
        }),
      });
      const order = await orderResponse.json();

      if (!order.ok) {
        throw new Error(order.error || "Could not start payment.");
      }

      const checkout = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: order.name,
        description: order.description,
        order_id: order.orderId,
        prefill: order.prefill,
        theme: { color: "#d7b56d" },
        handler: async (paymentResult) => {
          const verifyResponse = await fetch("/api/payments/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(paymentResult),
          });
          const verified = await verifyResponse.json();
          if (!verified.ok) {
            setStatus(verified.error || "Payment received but verification failed. Contact Deccan Sites.");
            return;
          }
          setStatus("Payment verified. Your project booking is recorded.");
        },
        modal: {
          ondismiss: () => setStatus("Payment window closed before completion."),
        },
      });

      checkout.open();
    } catch (error) {
      setStatus(error.message || "Payment could not be started.");
    } finally {
      setLoading(false);
    }
  }

  async function startPayment(event) {
    event?.preventDefault();
    if (!project) {
      document.getElementById("project-portal-form")?.requestSubmit();
      return;
    }
    await startPaymentForProject(project);
  }

  return (
    <section id="portal" className="portal-light px-4 py-20 text-[#17130d] sm:px-6 lg:px-8 lg:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 max-w-4xl">
          <p className="text-xs font-black uppercase tracking-[.16em] text-[#8f6b1f]">Project portal</p>
          <h2 className="mt-3 text-[clamp(2.35rem,5vw,4.45rem)] font-black leading-[.98] tracking-[-.045em]">
            Fill the brief, see the estimate, and pay from one place.
          </h2>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-stone-700">
            Everything is handled inside this portal. Your details are saved directly in the Deccan Sites backend, the estimate is calculated instantly, and payment opens for the same project record.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.15fr_.85fr] lg:items-start">
          <form id="project-portal-form" className="rounded-[1.75rem] border border-stone-200 bg-white p-5 shadow-[0_24px_90px_rgba(43,35,20,.12)] sm:p-7" onSubmit={submitProject}>
            <div className="grid gap-5">
              <div className="grid gap-4 sm:grid-cols-3">
                <LightInput label="Full name" value={form.name} onChange={(value) => updateField("name", value)} required />
                <LightInput label="Email" type="email" value={form.email} onChange={(value) => updateField("email", value)} required />
                <LightInput label="WhatsApp number" value={form.phone} onChange={(value) => updateField("phone", value)} required />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <LightInput label="Business name" value={form.businessName} onChange={(value) => updateField("businessName", value)} required />
                <LightInput label="Location" value={form.businessLocation} onChange={(value) => updateField("businessLocation", value)} />
                <LightInput label="Business category" value={form.businessCategory} onChange={(value) => updateField("businessCategory", value)} required />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <LightSelect label="Website type" value={form.websiteType} onChange={(value) => updateField("websiteType", value)} options={estimateTypes.map((item) => item.label)} />
                <LightInput label="Pages needed" min="1" max="20" type="number" value={form.pages} onChange={(value) => updateField("pages", value)} />
                <LightSelect label="Domain and launch help" value={form.domainOption} onChange={(value) => updateField("domainOption", value)} options={domainOptions.map((item) => item.label)} />
              </div>

              <LightCheckGroup label="Optional features" values={form.addOns} options={estimateAddOns.map((item) => item.label)} onToggle={(value) => toggleList("addOns", value)} />
              <LightCheckGroup label="Website sections" values={form.sections} options={sectionOptions} onToggle={(value) => toggleList("sections", value)} />

              <div className="grid gap-4 sm:grid-cols-2">
                <LightSelect label="Content readiness" value={form.contentReadiness} onChange={(value) => updateField("contentReadiness", value)} options={contentOptions} />
                <LightSelect label="Logo / brand readiness" value={form.logoReadiness} onChange={(value) => updateField("logoReadiness", value)} options={logoOptions} />
              </div>

              <LightTextarea label="Describe the website idea" value={form.idea} onChange={(value) => updateField("idea", value)} required />
              <LightTextarea label="Reference websites" value={form.references} onChange={(value) => updateField("references", value)} />
              <div className="grid gap-4 sm:grid-cols-2">
                <LightInput label="Preferred launch date" value={form.launchDate} onChange={(value) => updateField("launchDate", value)} />
                <LightInput label="Extra notes" value={form.notes} onChange={(value) => updateField("notes", value)} />
              </div>

              <button className="rounded-2xl bg-[#17130d] px-5 py-4 text-sm font-black text-white transition hover:bg-[#2b2418]" disabled={saving || loading} type="submit">
                {saving || loading ? "Preparing payment..." : `Continue to payment - ${formatPrice(estimate)}`}
              </button>
            </div>
          </form>

          <aside className="sticky top-28 rounded-[1.75rem] border border-[#d7b56d]/30 bg-[#fff8e8] p-6 shadow-[0_24px_90px_rgba(43,35,20,.12)]">
            <span className="text-xs font-black uppercase tracking-[.14em] text-[#8f6b1f]">Live estimate</span>
            <strong className="mt-4 block text-[clamp(3rem,7vw,5.25rem)] font-black leading-none tracking-[-.06em]">
              {formatPrice(project?.estimatedAmount || estimate)}
            </strong>
            <p className="mt-4 leading-7 text-stone-700">
              The estimate updates as the client fills the portal. Once details are saved, payment opens for this exact estimated amount.
            </p>

            <div className="mt-6 rounded-2xl border border-stone-200 bg-white p-4">
              <span className="text-xs font-black uppercase tracking-[.12em] text-stone-500">Payment amount</span>
              <strong className="mt-2 block text-2xl tracking-[-.03em]">{formatPrice(project?.estimatedAmount || estimate)}</strong>
            </div>

            <form className="mt-4 grid gap-3" onSubmit={startPayment}>
              <button
                className="shine-btn rounded-2xl bg-[#d7b56d] px-5 py-4 text-sm font-black text-[#17120b] disabled:cursor-not-allowed disabled:opacity-60"
                disabled={loading || saving}
                type="submit"
              >
                {loading || saving ? "Preparing payment..." : "Pay estimated amount"}
              </button>
              <p className="text-xs font-bold leading-5 text-stone-600">
                After the portal details are saved, this amount is sent to the payment gateway. Payment activates after Razorpay keys are added.
              </p>
            </form>

            {status && (
              <p className="mt-4 rounded-2xl border border-stone-200 bg-white p-4 text-sm font-bold leading-6 text-stone-800">
                {status}
              </p>
            )}
          </aside>
        </div>
      </div>
    </section>
  );
}

function LightInput({ label, value, onChange, type = "text", required = false, ...props }) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-black uppercase tracking-[.12em] text-stone-600">{label}</span>
      <input
        className="rounded-2xl border border-stone-200 bg-[#fbfaf6] px-4 py-4 font-bold text-[#17130d] outline-none transition focus:border-[#d7b56d] focus:bg-white"
        required={required}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        {...props}
      />
    </label>
  );
}

function LightSelect({ label, value, onChange, options }) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-black uppercase tracking-[.12em] text-stone-600">{label}</span>
      <select
        className="rounded-2xl border border-stone-200 bg-[#fbfaf6] px-4 py-4 font-bold text-[#17130d] outline-none transition focus:border-[#d7b56d] focus:bg-white"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((item) => (
          <option key={item} value={item}>{item}</option>
        ))}
      </select>
    </label>
  );
}

function LightTextarea({ label, value, onChange, required = false }) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-black uppercase tracking-[.12em] text-stone-600">{label}</span>
      <textarea
        className="min-h-32 rounded-2xl border border-stone-200 bg-[#fbfaf6] px-4 py-4 font-bold text-[#17130d] outline-none transition focus:border-[#d7b56d] focus:bg-white"
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function LightCheckGroup({ label, values, options, onToggle }) {
  return (
    <div>
      <span className="text-xs font-black uppercase tracking-[.12em] text-stone-600">{label}</span>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {options.map((item) => (
          <label
            key={item}
            className={`flex cursor-pointer items-center justify-between gap-3 rounded-2xl border p-4 text-sm font-black transition ${
              values.includes(item) ? "border-[#d7b56d] bg-[#fff4d9] text-[#17130d]" : "border-stone-200 bg-[#fbfaf6] text-stone-700"
            }`}
          >
            {item}
            <input className="h-5 w-5 accent-[#d7b56d]" checked={values.includes(item)} onChange={() => onToggle(item)} type="checkbox" />
          </label>
        ))}
      </div>
    </div>
  );
}

function Showcase() {
  return (
    <section id="work" className="px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
      <div className="mx-auto max-w-7xl">
        <SectionHead eyebrow="Demo websites" title="Click an example to open the full demo site." />
        <div className="grid gap-5 xl:grid-cols-3">
          {demoSites.map((item) => (
            <a
              key={item.title}
              className="demo-card group block overflow-hidden rounded-[1.75rem] p-6 transition hover:-translate-y-1"
              href={item.href}
              style={{ "--accent": item.accent, "--glow": item.glow }}
            >
              <span className="inline-flex rounded-full bg-white/10 px-3 py-2 text-xs font-black uppercase tracking-[.12em] text-white">{item.type}</span>
              <h3 className="mt-24 max-w-xs text-5xl font-black leading-[.88] tracking-[-.055em] text-[#fff7e7]">{item.title}</h3>
              <p className="mt-5 max-w-sm text-sm font-bold leading-6 text-stone-300">{item.subtitle}</p>
              <div className="mt-8 grid gap-2">
                {item.details.map((detail) => (
                  <span key={detail} className="rounded-2xl bg-white/10 px-3 py-2 text-xs font-black text-stone-100">
                    {detail}
                  </span>
                ))}
              </div>
              <span className="mt-8 inline-flex rounded-2xl px-4 py-3 text-sm font-black text-[#17120b] transition group-hover:scale-[1.02]" style={{ background: item.glow }}>
                Open full demo
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function Quality() {
  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
      <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-4">
        {[
          ["Premium UI", "Clean layouts, strong typography, and polished visual hierarchy."],
          ["Fast Launch", "Focused builds for businesses that need to go online quickly."],
          ["Mobile First", "Every design is shaped for phone screens first."],
          ["Clear Handover", "Final website, domain guidance, and support details are delivered clearly."],
        ].map(([title, desc]) => (
          <article key={title} className="panel rounded-3xl p-5">
            <h3 className="text-xl font-black tracking-[-.03em] text-[#fff7e7]">{title}</h3>
            <p className="mt-3 leading-7 text-stone-300">{desc}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function Contact() {
  return (
    <section id="contact" className="bg-[#11100d] px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1fr_.9fr] lg:items-center">
        <SectionHead eyebrow="Start a project" title="A polished website should feel like a business asset." />
        <div className="grid gap-3 sm:grid-cols-2">
          <a className="glass rounded-3xl p-5 transition hover:-translate-y-1" href="https://www.instagram.com/anurag__reddy_18/" target="_blank" rel="noopener">
            <span className="text-xs font-black uppercase tracking-[.14em] text-[#f3d891]">Instagram</span>
            <strong className="mt-3 block text-2xl">@anurag__reddy_18</strong>
          </a>
          <a className="glass rounded-3xl p-5 transition hover:-translate-y-1" href="https://wa.me/918019724653" target="_blank" rel="noopener">
            <span className="text-xs font-black uppercase tracking-[.14em] text-[#f3d891]">WhatsApp</span>
            <strong className="mt-3 block text-2xl">Anurag</strong>
          </a>
        </div>
      </div>
    </section>
  );
}

function App() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Services />
        <Pricing />
        <Estimate />
        <ProjectPortal />
        <Showcase />
        <Quality />
        <Contact />
      </main>
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
