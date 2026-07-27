import { CURRENCIES } from "./OfferForm.js";
const ICON_CHECK = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
const ICON_X = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
const ICON_EDIT = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>`;

export function createOfferCard({ store, offerService }) {
  return async function renderOfferCard(message, { mine, avatarUrl, currentRole, onUpdate }) {
    const chatDiv = document.createElement("div");
    chatDiv.className = "chat " + (mine ? "chat-right" : "chat-left");
    const avatar = !mine ? '<div class="chat-avatar"><a href="javascript:void(0)" class="avatar"><img alt="" src="' + (avatarUrl || "https://i.pravatar.cc/100") + '" class="img-fluid rounded-circle"></a></div>' : "";
    let offer = null;
    try { offer = await offerService.getOffer(message.content); } catch {}
    if (!offer) {
      chatDiv.innerHTML = avatar + '<div class="chat-body"><div class="chat-bubble"><div class="chat-content">Offer not found</div></div></div>';
      return chatDiv;
    }
    const symbol = CURRENCIES.find((c) => c.code === offer.currency)?.symbol || offer.currency || "$";
    const time = new Date(offer.createdAt).toLocaleString();
    let actions = "";
    if (offer.status === "pending") {
      if (currentRole === "student") {
        actions = '<div class="mt-2 d-flex gap-2"><button class="btn btn-success btn-sm btn-accept mr-1" style="display:inline-flex; align-items:center; gap:6px; border-radius:9px;">' + ICON_CHECK + ' Accept</button><button class="btn btn-outline-danger btn-sm btn-reject" style="display:inline-flex; align-items:center; gap:6px; border-radius:9px;">' + ICON_X + ' Reject</button></div>';
      } else if (currentRole === "tutor" && mine) {
        actions = '<div class="mt-2"><button class="btn btn-light btn-sm btn-edit" style="display:inline-flex; align-items:center; gap:6px; border-radius:9px; border:1px solid #e2e8f0;">' + ICON_EDIT + ' Edit Offer</button></div>';
      }
    }
    chatDiv.innerHTML = avatar + '<div class="chat-body"><div class="chat-bubble" style="background:#fff; border:1px solid #009efb; min-width:360px; max-width:480px; width:100%; border-radius:16px; box-shadow:0 8px 24px rgba(15,23,42,0.08), 0 2px 8px rgba(0,158,251,0.12); backdrop-filter: blur(4px);"><div class="chat-content" style="width:100%;"><div class="d-flex justify-content-between align-items-center mb-2"><strong style="font-size:14px; color:#0f172a; display:flex; align-items:center; gap:8px;"><span style="width:28px;height:28px;border-radius:8px;background:#e8f3ff;color:#009efb;display:flex;align-items:center;justify-content:center;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3 7h7l-5.5 4 2 7L12 16l-6.5 4 2-7L2 9h7z"/></svg></span>' + offer.courseTitle + '</strong><span class="badge ' + (offer.status === "pending" ? "badge-warning" : offer.status === "accepted" ? "badge-success" : "badge-danger") + '" style="text-transform:uppercase; font-size:10px; display:inline-flex; align-items:center; gap:4px;">' + offer.status + '</span></div><p class="text-muted" style="font-size:13px; margin-bottom:10px; color:#475569 !important; line-height:1.4;">' + (offer.summary || "") + '</p><div style="font-size:12.5px; color:#334155;"><div class="d-flex justify-content-between mb-1"><span class="text-muted">Dates</span><span><strong style="color:#0f172a;">' + offer.startDate + ' → ' + offer.endDate + '</strong></span></div><div class="d-flex justify-content-between mb-1"><span class="text-muted">Time</span><span style="color:#0f172a;">' + offer.time + '</span></div><div class="d-flex justify-content-between"><span class="text-muted">Amount</span><span><strong style="color:#009efb;">' + symbol + offer.amount + ' ' + offer.currency + '</strong></span></div></div><div style="font-size:10px; color:#94a3b8; margin-top:8px;">' + time + ' ' + (offer.editedAt ? '<span class="badge badge-light ml-1">Edited</span>' : "") + '</div>' + actions + '</div></div><div class="chat-time" style="font-size:10px;">' + new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) + '</div></div>';
    const acceptBtn = chatDiv.querySelector(".btn-accept");
    const rejectBtn = chatDiv.querySelector(".btn-reject");
    const editBtn = chatDiv.querySelector(".btn-edit");
    if (acceptBtn) { acceptBtn.addEventListener("click", async () => { await offerService.acceptOffer(offer.id); store.publish("offers:changed", { conversationId: offer.conversationId }); if (onUpdate) onUpdate(); }); }
    if (rejectBtn) { rejectBtn.addEventListener("click", async () => { await offerService.rejectOffer(offer.id); store.publish("offers:changed", { conversationId: offer.conversationId }); if (onUpdate) onUpdate(); }); }
    if (editBtn) { editBtn.addEventListener("click", () => { store.publish("ui:editOffer", offer); }); }
    return chatDiv;
  };
}
