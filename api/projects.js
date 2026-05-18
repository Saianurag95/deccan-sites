import {
  calculateProjectEstimate,
  createProjectId,
  domainOptions,
  estimateAddOns,
  isValidEmail,
  json,
  normalizeEmail,
  readJson,
  websiteTypes,
} from "./_shared.js";

export default async function handler(request, response) {
  if (request.method !== "POST") {
    json(response, 405, { ok: false, error: "Method not allowed." });
    return;
  }

  try {
    const body = await readJson(request);
    const name = String(body.name || "").trim();
    const email = normalizeEmail(body.email);
    const phone = String(body.phone || "").replace(/[^\d+]/g, "").slice(0, 16);
    const businessName = String(body.businessName || "").trim();
    const businessLocation = String(body.businessLocation || "").trim();
    const businessCategory = String(body.businessCategory || "").trim();
    const websiteType = String(body.websiteType || "").trim();
    const pages = Math.max(1, Math.min(20, Number(body.pages || 1)));
    const domainOption = String(body.domainOption || "").trim();
    const addOns = Array.isArray(body.addOns) ? body.addOns.map(String) : [];
    const sections = Array.isArray(body.sections) ? body.sections.map(String) : [];
    const idea = String(body.idea || "").trim();
    const references = String(body.references || "").trim();
    const contentReadiness = String(body.contentReadiness || "").trim();
    const logoReadiness = String(body.logoReadiness || "").trim();
    const launchDate = String(body.launchDate || "").trim();
    const notes = String(body.notes || "").trim();

    if (!name || !isValidEmail(email) || phone.length < 10 || !businessName || !businessCategory || !idea) {
      json(response, 400, {
        ok: false,
        error: "Enter name, email, WhatsApp, business name, business category, and website idea.",
      });
      return;
    }

    if (!websiteTypes.some((item) => item.label === websiteType) || !domainOptions.some((item) => item.label === domainOption)) {
      json(response, 400, { ok: false, error: "Choose a valid website type and domain option." });
      return;
    }

    const invalidAddOn = addOns.find((label) => !estimateAddOns.some((item) => item.label === label));
    if (invalidAddOn) {
      json(response, 400, { ok: false, error: "Choose valid optional features." });
      return;
    }

    const project = {
      projectId: createProjectId(),
      status: "estimate_created",
      estimatedAmount: calculateProjectEstimate({ websiteType, pages, domainOption, addOns }),
      currency: "INR",
      name,
      email,
      phone,
      businessName,
      businessLocation,
      businessCategory,
      websiteType,
      pages,
      domainOption,
      addOns,
      sections,
      idea,
      references,
      contentReadiness,
      logoReadiness,
      launchDate,
      notes,
      createdAt: new Date().toISOString(),
    };

    json(response, 200, {
      ok: true,
      projectId: project.projectId,
      estimatedAmount: project.estimatedAmount,
      project,
    });
  } catch (error) {
    json(response, 500, { ok: false, error: error.message || "Could not save project requirement." });
  }
}
