function formatPrice(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function clean(value, fallback = "Not provided") {
  if (Array.isArray(value)) {
    return value.length ? value.join(", ") : fallback;
  }
  return value === undefined || value === null || value === "" ? fallback : value;
}

async function readApiJson(response) {
  const text = await response.text();
  let data;

  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    throw new Error(`API route returned a non-JSON response. Status: ${response.status}.`);
  }

  if (!response.ok || data.ok === false) {
    throw new Error(data.error || `Request failed with status ${response.status}.`);
  }

  return data;
}

function DetailRows({ rows }) {
  return (
    <div className="confirm-list">
      {rows.map(([label, value]) => (
        <div className="confirm-row" key={label}>
          <span>{label}</span>
          <span>{clean(value)}</span>
        </div>
      ))}
    </div>
  );
}

function ConfirmationApp() {
  const params = new URLSearchParams(window.location.search);
  const stored = React.useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("deccan_sites_last_confirmation") || "{}");
    } catch {
      return {};
    }
  }, []);

  const projectId = params.get("projectId") || stored?.project?.projectId || "";
  const orderId = params.get("orderId") || params.get("order_id") || stored?.orderId || "";
  const paymentId = params.get("paymentId") || stored?.paymentId || "";
  const status = params.get("status") || stored?.status || "PAID";

  const [project, setProject] = React.useState(stored?.project || null);
  const [message, setMessage] = React.useState(projectId ? "Loading confirmed project details..." : "Missing project ID.");

  React.useEffect(() => {
    if (!projectId) return;

    fetch(`/api/projects?projectId=${encodeURIComponent(projectId)}`)
      .then(readApiJson)
      .then((data) => {
        setProject(data.project);
        setMessage("");
      })
      .catch((error) => {
        setMessage(error.message || "Could not load project details.");
      });
  }, [projectId]);

  const confirmed = String(status || "").toUpperCase() === "PAID";
  const paymentValue = paymentId || project?.paymentId || "Payment confirmation pending";

  return (
    <main className="confirm-shell">
      <nav className="confirm-topbar">
        <a className="confirm-brand" href="index.html">
          <span className="confirm-logo">DS</span>
          <span>Deccan Sites</span>
        </a>
        <span className="confirm-label">Payment confirmation</span>
      </nav>

      <section className="confirm-hero">
        <div>
          <span className="confirm-label">{confirmed ? "Payment verified" : "Payment status"}</span>
          <h1>{confirmed ? "Your project is confirmed." : "We are checking your payment."}</h1>
          <p>
            This page keeps the customer payment and submitted project requirement together, so both sides can track the same project ID without confusion.
          </p>
          <div className="confirm-actions">
            <a className="primary" href="index.html#portal">Start another project</a>
            <a href="https://wa.me/918019724653" target="_blank" rel="noopener">Message Anurag</a>
          </div>
        </div>
        <aside className="confirm-status">
          <span className="confirm-label">Amount</span>
          <strong>{formatPrice(project?.estimatedAmount)}</strong>
          <p className="mt-5 text-sm font-bold leading-6 text-slate-600">
            {message || `Status: ${clean(status)}. We will review the saved brief and contact the customer for the next step.`}
          </p>
        </aside>
      </section>

      <section className="confirm-grid">
        <article className="confirm-card">
          <span className="confirm-label">Project</span>
          <h2>{clean(project?.projectId || projectId)}</h2>
          <DetailRows
            rows={[
              ["Business", project?.businessName],
              ["Category", project?.businessCategory],
              ["Location", project?.businessLocation],
              ["Launch date", project?.launchDate],
            ]}
          />
        </article>

        <article className="confirm-card">
          <span className="confirm-label">Payment</span>
          <h2>{clean(status)}</h2>
          <DetailRows
            rows={[
              ["Payment ID", paymentValue],
              ["Order ID", orderId],
              ["Amount", formatPrice(project?.estimatedAmount)],
              ["Currency", "INR"],
            ]}
          />
        </article>

        <article className="confirm-card">
          <span className="confirm-label">Customer</span>
          <h2>{clean(project?.name)}</h2>
          <DetailRows
            rows={[
              ["Email", project?.email],
              ["WhatsApp", project?.phone],
              ["Content", project?.contentReadiness],
              ["Brand", project?.logoReadiness],
            ]}
          />
        </article>

        <article className="confirm-card wide">
          <span className="confirm-label">Requirement</span>
          <h2>{clean(project?.websiteType)}</h2>
          <DetailRows
            rows={[
              ["Pages", project?.pages],
              ["Domain", project?.domainOption],
              ["Sections", project?.sections],
              ["Add-ons", project?.addOns],
            ]}
          />
        </article>

        <article className="confirm-card">
          <span className="confirm-label">Next step</span>
          <h2>Team review</h2>
          <p className="mt-5 text-sm font-bold leading-6 text-slate-600">
            Deccan Sites checks the requirement, confirms content, and starts the build plan for the saved project.
          </p>
        </article>

        <article className="confirm-card full">
          <span className="confirm-label">Website idea</span>
          <h2>{clean(project?.businessName, "Project brief")}</h2>
          <p className="mt-5 text-base font-bold leading-8 text-slate-600">{clean(project?.idea)}</p>
          {project?.references && <p className="mt-4 text-sm font-bold leading-6 text-slate-600">References: {project.references}</p>}
          {project?.notes && <p className="mt-4 text-sm font-bold leading-6 text-slate-600">Notes: {project.notes}</p>}
        </article>
      </section>
    </main>
  );
}

ReactDOM.createRoot(document.getElementById("confirmation-root")).render(<ConfirmationApp />);
