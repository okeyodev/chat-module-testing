/**
 * StudyPod LeftNav - No Preclinic - Modern + SVG + No Count + Glossy Summary
 */
const ICON_COLLAPSE = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line><polyline points="14 9 10 12 14 15"></polyline></svg>`;
const ICON_EXPAND = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line><polyline points="10 9 14 12 10 15"></polyline></svg>`;
const ICON_TRASH_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>`;
const ICON_PLUS_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`;

export function createLeftNav({ store, conversationService, profileService, offerService }) {
  let container = null;
  let conversations = [];
  let profilesMap = new Map();
  let offerSummary = { byConversation: {}, counts: { pending: 0, accepted: 0, rejected: 0 } };

  function timeAgo(iso) {
    if (!iso) return "";
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "now";
    if (mins < 60) return mins + "m";
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return hrs + "h";
    const days = Math.floor(hrs / 24);
    if (days < 7) return days + "d";
    return Math.floor(days / 7) + "w";
  }

  async function refresh() {
    const state = store.getState();
    if (!state.currentUserId) return;
    conversations = await conversationService.listConversations(state.currentUserId, state.currentRole);
    const ids = conversations.map((c) => state.currentRole === "tutor" ? c.studentId : c.tutorId);
    const unique = [...new Set(ids)];
    const profs = await Promise.all(unique.map((id) => profileService.getProfile(id)));
    profilesMap = new Map(profs.filter(Boolean).map((p) => [p.id, p]));
    const convIds = conversations.map((c) => c.id);
    if (convIds.length) {
      try { offerSummary = await offerService.getOfferSummary(convIds); } catch (e) {
        offerSummary = { byConversation: {}, counts: { pending: 0, accepted: 0, rejected: 0 } };
      }
    } else {
      offerSummary = { byConversation: {}, counts: { pending: 0, accepted: 0, rejected: 0 } };
    }
    render();
  }

  function closeMobileLeft() {
    const wrapper = document.querySelector(".main-wrapper");
    const overlay = document.querySelector(".sidebar-overlay");
    if (wrapper) wrapper.classList.remove("slide-nav");
    if (overlay) overlay.classList.remove("opened");
    document.body.classList.remove("menu-opened");
    document.documentElement.classList.remove("menu-opened");
  }

  function render() {
    if (!container) return;
    const state = store.getState();
    container.innerHTML = "";

    const header = document.createElement("div");
    header.className = "sp-left-header";
    const isMini = document.body.classList.contains("mini-sidebar");
    header.innerHTML = '<div class="sp-left-top"><div class="sp-left-title"><span class="sp-title-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#009efb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a4 4 0 0 1-4 4H7l-4 4V5a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"/></svg></span><span>Messages</span></div><button class="sp-collapse-toggle" id="spCollapseToggle" title="' + (isMini ? "Expand sidebar" : "Collapse sidebar") + '" aria-label="Toggle sidebar">' + (isMini ? ICON_EXPAND : ICON_COLLAPSE) + '</button></div>';
    container.appendChild(header);

    const directTitle = document.createElement("div");
    directTitle.className = "sp-section-title";
    directTitle.innerHTML = '<span style="display:flex; align-items:center; gap:6px;"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> Direct Chats</span>';
    container.appendChild(directTitle);

    const directWrap = document.createElement("div");
    directWrap.className = "sp-direct-wrap";

    const summary = document.createElement("div");
    summary.className = "sp-offer-summary";
    summary.innerHTML = '<div><span class="dot pending"></span>Pending: <strong>' + (offerSummary.counts.pending || 0) + '</strong></div><div><span class="dot accepted"></span>Accepted: <strong>' + (offerSummary.counts.accepted || 0) + '</strong></div><div><span class="dot rejected"></span>Rejected: <strong>' + (offerSummary.counts.rejected || 0) + '</strong></div>';
    directWrap.appendChild(summary);

    const list = document.createElement("div");
    list.className = "sp-conv-list";

    if (conversations.length === 0) {
      const empty = document.createElement("div");
      empty.style.cssText = "text-align:center; padding:28px 16px; color:#94a3b8; font-size:13px;";
      empty.innerHTML = '<div style="width:48px;height:48px;border-radius:12px;background:#f1f5f9;display:flex;align-items:center;justify-content:center;margin:0 auto 12px;color:#94a3b8;"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a4 4 0 0 1-4 4H7l-4 4V5a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"/></svg></div><div style="font-weight:600;color:#475569;margin-bottom:4px;">No conversations yet</div><div style="font-size:12px;">Your chats will appear here</div>';
      list.appendChild(empty);
    } else {
      conversations.forEach((conv) => {
        const otherId = state.currentRole === "tutor" ? conv.studentId : conv.tutorId;
        const profile = profilesMap.get(otherId);
        const isActive = state.activeConversationId === conv.id;
        const unread = state.currentRole === "tutor" ? conv.unreadCountForTutor : conv.unreadCountForStudent;
        const offerStatus = offerSummary.byConversation[conv.id] || null;

        const item = document.createElement("div");
        item.className = "sp-conv-item " + (isActive ? "active" : "");
        item.title = profile?.name || otherId;

        const online = profile?.online;
        const previewText = profile ? (state.currentRole === "tutor" ? (profile.subject || profile.school || "Student") : (profile.specialty || "Tutor")) : "";

        item.innerHTML = '<div class="sp-avatar-wrap"><img src="' + (profile?.profilePicUrl || "https://i.pravatar.cc/100") + '" alt="' + (profile?.name || otherId) + '" loading="lazy"><span class="sp-online-dot ' + (online ? "online" : "offline") + '"></span></div><div class="sp-conv-meta"><div class="sp-conv-name-row"><div class="sp-conv-name">' + (profile?.name || otherId) + '</div><div class="sp-conv-time">' + timeAgo(conv.lastMessageAt) + '</div></div><div class="sp-conv-preview">' + previewText + '</div></div><div class="sp-conv-right">' + (offerStatus ? '<span class="sp-offer-dot ' + offerStatus + '" title="' + offerStatus + '"></span>' : "") + (unread > 0 ? '<span class="sp-badge">' + (unread > 99 ? "99+" : unread) + '</span>' : "") + '</div><button class="sp-conv-delete" title="Delete conversation" aria-label="Delete">' + ICON_TRASH_SVG + '</button>';

        item.addEventListener("click", async (e) => {
          if (e.target.closest(".sp-conv-delete")) return;
          store.setState({ activeConversationId: conv.id });
          store.publish("activeConversation:changed", conv);
          await conversationService.clearUnread(conv.id, state.currentRole);
          store.publish("conversations:changed", null);
          if (window.innerWidth <= 991) closeMobileLeft();
        });

        const delBtn = item.querySelector(".sp-conv-delete");
        delBtn.addEventListener("click", async (e) => {
          e.stopPropagation();
          if (!confirm("Delete conversation with " + (profile?.name || otherId) + "?")) return;
          await conversationService.deleteConversation(conv.id);
          store.publish("conversations:changed", null);
          const currentState = store.getState();
          if (currentState.activeConversationId === conv.id) {
            const fresh = await conversationService.listConversations(currentState.currentUserId, currentState.currentRole);
            if (fresh.length) {
              store.setState({ activeConversationId: fresh[0].id });
              store.publish("activeConversation:changed", fresh[0]);
            } else {
              store.setState({ activeConversationId: null });
              store.publish("activeConversation:changed", null);
            }
          }
        });

        list.appendChild(item);
      });
    }

    directWrap.appendChild(list);
    container.appendChild(directWrap);

    const groupsTitle = document.createElement("div");
    groupsTitle.className = "sp-section-title";
    groupsTitle.style.marginTop = "4px";
    groupsTitle.innerHTML = '<span style="display:flex; align-items:center; gap:6px;"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> Chat Groups</span><button class="sp-add-btn" title="New group" aria-label="Create group">' + ICON_PLUS_SVG + '</button>';
    container.appendChild(groupsTitle);

    const groupsList = document.createElement("div");
    groupsList.className = "sp-conv-list";
    groupsList.style.flex = "0 0 auto";
    groupsList.style.paddingBottom = "16px";
    groupsList.innerHTML = '<div class="sp-conv-item sp-group-item"><div class="sp-group-icon" style="background:#eef6ff; color:#009efb;"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="3"/><path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/><path d="M16 11h2a2 2 0 0 1 2 2v3"/><circle cx="18" cy="8" r="2"/></svg></div><div class="sp-conv-meta"><div class="sp-conv-name">Calculus Study Group</div><div class="sp-conv-preview">12 members • 3 online</div></div></div><div class="sp-conv-item sp-group-item"><div class="sp-group-icon" style="background:#fef3c7; color:#d97706;"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3 7h7l-5.5 4 2 7L12 16l-6.5 4 2-7L2 9h7z"/></svg></div><div class="sp-conv-meta"><div class="sp-conv-name">Physics Tutors</div><div class="sp-conv-preview">8 members • 1 online</div></div></div>';
    container.appendChild(groupsList);

    const toggleBtn = container.querySelector("#spCollapseToggle");
    if (toggleBtn) {
      toggleBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (window.innerWidth <= 991) return;
        document.body.classList.toggle("mini-sidebar");
        const nowMini = document.body.classList.contains("mini-sidebar");
        toggleBtn.innerHTML = nowMini ? ICON_EXPAND : ICON_COLLAPSE;
        toggleBtn.title = nowMini ? "Expand sidebar" : "Collapse sidebar";
        store.setState({ leftCollapsed: nowMini });
        window.dispatchEvent(new Event("resize"));
      });
    }

    const addGroupBtn = container.querySelector(".sp-add-btn");
    if (addGroupBtn) {
      addGroupBtn.addEventListener("click", () => { alert("Create new group - Coming soon"); });
    }
  }

  return {
    mount(el) {
      container = el;
      const dupToggle = document.getElementById("toggle_btn");
      if (dupToggle) dupToggle.style.display = "none";
      store.subscribe("conversations:changed", refresh);
      store.subscribe("offers:changed", refresh);
      store.subscribe("messages:changed", refresh);
      store.subscribe("activeConversation:changed", () => render());
      refresh();
    },
    refresh,
  };
}
