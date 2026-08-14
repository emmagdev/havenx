/* ==========================================================
   HavenX — Event Creation Flow
   Shared logic for all "Create Event" screens.
   Persists a single object under localStorage key "havenxEvent".
   This one file is included on every screen; each init
   function checks for its own page's elements before running,
   so it is safe to load everywhere.
   ========================================================== */

const STORAGE_KEY = "havenxEvent";

function defaultEventData() {
  return {
    name: "",
    category: "",
    description: "",
    date: "",
    startTime: "",
    endTime: "",
    venue: "",
    address: "",
    city: "",
    eventType: "physical",
    eventLink: "",
    banner: "",
    ticketType: "free",
    ticketName: "",
    ticketPrice: 0,
    ticketQuantity: 0,
    published: false
  };
}

function getEventData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultEventData();
    return Object.assign(defaultEventData(), JSON.parse(raw));
  } catch (e) {
    return defaultEventData();
  }
}

function saveEventData(updates) {
  const current = getEventData();
  const merged = Object.assign(current, updates);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  } catch (e) {
    // Likely storage quota exceeded (e.g. a very large banner image).
    console.warn("Could not save event data:", e);
  }
  return merged;
}

/* ---------- Validation helpers ---------- */

function showFieldError(fieldEl, message) {
  fieldEl.classList.add("has-error");
  const errorEl = fieldEl.querySelector(".field-error");
  if (errorEl) errorEl.textContent = message;
}

function clearFieldError(fieldEl) {
  fieldEl.classList.remove("has-error");
  const errorEl = fieldEl.querySelector(".field-error");
  if (errorEl) errorEl.textContent = "";
}

function clearAllErrors(root) {
  root.querySelectorAll(".field.has-error").forEach(clearFieldError);
}

/* Validates a required text/select/textarea input.
   Returns true if valid, false (and shows an inline message) if not. */
function validateRequired(inputEl, message) {
  const fieldEl = inputEl.closest(".field");
  const value = inputEl.value.trim();
  if (!value) {
    if (fieldEl) showFieldError(fieldEl, message);
    return false;
  }
  if (fieldEl) clearFieldError(fieldEl);
  return true;
}

/* ==========================================================
   SCREEN 1 — event-details.html
   ========================================================== */
function initDetailsPage() {
  const form = document.getElementById("detailsForm");
  if (!form) return;

  const data = getEventData();
  const nameInput = document.getElementById("eventName");
  const categoryInput = document.getElementById("eventCategory");
  const descriptionInput = document.getElementById("eventDescription");

  nameInput.value = data.name || "";
  categoryInput.value = data.category || "";
  descriptionInput.value = data.description || "";

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    clearAllErrors(form);

    const nameValid = validateRequired(nameInput, "Please enter your event name.");
    const categoryValid = validateRequired(categoryInput, "Please select a category.");

    if (!nameValid || !categoryValid) return;

    saveEventData({
      name: nameInput.value.trim(),
      category: categoryInput.value,
      description: descriptionInput.value.trim()
    });

    window.location.href = "event-location.html";
  });
}

/* ==========================================================
   SCREEN 2 — event-location.html
   ========================================================== */
function initLocationPage() {
  const form = document.getElementById("locationForm");
  if (!form) return;

  const data = getEventData();

  const dateInput = document.getElementById("eventDate");
  const startTimeInput = document.getElementById("startTime");
  const endTimeInput = document.getElementById("endTime");
  const venueInput = document.getElementById("venueName");
  const addressInput = document.getElementById("venueAddress");
  const cityInput = document.getElementById("venueCity");
  const eventLinkInput = document.getElementById("eventLink");
  const eventLinkField = eventLinkInput.closest(".field");
  const physicalFields = document.getElementById("physicalFields");
  const toggleOptions = document.querySelectorAll(".toggle-option");

  dateInput.value = data.date || "";
  startTimeInput.value = data.startTime || "";
  endTimeInput.value = data.endTime || "";
  venueInput.value = data.venue || "";
  addressInput.value = data.address || "";
  cityInput.value = data.city || "";
  eventLinkInput.value = data.eventLink || "";

  let eventType = data.eventType || "physical";

  function applyEventType(type) {
    eventType = type;
    toggleOptions.forEach(function (opt) {
      opt.classList.toggle("selected", opt.dataset.type === type);
    });
    if (type === "online") {
      physicalFields.classList.add("hidden-field");
      eventLinkField.classList.remove("hidden-field");
    } else {
      physicalFields.classList.remove("hidden-field");
      eventLinkField.classList.add("hidden-field");
    }
  }

  toggleOptions.forEach(function (opt) {
    opt.addEventListener("click", function () {
      applyEventType(opt.dataset.type);
    });
  });

  applyEventType(eventType);

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    clearAllErrors(form);

    const dateValid = validateRequired(dateInput, "Please choose an event date.");
    const startValid = validateRequired(startTimeInput, "Please choose a start time.");

    let locationValid = true;
    if (eventType === "physical") {
      const venueValid = validateRequired(venueInput, "Please enter your venue.");
      const cityValid = validateRequired(cityInput, "Please enter the city.");
      locationValid = venueValid && cityValid;
    } else {
      locationValid = validateRequired(eventLinkInput, "Please add a link for your online event.");
    }

    if (!dateValid || !startValid || !locationValid) return;

    saveEventData({
      date: dateInput.value,
      startTime: startTimeInput.value,
      endTime: endTimeInput.value,
      venue: venueInput.value.trim(),
      address: addressInput.value.trim(),
      city: cityInput.value.trim(),
      eventType: eventType,
      eventLink: eventLinkInput.value.trim()
    });

    window.location.href = "event-banner.html";
  });
}

/* ==========================================================
   SCREEN 3 — event-banner.html
   ========================================================== */
function initBannerPage() {
  const uploadBox = document.getElementById("uploadBox");
  if (!uploadBox) return;

  const fileInput = document.getElementById("bannerInput");
  const previewWrap = document.getElementById("uploadPreview");
  const previewImg = document.getElementById("uploadPreviewImg");
  const removeBtn = document.getElementById("removeBannerBtn");
  const continueBtn = document.getElementById("bannerContinueBtn");

  const data = getEventData();
  let currentBanner = data.banner || "";

  function showPreview(dataUrl) {
    currentBanner = dataUrl;
    previewImg.src = dataUrl;
    previewWrap.classList.add("visible");
    uploadBox.classList.add("hidden-field");
  }

  function clearPreview() {
    currentBanner = "";
    previewImg.src = "";
    previewWrap.classList.remove("visible");
    uploadBox.classList.remove("hidden-field");
    fileInput.value = "";
  }

  if (currentBanner) {
    showPreview(currentBanner);
  }

  uploadBox.addEventListener("click", function () {
    fileInput.click();
  });

  uploadBox.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      fileInput.click();
    }
  });

  fileInput.addEventListener("change", function () {
    const file = fileInput.files && fileInput.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
      showPreview(e.target.result);
    };
    reader.readAsDataURL(file);
  });

  removeBtn.addEventListener("click", function (e) {
    e.stopPropagation();
    clearPreview();
  });

  continueBtn.addEventListener("click", function () {
    try {
      saveEventData({ banner: currentBanner });
    } catch (e) {
      // If the image is too large for localStorage, continue without
      // blocking the prototype flow.
      console.warn("Banner could not be saved:", e);
    }
    window.location.href = "event-tickets.html";
  });
}

/* ==========================================================
   SCREEN 4 — event-tickets.html
   ========================================================== */
function initTicketsPage() {
  const form = document.getElementById("ticketsForm");
  if (!form) return;

  const data = getEventData();

  const typeCards = document.querySelectorAll(".ticket-type-card");
  const paidFields = document.getElementById("paidFields");
  const ticketNameInput = document.getElementById("ticketName");
  const ticketPriceInput = document.getElementById("ticketPrice");
  const ticketQuantityInput = document.getElementById("ticketQuantity");

  ticketNameInput.value = data.ticketName || "";
  ticketPriceInput.value = data.ticketPrice || "";
  ticketQuantityInput.value = data.ticketQuantity || "";

  let ticketType = data.ticketType || "free";

  function applyTicketType(type) {
    ticketType = type;
    typeCards.forEach(function (card) {
      card.classList.toggle("selected", card.dataset.type === type);
    });
    if (type === "paid") {
      paidFields.classList.add("visible");
    } else {
      paidFields.classList.remove("visible");
    }
  }

  typeCards.forEach(function (card) {
    card.addEventListener("click", function () {
      applyTicketType(card.dataset.type);
    });
  });

  applyTicketType(ticketType);

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    clearAllErrors(form);

    const quantityValid = validateRequired(ticketQuantityInput, "Please set the number of tickets.");
    let quantityPositive = true;
    if (quantityValid && Number(ticketQuantityInput.value) <= 0) {
      showFieldError(ticketQuantityInput.closest(".field"), "Ticket quantity must be more than zero.");
      quantityPositive = false;
    }

    let priceValid = true;
    if (ticketType === "paid") {
      priceValid = validateRequired(ticketPriceInput, "Please enter a ticket price.");
      if (priceValid && Number(ticketPriceInput.value) <= 0) {
        showFieldError(ticketPriceInput.closest(".field"), "Price must be more than zero for a paid event.");
        priceValid = false;
      }
    }

    if (!quantityValid || !quantityPositive || !priceValid) return;

    saveEventData({
      ticketType: ticketType,
      ticketName: ticketNameInput.value.trim(),
      ticketPrice: ticketType === "paid" ? Number(ticketPriceInput.value) : 0,
      ticketQuantity: Number(ticketQuantityInput.value)
    });

    window.location.href = "event-review.html";
  });
}

/* ==========================================================
   REVIEW / PUBLISH — event-review.html
   ========================================================== */
function formatDate(dateStr) {
  if (!dateStr) return "Not set";
  const parts = dateStr.split("-");
  if (parts.length !== 3) return dateStr;
  const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  return d.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}

function formatTimeRange(start, end) {
  if (!start && !end) return "Not set";
  if (start && end) return start + " – " + end;
  return start || end;
}

function formatPrice(type, price) {
  if (type !== "paid") return "Free";
  const amount = Number(price) || 0;
  return "\u20A6" + amount.toLocaleString();
}

/* Builds a shareable URL for event-public.html with the event's details
   encoded as query parameters. The banner image is intentionally left
   out — it is a large Base64 string that would make the link unusably
   long or break entirely in most apps/browsers. */
function buildShareUrl(data) {
  const params = new URLSearchParams();
  const fields = [
    "name", "category", "description", "date", "startTime", "endTime",
    "eventType", "venue", "address", "city", "eventLink",
    "ticketType", "ticketName", "ticketPrice", "ticketQuantity"
  ];
  fields.forEach(function (key) {
    const value = data[key];
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, value);
    }
  });

  const url = new URL("event-public.html", window.location.href);
  url.search = params.toString();
  return url.toString();
}

function copyToClipboard(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text);
  }
  // Fallback for browsers/contexts without the Clipboard API.
  return new Promise(function (resolve, reject) {
    const tempInput = document.createElement("textarea");
    tempInput.value = text;
    tempInput.style.position = "fixed";
    tempInput.style.opacity = "0";
    document.body.appendChild(tempInput);
    tempInput.focus();
    tempInput.select();
    try {
      document.execCommand("copy");
      resolve();
    } catch (e) {
      reject(e);
    } finally {
      document.body.removeChild(tempInput);
    }
  });
}

function loadReview() {
  const container = document.getElementById("reviewCard");
  if (!container) return;

  const data = getEventData();

  const bannerEl = document.getElementById("reviewBanner");
  if (data.banner) {
    bannerEl.src = data.banner;
  } else {
    bannerEl.remove();
  }

  document.getElementById("reviewName").textContent = data.name || "Untitled event";
  document.getElementById("reviewCategory").textContent = data.category || "Uncategorized";
  document.getElementById("reviewDescription").textContent =
    data.description || "No description added yet.";

  document.getElementById("reviewDate").textContent = formatDate(data.date);
  document.getElementById("reviewTimeRange").textContent = formatTimeRange(data.startTime, data.endTime);

  const isOnline = data.eventType === "online";
  document.getElementById("reviewType").textContent = isOnline ? "Online Event" : "Physical Event";

  const venueRow = document.getElementById("venueRow");
  const addressRow = document.getElementById("addressRow");
  const linkRow = document.getElementById("linkRow");

  if (isOnline) {
    venueRow.classList.add("hidden-field");
    addressRow.classList.add("hidden-field");
    linkRow.classList.remove("hidden-field");
    document.getElementById("reviewLink").textContent = data.eventLink || "Not set";
  } else {
    linkRow.classList.add("hidden-field");
    venueRow.classList.remove("hidden-field");
    addressRow.classList.remove("hidden-field");
    document.getElementById("reviewVenue").textContent = data.venue || "Not set";
    const addressParts = [data.address, data.city].filter(Boolean).join(", ");
    document.getElementById("reviewAddress").textContent = addressParts || "Not set";
  }

  document.getElementById("reviewTicketType").textContent =
    data.ticketType === "paid" ? (data.ticketName || "Paid ticket") : (data.ticketName || "Free ticket");
  document.getElementById("reviewTicketPrice").textContent = formatPrice(data.ticketType, data.ticketPrice);
  document.getElementById("reviewTicketQuantity").textContent = data.ticketQuantity || "0";
}

function publishEvent() {
  const data = saveEventData({ published: true });

  document.getElementById("reviewPage").classList.add("hidden-field");
  const successPage = document.getElementById("successPage");
  successPage.classList.remove("hidden-field");

  const successSubtitle = document.getElementById("successSubtitle");
  if (successSubtitle) {
    successSubtitle.textContent = (data.name || "Your event") + " is now live.";
  }
}

function initReviewPage() {
  const publishBtn = document.getElementById("publishBtn");
  if (!publishBtn) return;

  loadReview();

  publishBtn.addEventListener("click", publishEvent);

  const viewEventBtn = document.getElementById("viewEventBtn");
  if (viewEventBtn) {
    viewEventBtn.addEventListener("click", function () {
      window.location.href = "event-public.html";
    });
  }

  const copyLinkBtn = document.getElementById("copyLinkBtn");
  if (copyLinkBtn) {
    copyLinkBtn.addEventListener("click", function () {
      const data = getEventData();
      const shareUrl = buildShareUrl(data);
      const feedback = document.getElementById("copyLinkFeedback");

      copyToClipboard(shareUrl)
        .then(function () {
          if (feedback) feedback.textContent = "Link copied!";
        })
        .catch(function () {
          if (feedback) feedback.textContent = "Could not copy — link: " + shareUrl;
        });
    });
  }
}

/* ==========================================================
   PUBLIC VIEW — event-public.html
   ========================================================== */
/* Reads event data encoded in the URL by a shared link.
   Returns null if the URL has no shared event data. */
function getSharedDataFromUrl() {
  const params = new URLSearchParams(window.location.search);
  if (!params.has("name")) return null;

  return Object.assign(defaultEventData(), {
    name: params.get("name") || "",
    category: params.get("category") || "",
    description: params.get("description") || "",
    date: params.get("date") || "",
    startTime: params.get("startTime") || "",
    endTime: params.get("endTime") || "",
    eventType: params.get("eventType") || "physical",
    venue: params.get("venue") || "",
    address: params.get("address") || "",
    city: params.get("city") || "",
    eventLink: params.get("eventLink") || "",
    ticketType: params.get("ticketType") || "free",
    ticketName: params.get("ticketName") || "",
    ticketPrice: params.get("ticketPrice") || 0,
    ticketQuantity: params.get("ticketQuantity") || 0,
    banner: "",
    published: true
  });
}

function initPublicPage() {
  const card = document.getElementById("publicEventCard");
  if (!card) return;

  const sharedData = getSharedDataFromUrl();
  const data = sharedData || getEventData();
  const noEventState = document.getElementById("noEventState");
  const sharedNotice = document.getElementById("sharedNotice");

  if (!sharedData && !data.published) {
    card.classList.add("hidden-field");
    noEventState.classList.remove("hidden-field");
    return;
  }

  if (sharedData && sharedNotice) {
    sharedNotice.classList.remove("hidden-field");
  }

  const bannerEl = document.getElementById("publicBanner");
  if (data.banner) {
    bannerEl.src = data.banner;
  } else {
    bannerEl.remove();
  }

  document.getElementById("publicName").textContent = data.name || "Untitled event";
  document.getElementById("publicCategory").textContent = data.category || "Uncategorized";
  document.getElementById("publicDescription").textContent =
    data.description || "No description added yet.";

  document.getElementById("publicDate").textContent = formatDate(data.date);
  document.getElementById("publicTimeRange").textContent = formatTimeRange(data.startTime, data.endTime);

  const isOnline = data.eventType === "online";
  document.getElementById("publicType").textContent = isOnline ? "Online Event" : "Physical Event";

  const venueRow = document.getElementById("publicVenueRow");
  const addressRow = document.getElementById("publicAddressRow");
  const linkRow = document.getElementById("publicLinkRow");

  if (isOnline) {
    venueRow.classList.add("hidden-field");
    addressRow.classList.add("hidden-field");
    linkRow.classList.remove("hidden-field");
    document.getElementById("publicLink").textContent = data.eventLink || "Not set";
  } else {
    linkRow.classList.add("hidden-field");
    venueRow.classList.remove("hidden-field");
    addressRow.classList.remove("hidden-field");
    document.getElementById("publicVenue").textContent = data.venue || "Not set";
    const addressParts = [data.address, data.city].filter(Boolean).join(", ");
    document.getElementById("publicAddress").textContent = addressParts || "Not set";
  }

  document.getElementById("publicTicketType").textContent =
    data.ticketType === "paid" ? (data.ticketName || "Paid ticket") : (data.ticketName || "Free ticket");
  document.getElementById("publicTicketPrice").textContent = formatPrice(data.ticketType, data.ticketPrice);
  document.getElementById("publicTicketQuantity").textContent = data.ticketQuantity || "0";
}

/* ---------- Run the init that matches the current page ---------- */
document.addEventListener("DOMContentLoaded", function () {
  initDetailsPage();
  initLocationPage();
  initBannerPage();
  initTicketsPage();
  initReviewPage();
  initPublicPage();
});