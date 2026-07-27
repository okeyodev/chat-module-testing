const KEY="studyPod_conversations";const MSG_KEY="studyPod_messages";
function read(){try{return JSON.parse(localStorage.getItem(KEY)||"[]")}catch{return[]}}
function write(arr){localStorage.setItem(KEY, JSON.stringify(arr))}
function readMessages(){try{return JSON.parse(localStorage.getItem(MSG_KEY)||"[]")}catch{return[]}}
function writeMessages(arr){localStorage.setItem(MSG_KEY, JSON.stringify(arr))}
export const ConversationService = {
  listConversations(userId,role){
    const all=read();
    const filtered=all.filter((c)=>role==="tutor"?c.tutorId===userId:c.studentId===userId);
    filtered.sort((a,b)=>new Date(b.lastMessageAt)-new Date(a.lastMessageAt));
    return Promise.resolve(filtered);
  },
  getConversation(id){return Promise.resolve(read().find((c)=>c.id===id)||null)},
  deleteConversation(id){
    write(read().filter((c)=>c.id!==id));
    writeMessages(readMessages().filter((m)=>m.conversationId!==id));
    return Promise.resolve(true);
  },
  clearUnread(conversationId,viewerRole){
    const all=read(); const idx=all.findIndex((c)=>c.id===conversationId);
    if(idx===-1) return Promise.resolve(null);
    if(viewerRole==="tutor") all[idx].unreadCountForTutor=0; else all[idx].unreadCountForStudent=0;
    write(all); return Promise.resolve(all[idx]);
  },
  _read(){return read()}
};
