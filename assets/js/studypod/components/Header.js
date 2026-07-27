const ICON_PANEL_RIGHT_CLOSE = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="15" y1="3" x2="15" y2="21"></line><polyline points="8 9 12 12 8 15"></polyline></svg>`;
const ICON_PANEL_RIGHT_OPEN = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="15" y1="3" x2="15" y2="21"></line><polyline points="11 9 15 12 11 15"></polyline></svg>`;

export function createHeader({ store, profileService }) {
  let otherProfile = null;
  let activeConv = null;
  function formatOffline(lastOfflineAt){
    if(!lastOfflineAt) return "Offline";
    const diff = Date.now() - new Date(lastOfflineAt).getTime();
    const mins = Math.floor(diff/60000);
    if(mins<1) return "Offline \u00b7 just now";
    if(mins<60) return "Offline \u00b7 " + mins + "m ago";
    const hrs = Math.floor(mins/60);
    if(hrs<24) return "Offline \u00b7 " + hrs + "h ago";
    return "Offline \u00b7 " + Math.floor(hrs/24) + "d ago";
  }
  function render(){
    const nameEl = document.getElementById("chatHeaderName");
    const statusEl = document.getElementById("chatHeaderStatus");
    const imgEl = document.getElementById("chatHeaderImg");
    const dotEl = document.getElementById("chatHeaderDot");
    if(!nameEl) return;
    if(!otherProfile){
      nameEl.textContent = "Select a conversation";
      if(statusEl) statusEl.textContent = "";
      return;
    }
    nameEl.textContent = otherProfile.name;
    if(imgEl) imgEl.src = otherProfile.profilePicUrl;
    if(statusEl) statusEl.textContent = otherProfile.online ? "Online" : formatOffline(otherProfile.lastOfflineAt);
    if(dotEl){
      dotEl.className = otherProfile.online ? "status online" : "status offline";
      dotEl.style.background = otherProfile.online ? "#55ce63" : "#ccc";
    }
  }
  async function updateActiveConversation(conv){
    activeConv = conv;
    if(!conv){ otherProfile=null; render(); return; }
    const state = store.getState();
    const otherId = state.currentRole==="tutor"? conv.studentId : conv.tutorId;
    otherProfile = await profileService.getProfile(otherId);
    render();
  }
  function setupRightToggle(){
    const btn = document.getElementById("rightCollapseToggle");
    const rightPanel = document.getElementById("rightPanelRoot");
    if(!btn || !rightPanel) return;
    btn.innerHTML = rightPanel.classList.contains("collapsed") ? ICON_PANEL_RIGHT_OPEN : ICON_PANEL_RIGHT_CLOSE;
    btn.onclick = (e)=>{
      e.preventDefault();
      const isCollapsed = rightPanel.classList.contains("collapsed");
      if(isCollapsed){
        rightPanel.classList.remove("collapsed");
        btn.innerHTML = ICON_PANEL_RIGHT_CLOSE;
        btn.title = "Hide details";
        store.setState({ rightCollapsed: false });
      } else {
        rightPanel.classList.add("collapsed");
        btn.innerHTML = ICON_PANEL_RIGHT_OPEN;
        btn.title = "Show details";
        store.setState({ rightCollapsed: true });
      }
    };
  }
  return {
    mount(){
      store.subscribe("activeConversation:changed", (conv)=> updateActiveConversation(conv));
      store.subscribe("profiles:changed", ()=>{ if(activeConv) updateActiveConversation(activeConv); });
      render();
      setupRightToggle();
      setTimeout(setupRightToggle, 100);
    }
  };
}
