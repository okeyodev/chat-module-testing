import { createStore } from "./state/store.js";
import { ProfileService } from "./services/ProfileService.js";
import { ConversationService } from "./services/ConversationService.js";
import { ChatService } from "./services/ChatService.js";
import { OfferService } from "./services/OfferService.js";
import { createHeader } from "./components/Header.js";
import { createLeftNav } from "./components/LeftNav.js";
import { createRightPanel } from "./components/RightPanel.js";
import { createChatWindow } from "./components/ChatWindow.js";
import { createOfferForm } from "./components/OfferForm.js";

export const DEMO_TUTOR_ID = "tutor-1";
export const DEMO_STUDENT_ID = "student-1";

function seedDemoData() {
  const profiles = [
    { id: "tutor-1", role: "tutor", name: "Dr. Sarah Chen", profilePicUrl: "https://i.pravatar.cc/150?img=32", online: true, lastOfflineAt: null, username: "sarahchen", timezone: "GMT+1 (WAT)", specialty: "Mathematics & Physics", experience: "8 years" },
    { id: "student-1", role: "student", name: "Alex Morgan", profilePicUrl: "https://i.pravatar.cc/150?img=11", online: false, lastOfflineAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), username: "alexm", timezone: "GMT+1 (WAT)", school: "Federal Univ.", subject: "Calculus" },
    { id: "student-2", role: "student", name: "Jamie Lee", profilePicUrl: "https://i.pravatar.cc/150?img=22", online: true, lastOfflineAt: null, username: "jamielee", timezone: "GMT+0", school: "Unilag", subject: "Physics" },
    { id: "student-3", role: "student", name: "Priya Patel", profilePicUrl: "https://i.pravatar.cc/150?img=26", online: false, lastOfflineAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), username: "priyap", timezone: "GMT+5:30", school: "IIT Bombay", subject: "Algebra" },
    { id: "tutor-2", role: "tutor", name: "Prof. David Kim", profilePicUrl: "https://i.pravatar.cc/150?img=12", online: true, lastOfflineAt: null, username: "davidkim", timezone: "GMT-5 (EST)", specialty: "Computer Science", experience: "12 years" },
    { id: "tutor-3", role: "tutor", name: "Emma Wilson", profilePicUrl: "https://i.pravatar.cc/150?img=16", online: false, lastOfflineAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), username: "emmaw", timezone: "GMT+1 (CET)", specialty: "English Literature", experience: "6 years" },
  ];
  const stats = [
    { userId: "tutor-1", sessionsTaught: 342, completionRate: 96 },
    { userId: "tutor-2", sessionsTaught: 210, completionRate: 89 },
    { userId: "tutor-3", sessionsTaught: 128, completionRate: 92 },
    { userId: "student-1", sessionsDone: 18 },
    { userId: "student-2", sessionsDone: 7 },
    { userId: "student-3", sessionsDone: 23 },
  ];
  const now = Date.now();
  const conversations = [
    { id: "conv-1", tutorId: "tutor-1", studentId: "student-1", lastMessageAt: new Date(now - 1000 * 60 * 5).toISOString(), unreadCountForTutor: 1, unreadCountForStudent: 0 },
    { id: "conv-2", tutorId: "tutor-1", studentId: "student-2", lastMessageAt: new Date(now - 1000 * 60 * 60 * 2).toISOString(), unreadCountForTutor: 0, unreadCountForStudent: 2 },
    { id: "conv-3", tutorId: "tutor-1", studentId: "student-3", lastMessageAt: new Date(now - 1000 * 60 * 60 * 24).toISOString(), unreadCountForTutor: 0, unreadCountForStudent: 0 },
  ];
  const offers = [
    { id: "offer-1", currency: "NGN", amount: 15000, conversationId: "conv-1", tutorId: "tutor-1", studentId: "student-1", courseTitle: "Advanced Calculus - 4 Weeks", summary: "Weekly 2hr sessions covering integrals, derivatives and exam prep.", startDate: "2026-07-28", endDate: "2026-08-25", time: "10:00 AM - 12:00 PM", status: "pending", createdAt: new Date(now - 1000 * 60 * 4).toISOString(), editedAt: null },
    { id: "offer-2", currency: "GHS", amount: 200, conversationId: "conv-2", tutorId: "tutor-1", studentId: "student-2", courseTitle: "Physics Fundamentals", summary: "Intro to mechanics and thermodynamics, 3 sessions per week.", startDate: "2026-07-20", endDate: "2026-08-10", time: "2:00 PM - 3:30 PM", status: "accepted", createdAt: new Date(now - 1000 * 60 * 60 * 1).toISOString(), editedAt: new Date(now - 1000 * 60 * 30).toISOString() },
  ];
  const messages = [
    { id: "msg-1", conversationId: "conv-1", senderId: "student-1", senderRole: "student", type: "text", content: "Hello Dr. Sarah, I need help with integrals", timestamp: new Date(now - 1000 * 60 * 60 * 1).toISOString(), deleted: false },
    { id: "msg-2", conversationId: "conv-1", senderId: "tutor-1", senderRole: "tutor", type: "text", content: "Hi Alex! Sure, I can help. Which topic specifically?", timestamp: new Date(now - 1000 * 60 * 30).toISOString(), deleted: false },
    { id: "msg-3", conversationId: "conv-1", senderId: "tutor-1", senderRole: "tutor", type: "offer", content: "offer-1", timestamp: new Date(now - 1000 * 60 * 4).toISOString(), deleted: false },
  ];
  localStorage.setItem("studyPod_profiles", JSON.stringify(profiles));
  localStorage.setItem("studyPod_stats", JSON.stringify(stats));
  localStorage.setItem("studyPod_conversations", JSON.stringify(conversations));
  localStorage.setItem("studyPod_messages", JSON.stringify(messages));
  localStorage.setItem("studyPod_offers", JSON.stringify(offers));
}

function ensureSeed() {
  const keys = ["studyPod_profiles", "studyPod_stats", "studyPod_conversations", "studyPod_messages", "studyPod_offers"];
  const missing = keys.some((k) => !localStorage.getItem(k));
  if (missing) seedDemoData();
}

// SVG icons for mobile toggles
const ICON_HAMBURGER = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>`;
const ICON_X = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
const ICON_PANEL_RIGHT = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>`;

function setupMobileDrawers() {
  const wrapper = document.querySelector(".main-wrapper");
  const leftOverlay = document.querySelector(".sidebar-overlay");
  const rightPanel = document.getElementById("rightPanelRoot");
  const rightOverlay = document.getElementById("spRightOverlay");
  const rightBtn = document.getElementById("mobile_right_btn");
  const mobileBtn = document.getElementById("mobile_btn");

  // Inject SVG into hamburger if it's still <i>
  if (mobileBtn && !mobileBtn.querySelector("svg")) {
    mobileBtn.innerHTML = ICON_HAMBURGER;
  }
  if (rightBtn && !rightBtn.querySelector("svg")) {
    rightBtn.innerHTML = ICON_PANEL_RIGHT;
  }

  function closeLeft() {
    if (wrapper) wrapper.classList.remove("slide-nav");
    if (leftOverlay) leftOverlay.classList.remove("opened");
    document.documentElement.classList.remove("menu-opened");
    document.body.classList.remove("menu-opened");
    if (mobileBtn) mobileBtn.innerHTML = ICON_HAMBURGER;
  }
  function closeRight() {
    if (rightPanel) rightPanel.classList.remove("mobile-open");
    if (rightOverlay) rightOverlay.classList.remove("open");
  }
  function closeAll() { closeLeft(); closeRight(); }

  // Toggle left via hamburger with icon swap
  if (mobileBtn) {
    mobileBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const isOpen = wrapper && wrapper.classList.contains("slide-nav");
      if (isOpen) {
        closeLeft();
      } else {
        closeRight();
        if (wrapper) wrapper.classList.add("slide-nav");
        if (leftOverlay) leftOverlay.classList.add("opened");
        document.documentElement.classList.add("menu-opened");
        mobileBtn.innerHTML = ICON_X;
      }
    });
  }

  if (rightBtn) {
    rightBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const isOpen = rightPanel && rightPanel.classList.contains("mobile-open");
      closeLeft();
      if (isOpen) {
        closeRight();
      } else {
        if (rightPanel) rightPanel.classList.add("mobile-open");
        if (rightOverlay) rightOverlay.classList.add("open");
      }
    });
  }

  if (rightOverlay) rightOverlay.addEventListener("click", closeRight);
  if (leftOverlay) {
    leftOverlay.addEventListener("click", () => { closeLeft(); closeRight(); });
  }

  const chatRoot = document.getElementById("chatMessagesRoot");
  if (chatRoot) {
    chatRoot.addEventListener("click", () => {
      if (window.innerWidth <= 991) closeAll();
    });
  }

  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeAll(); });
  window.addEventListener("resize", () => { if (window.innerWidth > 991) closeRight(); });
}

export async function initApp(role) {
  ensureSeed();
  const currentUserId = role === "tutor" ? DEMO_TUTOR_ID : DEMO_STUDENT_ID;
  const store = createStore({ currentUserId, currentRole: role, activeConversationId: null });

  const dupToggle = document.getElementById("toggle_btn");
  if (dupToggle) dupToggle.style.display = "none";

  const resetBtn = document.getElementById("resetDemoBtn");
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      if (confirm("Reset demo data?")) {
        seedDemoData();
        store.publish("conversations:changed", null);
        store.publish("messages:changed", null);
        store.publish("offers:changed", null);
        store.publish("profiles:changed", null);
        ConversationService.listConversations(currentUserId, role).then((convs) => {
          if (convs.length) {
            store.setState({ activeConversationId: convs[0].id });
            store.publish("activeConversation:changed", convs[0]);
          }
        });
      }
    });
  }

  // Mount left nav into StudyPod sidebar (no preclinic word)
  const leftRoot = document.getElementById("studyPodLeftNavRoot");
  if (leftRoot) {
    const leftNavComp = createLeftNav({ store, conversationService: ConversationService, profileService: ProfileService, offerService: OfferService });
    leftNavComp.mount(leftRoot);
  }

  const headerComp = createHeader({ store, profileService: ProfileService });
  headerComp.mount(document.getElementById("chatHeaderRoot"));

  const rightComp = createRightPanel({ store, profileService: ProfileService });
  rightComp.mount(document.getElementById("rightPanelRoot"));

  const chatComp = createChatWindow({ store, chatService: ChatService, offerService: OfferService, conversationService: ConversationService, profileService: ProfileService });
  chatComp.mount(document.getElementById("chatMessagesRoot"));

  const offerFormComp = createOfferForm({ store, offerService: OfferService, conversationService: ConversationService });
  offerFormComp.mount();

  const textarea = document.getElementById("messageTextarea");
  const sendBtn = document.getElementById("sendMessageBtn");
  if (textarea && sendBtn) {
    const updateBtn = () => (sendBtn.disabled = !textarea.value.trim());
    textarea.addEventListener("input", () => {
      textarea.style.height = "auto";
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + "px";
      updateBtn();
    });
    textarea.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        if (textarea.value.trim()) doSend();
      }
    });
    sendBtn.addEventListener("click", doSend);
    async function doSend() {
      const text = textarea.value.trim();
      if (!text) return;
      const state = store.getState();
      if (!state.activeConversationId) return;
      textarea.value = "";
      sendBtn.disabled = true;
      textarea.style.height = "44px";
      try {
        await ChatService.sendMessage({ conversationId: state.activeConversationId, senderId: state.currentUserId, senderRole: state.currentRole, type: "text", content: text });
        store.publish("messages:changed", { conversationId: state.activeConversationId });
        store.publish("conversations:changed", null);
      } catch (e) { console.error(e); }
    }
  }

  setupMobileDrawers();

  if (window.$) { $("#toggle_btn").off("click"); }

  const convs = await ConversationService.listConversations(currentUserId, role);
  if (convs.length) {
    store.setState({ activeConversationId: convs[0].id });
    store.publish("activeConversation:changed", convs[0]);
    await ConversationService.clearUnread(convs[0].id, role);
    store.publish("conversations:changed", null);
  }

  window.studyPodReset = () => { seedDemoData(); location.reload(); };
}
