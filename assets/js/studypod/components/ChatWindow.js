import { createMessageBubble } from "./MessageBubble.js";
import { createOfferCard } from "./OfferCard.js";

const ICON_SPARKLE = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z"></path></svg>`;
const ICON_EDIT = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>`;

export function createChatWindow({ store, chatService, offerService, conversationService, profileService, fileService }) {
  let container = null;
  let messages = [];
  let activeConv = null;
  let otherProfile = null;
  let pendingOffer = null;
  const bubbleRenderer = createMessageBubble({ store, chatService });
  const offerRenderer = createOfferCard({ store, offerService, profileService });

  function render() {
    if (!container) return;
    const chatsBox = container.querySelector(".chats");
    if (!chatsBox) return;
    chatsBox.innerHTML = "";
    if (!activeConv) {
      chatsBox.innerHTML = '<div class="text-center p-5 text-muted"><h5>No conversation selected</h5><p>Choose from left panel</p></div>';
      return;
    }
    const state = store.getState();
    if (state.currentRole === "tutor") {
      const bar = document.createElement("div");
      bar.className = "offer-action-bar mb-3 p-2 d-flex align-items-center";
      if (pendingOffer) {
        bar.innerHTML = '<button class="btn btn-primary btn-sm mr-2 btn-edit-pending" style="border-radius:10px;">' + ICON_EDIT + ' Edit pending offer</button><small class="text-muted" style="display:flex; align-items:center; gap:6px;"><span style="width:6px;height:6px;background:#d97706;border-radius:50%;display:inline-block;"></span>You have a pending offer</small>';
        bar.querySelector(".btn-edit-pending").addEventListener("click", function () { store.publish("ui:editOffer", pendingOffer); });
      } else {
        bar.innerHTML = '<button class="btn btn-primary btn-sm btn-create-offer" style="border-radius:10px; background:#009efb; border-color:#009efb;">' + ICON_SPARKLE + ' Create custom offer</button>';
        bar.querySelector(".btn-create-offer").addEventListener("click", function () { store.publish("ui:createOffer", { conversation: activeConv }); });
      }
      chatsBox.appendChild(bar);
    }
    if (messages.length === 0) {
      const empty = document.createElement("div");
      empty.className = "text-center p-4 text-muted";
      empty.innerHTML = "<p>No messages yet. Start with a friendly hello.</p>";
      chatsBox.appendChild(empty);
    } else {
      for (let i = 0; i < messages.length; i++) {
        const msg = messages[i];
        const placeholder = document.createElement("div");
        chatsBox.appendChild(placeholder);
        renderSingleMessage(msg, placeholder);
      }
    }
    setTimeout(function () { container.scrollTop = container.scrollHeight; }, 50);
  }

  async function renderSingleMessage(msg, placeholder) {
    const state = store.getState();
    const mine = msg.senderId === state.currentUserId;
    let avatarUrl = null;
    try {
      const p = await profileService.getProfile(mine ? state.currentUserId : otherProfile ? otherProfile.id : null);
      avatarUrl = p ? p.profilePicUrl : otherProfile ? otherProfile.profilePicUrl : null;
    } catch {}
    let node;
    if (msg.type === "offer") {
      node = await offerRenderer(msg, { mine: mine, avatarUrl: avatarUrl, currentRole: state.currentRole, onUpdate: async function () { await refreshMessages(); store.publish("conversations:changed", null); } });
    } else if (msg.type === "file") {
      let file = null;
      try { if (fileService) file = await fileService.getFile(msg.content); } catch {}
      const time = new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      const chatDiv = document.createElement("div");
      chatDiv.className = "chat " + (mine ? "chat-right" : "chat-left");
      const avatar = !mine ? '<div class="chat-avatar"><a class="avatar"><img src="' + (avatarUrl || "https://i.pravatar.cc/100") + '" class="img-fluid rounded-circle" style="border-radius:10px;"></a></div>' : "";
      if (file) {
        const isImage = file.fileType && file.fileType.startsWith("image/");
        let fileContent = "";
        if (isImage) {
          fileContent = '<div style="border-radius:10px; overflow:hidden; max-width:280px;"><img src="' + file.dataUrl + '" style="max-width:100%; display:block;" alt="' + file.fileName + '"><div style="padding:8px 10px; background:#fff; font-size:12px; display:flex; justify-content:space-between;"><span style="max-width:160px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">' + file.fileName + '</span><a href="' + file.dataUrl + '" download="' + file.fileName + '" style="color:#009efb; font-weight:600;">Download</a></div></div>';
        } else {
          fileContent = '<div style="display:flex; align-items:center; gap:12px; background:#fff; border:1px solid #e2e8f0; border-radius:12px; padding:12px 14px; min-width:260px; max-width:360px;"><div style="width:40px;height:40px;border-radius:10px;background:#eef6ff; color:#009efb; display:flex; align-items:center; justify-content:center;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg></div><div style="flex:1;"><div style="font-size:13px; font-weight:600;">' + file.fileName + '</div><div style="font-size:11px; color:#94a3b8;">' + (file.fileSize / 1024).toFixed(1) + ' KB</div></div><a href="' + file.dataUrl + '" download="' + file.fileName + '" style="width:32px;height:32px;border-radius:8px;background:#009efb; color:#fff; display:flex; align-items:center; justify-content:center;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg></a></div>';
        }
        chatDiv.innerHTML = avatar + '<div class="chat-body"><div class="chat-bubble" style="background:transparent !important; border:none !important; box-shadow:none !important; padding:0 !important;">' + fileContent + '<div class="chat-time" style="font-size:10px; margin-top:6px; color:#94a3b8;">' + time + "</div></div></div>";
      } else {
        chatDiv.innerHTML = avatar + '<div class="chat-body"><div class="chat-bubble" style="background:#fff; border:1px solid #e2e8f0;"><div class="chat-content">File not found</div></div></div>';
      }
      node = chatDiv;
    } else {
      node = bubbleRenderer(msg, { mine: mine, avatarUrl: avatarUrl, onDelete: refreshMessages });
    }
    placeholder.replaceWith(node);
  }

  async function refreshMessages() {
    if (!activeConv) return;
    messages = await chatService.getMessages(activeConv.id);
    const offers = await offerService.getOffersByConversation(activeConv.id);
    pendingOffer = offers.find(function (o) { return o.status === "pending"; }) || null;
    const state = store.getState();
    const otherId = state.currentRole === "tutor" ? activeConv.studentId : activeConv.tutorId;
    otherProfile = await profileService.getProfile(otherId);
    render();
  }

  async function updateActive(conv) {
    activeConv = conv;
    if (!conv) { messages = []; pendingOffer = null; render(); return; }
    await refreshMessages();
  }

  return {
    mount: function (el) {
      container = el;
      store.subscribe("activeConversation:changed", function (conv) { updateActive(conv); });
      store.subscribe("messages:changed", function (p) { if (!activeConv) return; if (!p || p.conversationId === activeConv.id) refreshMessages(); });
      store.subscribe("offers:changed", function (p) { if (!activeConv) return; if (!p || p.conversationId === activeConv.id) refreshMessages(); });
      store.subscribe("files:changed", function (p) { if (!activeConv) return; if (!p || p.conversationId === activeConv.id) refreshMessages(); });
      render();
    },
  };
}
