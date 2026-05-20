const brand = {
  name: "ARCHITECH",
  short: "AT",
  city: "Hyderabad Studio",
};

const estimateTypes = [
  { label: "Concept landing system", price: 999 },
  { label: "Development portfolio", price: 2499 },
  { label: "Investor presentation portal", price: 4999 },
  { label: "Full development platform", price: 7999 },
];

const estimateAddOns = [
  { label: "Additional development page", price: 350 },
  { label: "Brand refinement", price: 599 },
  { label: "Editorial copywriting", price: 799 },
  { label: "Lead enquiry flow", price: 1299 },
  { label: "Payment-ready booking setup", price: 1999 },
  { label: "Operator dashboard", price: 3999 },
];

const domainOptions = [
  { label: "Existing domain", price: 0 },
  { label: "Domain architecture support", price: 599 },
  { label: "Hosting launch support", price: 999 },
  { label: "Domain + hosting orchestration", price: 1499 },
];

const sectionOptions = ["Overview", "Masterplan", "Residences", "Amenities", "Gallery", "Specifications", "Location", "Enquiry", "Insights"];
const contentOptions = ["All project material is ready", "Some material is ready", "Need editorial refinement", "Need complete narrative direction"];
const logoOptions = ["Identity system is ready", "Logo ready, art direction needed", "Need brand refinement", "Need complete visual direction"];

const developments = [
  ["01", "Vertical Residences", "High-density residential interfaces with premium inventory storytelling, amenity logic, and enquiry architecture."],
  ["02", "Mixed-Use Districts", "Structured narratives for retail, work, culture, and hospitality developments across multi-stakeholder journeys."],
  ["03", "Investor Platforms", "Data-backed project presentations, sales rooms, and proof-led portfolios for boardroom-grade communication."],
  ["04", "Hospitality Assets", "Cinematic digital systems for hotels, clubs, retreats, and destination-led spaces."],
];

const portfolio = [
  {
    title: "The Onyx Atrium",
    type: "Mixed-use landmark",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=85",
    details: ["42 floors", "Retail podium", "Investor deck"],
  },
  {
    title: "Ivory Court",
    type: "Residential precinct",
    image: "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=1200&q=85",
    details: ["Amenity story", "Unit logic", "Sales portal"],
  },
  {
    title: "Axis Gallery",
    type: "Portfolio system",
    image: "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=85",
    details: ["Editorial UI", "Lead capture", "Market proof"],
  },
];

const timeline = [
  ["Foundation", "Research-led positioning for property, design, and digital infrastructure."],
  ["Design System", "A precise visual language built from grids, material contrast, and investor-grade typography."],
  ["Platform Layer", "Digital portals that combine development storytelling, enquiry capture, and operational clarity."],
  ["Scale", "Reusable frameworks for future assets, markets, launches, and stakeholder presentations."],
];

const services = [
  ["Digital Masterplans", "Narrative systems for residential, commercial, hospitality, and mixed-use projects."],
  ["Portfolio Galleries", "Cinematic galleries with structured specifications, typologies, and project proof."],
  ["Investor Rooms", "Private-facing project presentations, data sections, and boardroom-ready digital collateral."],
  ["Lead Architecture", "High-intent enquiry flows, qualification fields, payment-ready booking, and CRM-friendly data."],
  ["Brand Systems", "Visual direction, tone, UI components, and launch-ready content hierarchy."],
  ["AI Strategy", "AI-assisted content operations, lead routing, project intelligence, and automation planning."],
];

const insights = [
  ["Clarity sells luxury", "The most premium development websites feel calm because every detail has a role."],
  ["Why bento grids work", "Structured cards let buyers, investors, and operators scan complex property information quickly."],
  ["From brochure to platform", "Architectural communication is shifting from static PDFs to living digital systems."],
];

function Header() {
  return (
    <header className="fixed inset-x-3 top-3 z-50 mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 border border-black/10 bg-white/70 px-3 py-3 shadow-[0_24px_70px_rgba(16,20,21,.08)] backdrop-blur-2xl md:inset-x-5 md:top-5 md:flex-nowrap">
      <a className="flex items-center gap-3" href="#developments" aria-label={`${brand.name} home`}>
        <span className="grid h-10 w-10 place-items-center bg-[#101415] text-sm font-black text-[#FBFBFA]">{brand.short}</span>
        <span className="text-lg font-extrabold tracking-[-.02em] text-[#101415]">{brand.name}</span>
      </a>
      <nav className="mobile-scroll order-3 flex w-full gap-1 text-[.72rem] font-black uppercase tracking-[.14em] text-[#101415]/70 md:order-none md:w-auto">
        {[
          ["Developments", "#developments"],
          ["Portfolio", "#portfolio"],
          ["Timeline", "#timeline"],
          ["Services", "#services"],
          ["Insights", "#insights"],
        ].map(([label, href]) => (
          <a key={href} className="px-3 py-2 transition hover:text-[#C5A059]" href={href}>
            {label}
          </a>
        ))}
      </nav>
      <a className="gold-btn px-4 py-3 text-xs font-black uppercase tracking-[.12em]" href="#brief">
        Start brief
      </a>
    </header>
  );
}

function Hero() {
  return (
    <section id="developments" className="relative isolate min-h-[100svh] overflow-hidden px-4 pb-16 pt-56 sm:px-6 sm:pt-44 lg:px-8 lg:pt-40">
      <img
        className="absolute inset-0 -z-30 h-full w-full object-cover"
        src="https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=2200&q=85"
        alt=""
      />
      <div className="absolute inset-0 -z-20 bg-[linear-gradient(90deg,rgba(251,251,250,.96)_0%,rgba(251,251,250,.78)_48%,rgba(251,251,250,.28)_100%)]" />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(251,251,250,.12),#FBFBFA_92%)]" />

      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[minmax(0,1fr)_430px] lg:items-end">
        <div className="max-w-5xl">
          <p className="gold-label">Architectural development platform</p>
          <h1 className="mt-8 max-w-5xl text-[clamp(4rem,9vw,9.4rem)] font-black leading-[.82] tracking-[-.07em] text-[#101415]">
            Built form, made legible.
          </h1>
          <p className="mt-8 max-w-2xl text-[clamp(1rem,1.4vw,1.22rem)] font-semibold leading-8 text-[#101415]/74">
            ARCHITECH creates precise digital platforms for developers, architects, and asset owners who need their projects to feel engineered, editorial, and investment-ready.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <a className="gold-btn px-5 py-4 text-sm font-black uppercase tracking-[.12em]" href="#brief">
              Start development brief
            </a>
            <a className="onyx-link px-5 py-4 text-sm font-black uppercase tracking-[.12em]" href="#portfolio">
              View portfolio
            </a>
          </div>
        </div>

        <aside className="glass sharp p-5">
          <p className="gold-label">Live operating model</p>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <Metric label="Assets shaped" value="38" />
            <Metric label="Launch systems" value="12" />
            <Metric label="Grid precision" value="04px" />
            <Metric label="Visual mode" value="Pro" />
          </div>
          <div className="mt-5 border border-[#101415]/10 bg-[#FBFBFA]/62 p-4">
            <span className="text-xs font-black uppercase tracking-[.18em] text-[#C5A059]">Signal</span>
            <p className="mt-3 text-sm font-bold leading-6 text-[#101415]/72">
              Sparse gold states, strong onyx typography, and bento hierarchy create a premium platform rhythm without decorative noise.
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}

function Metric({ label, value }) {
  return (
    <div className="border border-[#101415]/10 bg-white/54 p-4">
      <span className="text-[.64rem] font-black uppercase tracking-[.16em] text-[#101415]/50">{label}</span>
      <strong className="mt-3 block text-3xl font-black leading-none tracking-[-.04em] text-[#101415]">{value}</strong>
    </div>
  );
}

function SectionHead({ eyebrow, title, children }) {
  return (
    <div className="mb-12 grid gap-5 lg:grid-cols-[.36fr_1fr] lg:items-end">
      <p className="gold-label">{eyebrow}</p>
      <div>
        <h2 className="max-w-4xl text-[clamp(2.4rem,5vw,5.7rem)] font-black leading-[.9] tracking-[-.06em] text-[#101415]">{title}</h2>
        {children}
      </div>
    </div>
  );
}

function Developments() {
  return (
    <section className="px-4 py-28 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHead eyebrow="Developments" title="Four asset narratives, one precise digital language." />
        <div className="grid gap-4 md:grid-cols-2">
          {developments.map(([number, title, desc], index) => (
            <article key={title} className={`panel sharp p-6 ${index === 0 ? "md:row-span-2" : ""}`}>
              <span className="text-xs font-black uppercase tracking-[.22em] text-[#C5A059]">{number}</span>
              <h3 className="mt-10 max-w-sm text-4xl font-black leading-[.92] tracking-[-.05em] text-[#101415]">{title}</h3>
              <p className="mt-5 max-w-xl text-sm font-semibold leading-7 text-[#101415]/68">{desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Portfolio() {
  return (
    <section id="portfolio" className="px-4 py-28 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHead eyebrow="Portfolio" title="Cinematic project systems with technical order." />
        <div className="grid gap-4 lg:grid-cols-3">
          {portfolio.map((item) => (
            <article key={item.title} className="portfolio-card sharp overflow-hidden">
              <img className="h-80 w-full object-cover" src={item.image} alt="" />
              <div className="p-5">
                <p className="gold-label">{item.type}</p>
                <h3 className="mt-4 text-3xl font-black tracking-[-.04em] text-[#101415]">{item.title}</h3>
                <div className="mt-5 grid gap-2">
                  {item.details.map((detail) => (
                    <span key={detail} className="border border-[#101415]/10 bg-white/60 px-3 py-2 text-xs font-black uppercase tracking-[.12em] text-[#101415]/68">
                      {detail}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Timeline() {
  return (
    <section id="timeline" className="px-4 py-28 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHead eyebrow="Timeline" title="Company evolution from positioning to platform scale." />
        <div className="grid gap-3">
          {timeline.map(([title, desc], index) => (
            <article key={title} className="panel sharp grid gap-5 p-5 md:grid-cols-[120px_240px_1fr] md:items-center">
              <span className="text-xs font-black uppercase tracking-[.18em] text-[#C5A059]">0{index + 1}</span>
              <h3 className="text-2xl font-black tracking-[-.04em] text-[#101415]">{title}</h3>
              <p className="text-sm font-semibold leading-7 text-[#101415]/66">{desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Services() {
  return (
    <section id="services" className="px-4 py-28 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHead eyebrow="Services" title="Technical capability with luxury restraint." />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {services.map(([title, desc]) => (
            <article key={title} className="panel sharp p-6">
              <span className="block h-px w-16 bg-[#C5A059]" />
              <h3 className="mt-10 text-3xl font-black tracking-[-.04em] text-[#101415]">{title}</h3>
              <p className="mt-4 text-sm font-semibold leading-7 text-[#101415]/66">{desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Insights() {
  return (
    <section id="insights" className="px-4 py-28 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHead eyebrow="Insights" title="Thought leadership for architectural digital systems." />
        <div className="grid gap-4 lg:grid-cols-3">
          {insights.map(([title, desc], index) => (
            <article key={title} className="panel sharp p-6">
              <span className="text-xs font-black uppercase tracking-[.2em] text-[#C5A059]">Insight 0{index + 1}</span>
              <h3 className="mt-16 text-3xl font-black leading-[.96] tracking-[-.04em] text-[#101415]">{title}</h3>
              <p className="mt-5 text-sm font-semibold leading-7 text-[#101415]/66">{desc}</p>
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

async function readApiJson(response) {
  const text = await response.text();
  let data;

  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    throw new Error(`API route returned a non-JSON response. Status: ${response.status}. Check the Vercel API deployment.`);
  }

  if (!response.ok || data.ok === false) {
    throw new Error(data.error || `Request failed with status ${response.status}.`);
  }

  return data;
}

function ProjectPortal() {
  const [config, setConfig] = React.useState({ enabled: false, provider: "cashfree", mode: "sandbox" });
  const [form, setForm] = React.useState({
    name: "",
    email: "",
    phone: "",
    businessName: "",
    businessLocation: "",
    businessCategory: "",
    websiteType: "Development portfolio",
    pages: 5,
    domainOption: "Existing domain",
    addOns: ["Editorial copywriting"],
    sections: ["Overview", "Masterplan", "Enquiry"],
    idea: "",
    references: "",
    contentReadiness: "Some material is ready",
    logoReadiness: "Logo ready, art direction needed",
    launchDate: "",
    notes: "",
  });
  const [project, setProject] = React.useState(null);
  const [status, setStatus] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    fetch("/api/payments/config")
      .then(readApiJson)
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

  function loadCashfreeCheckout() {
    if (window.Cashfree) return Promise.resolve();

    return new Promise((resolve, reject) => {
      const existingScript = document.querySelector('script[src="https://sdk.cashfree.com/js/v3/cashfree.js"]');
      const script = existingScript || document.createElement("script");
      script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
      script.async = true;
      script.onload = () => (window.Cashfree ? resolve() : reject(new Error("Cashfree checkout did not initialize.")));
      script.onerror = () => reject(new Error("Cashfree checkout could not load. Check internet access, browser blocking, or ad blocker settings."));

      if (!existingScript) document.body.appendChild(script);

      setTimeout(() => {
        if (!window.Cashfree) reject(new Error("Cashfree checkout could not load. Check internet access, browser blocking, or ad blocker settings."));
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
      const data = await readApiJson(response);
      setProject(data.project);
      setStatus(`Brief saved. Opening reservation payment for ${formatPrice(data.estimatedAmount)}.`);
      await startPaymentForProject(data.project);
    } catch (error) {
      setStatus(error.message || "Could not save development brief.");
    } finally {
      setSaving(false);
    }
  }

  async function startPaymentForProject(activeProject) {
    setLoading(true);

    try {
      if (!config.enabled) throw new Error("Payment gateway is ready in code. Add Cashfree keys to activate live payments.");

      await loadCashfreeCheckout();

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
      const order = await readApiJson(orderResponse);

      const cashfree = window.Cashfree({ mode: order.mode || config.mode || "sandbox" });
      const result = await cashfree.checkout({
        paymentSessionId: order.paymentSessionId,
        redirectTarget: "_modal",
      });

      if (result?.error) throw new Error(result.error.message || "Payment window closed before completion.");

      const verifyResponse = await fetch("/api/payments/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.orderId, projectId: activeProject?.projectId }),
      });
      const verified = await readApiJson(verifyResponse);
      if (!verified.ok) throw new Error(verified.error || "Payment is not confirmed yet.");
      setStatus("Payment verified through Cashfree. Your ARCHITECH brief is recorded.");
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
    <section id="brief" className="px-4 py-28 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHead eyebrow="Development brief" title="Scope the asset, reserve the platform build.">
          <p className="mt-5 max-w-2xl text-base font-semibold leading-8 text-[#101415]/68">
            A precise intake layer for project owners. Submit the development context, receive a live estimate, and attach the reservation payment to the same record.
          </p>
        </SectionHead>

        <div className="grid gap-5 lg:grid-cols-[1.15fr_.85fr] lg:items-start">
          <form id="project-portal-form" className="glass sharp p-5 sm:p-7" onSubmit={submitProject}>
            <div className="grid gap-5">
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Lead name" value={form.name} onChange={(value) => updateField("name", value)} required />
                <Field label="Email" type="email" value={form.email} onChange={(value) => updateField("email", value)} required />
                <Field label="WhatsApp" value={form.phone} onChange={(value) => updateField("phone", value)} required />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Development entity" value={form.businessName} onChange={(value) => updateField("businessName", value)} required />
                <Field label="Asset location" value={form.businessLocation} onChange={(value) => updateField("businessLocation", value)} />
                <Field label="Asset class" value={form.businessCategory} onChange={(value) => updateField("businessCategory", value)} required />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <SelectField label="Platform type" value={form.websiteType} onChange={(value) => updateField("websiteType", value)} options={estimateTypes.map((item) => item.label)} />
                <Field label="Pages needed" min="1" max="20" type="number" value={form.pages} onChange={(value) => updateField("pages", value)} />
                <SelectField label="Domain orchestration" value={form.domainOption} onChange={(value) => updateField("domainOption", value)} options={domainOptions.map((item) => item.label)} />
              </div>

              <CheckGroup label="Technical modules" values={form.addOns} options={estimateAddOns.map((item) => item.label)} onToggle={(value) => toggleList("addOns", value)} />
              <CheckGroup label="Information architecture" values={form.sections} options={sectionOptions} onToggle={(value) => toggleList("sections", value)} />

              <div className="grid gap-4 sm:grid-cols-2">
                <SelectField label="Material readiness" value={form.contentReadiness} onChange={(value) => updateField("contentReadiness", value)} options={contentOptions} />
                <SelectField label="Identity readiness" value={form.logoReadiness} onChange={(value) => updateField("logoReadiness", value)} options={logoOptions} />
              </div>

              <TextField label="Project narrative" value={form.idea} onChange={(value) => updateField("idea", value)} required />
              <TextField label="Reference developments" value={form.references} onChange={(value) => updateField("references", value)} />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Preferred launch date" type="date" value={form.launchDate} onChange={(value) => updateField("launchDate", value)} />
                <Field label="Additional notes" value={form.notes} onChange={(value) => updateField("notes", value)} />
              </div>

              <button className="gold-btn px-5 py-4 text-sm font-black uppercase tracking-[.12em]" disabled={saving || loading} type="submit">
                {saving || loading ? "Preparing reservation" : `Reserve build - ${formatPrice(estimate)}`}
              </button>
            </div>
          </form>

          <aside className="glass sharp sticky top-28 p-6">
            <span className="gold-label">Live estimate</span>
            <strong className="mt-5 block text-[clamp(3rem,7vw,5.2rem)] font-black leading-none tracking-[-.06em] text-[#101415]">
              {formatPrice(project?.estimatedAmount || estimate)}
            </strong>
            <p className="mt-5 text-sm font-semibold leading-7 text-[#101415]/68">
              The estimate updates with selected platform type, pages, domain orchestration, and technical modules.
            </p>
            <div className="mt-6 border border-[#101415]/10 bg-white/58 p-4">
              <span className="text-xs font-black uppercase tracking-[.14em] text-[#101415]/46">Payment amount</span>
              <strong className="mt-2 block text-2xl tracking-[-.03em] text-[#101415]">{formatPrice(project?.estimatedAmount || estimate)}</strong>
            </div>
            <form className="mt-4 grid gap-3" onSubmit={startPayment}>
              <button className="gold-btn px-5 py-4 text-sm font-black uppercase tracking-[.12em] disabled:cursor-not-allowed disabled:opacity-60" disabled={loading || saving} type="submit">
                {loading || saving ? "Preparing payment" : "Pay estimated amount"}
              </button>
              <p className="text-xs font-bold leading-5 text-[#101415]/56">Payment is attached to the saved development brief and verified through Cashfree.</p>
            </form>
            {status && <p className="mt-4 border border-[#101415]/10 bg-white/66 p-4 text-sm font-bold leading-6 text-[#101415]/72">{status}</p>}
          </aside>
        </div>
      </div>
    </section>
  );
}

function Field({ label, value, onChange, type = "text", required = false, ...props }) {
  return (
    <label className="grid gap-2">
      <span className="text-[.68rem] font-black uppercase tracking-[.14em] text-[#101415]/56">{label}</span>
      <input className="field" required={required} type={type} value={value} onChange={(event) => onChange(event.target.value)} {...props} />
    </label>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <label className="grid gap-2">
      <span className="text-[.68rem] font-black uppercase tracking-[.14em] text-[#101415]/56">{label}</span>
      <select className="field" value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((item) => (
          <option key={item} value={item}>{item}</option>
        ))}
      </select>
    </label>
  );
}

function TextField({ label, value, onChange, required = false }) {
  return (
    <label className="grid gap-2">
      <span className="text-[.68rem] font-black uppercase tracking-[.14em] text-[#101415]/56">{label}</span>
      <textarea className="field min-h-32" required={required} value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function CheckGroup({ label, values, options, onToggle }) {
  return (
    <div>
      <span className="text-[.68rem] font-black uppercase tracking-[.14em] text-[#101415]/56">{label}</span>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {options.map((item) => (
          <label
            key={item}
            className={`flex cursor-pointer items-center justify-between gap-3 border p-4 text-sm font-black transition ${
              values.includes(item) ? "border-[#C5A059] bg-[#C5A059]/10 text-[#101415]" : "border-[#101415]/10 bg-white/58 text-[#101415]/70"
            }`}
          >
            {item}
            <input className="h-5 w-5 accent-[#C5A059]" checked={values.includes(item)} onChange={() => onToggle(item)} type="checkbox" />
          </label>
        ))}
      </div>
    </div>
  );
}

function Contact() {
  return (
    <section className="px-4 py-28 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-[1fr_.9fr] lg:items-center">
        <SectionHead eyebrow="Studio" title="A luxury interface should operate like infrastructure." />
        <div className="grid gap-3 sm:grid-cols-2">
          <a className="glass sharp p-5 transition hover:-translate-y-1" href="https://www.instagram.com/anurag__reddy_18/" target="_blank" rel="noopener">
            <span className="gold-label">Instagram</span>
            <strong className="mt-8 block text-2xl text-[#101415]">@anurag__reddy_18</strong>
          </a>
          <a className="glass sharp p-5 transition hover:-translate-y-1" href="https://wa.me/918019724653" target="_blank" rel="noopener">
            <span className="gold-label">WhatsApp</span>
            <strong className="mt-8 block text-2xl text-[#101415]">Anurag</strong>
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
        <Developments />
        <Portfolio />
        <Timeline />
        <Services />
        <Insights />
        <ProjectPortal />
        <Contact />
      </main>
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
