const ICON_TRASH_SMALL = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`;

export function createMessageBubble({ store, chatService }) {
  return function renderMessageBubble(message, { mine, avatarUrl, onDelete }) {
    const chatDiv = document.createElement("div");
    chatDiv.className = "chat " + (mine?"chat-right":"chat-left");
    const avatar = !mine ? '<div class="chat-avatar"><a href="javascript:void(0)" class="avatar"><img alt="" src="' + (avatarUrl||'https://i.pravatar.cc/100') + '" class="img-fluid rounded-circle"></a></div>' : "";
    const deletedText = message.deleted ? "Message deleted" : message.content;
    const time = new Date(message.timestamp).toLocaleTimeString([], {hour:"2-digit", minute:"2-digit"});
    const delBtn = mine && !message.deleted && message.type==="text" ? '<a href="javascript:void(0)" class="text-danger ml-2 btn-delete" style="font-size:10px; display:inline-flex; align-items:center; gap:4px;">' + ICON_TRASH_SMALL + ' Delete</a>' : "";
    chatDiv.innerHTML = avatar + '<div class="chat-body"><div class="chat-bubble" style="' + (message.deleted?'background:#f1f1f1 !important; border:1px dashed #ccc !important; font-style:italic; color:#999 !important;':'') + '"><div class="chat-content"><p style="margin:0;">' + deletedText + '</p><span class="chat-time" style="font-size:10px;">' + time + ' ' + delBtn + '</span></div></div></div>';
    const btn = chatDiv.querySelector(".btn-delete");
    if(btn){
      btn.addEventListener("click", async ()=>{
        if(!confirm("Delete this message?")) return;
        try{
          await chatService.deleteMessage(message.id);
          store.publish("messages:changed", {conversationId: message.conversationId});
          if(onDelete) onDelete();
        }catch(e){ alert(e.message); }
      });
    }
    return chatDiv;
  };
}
