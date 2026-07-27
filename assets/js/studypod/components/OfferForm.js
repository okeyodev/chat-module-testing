export const CURRENCIES = [
  { code: "NGN", symbol: "₦", name: "Nigeria Naira" },
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "GHS", symbol: "GH₵", name: "Ghanaian Cedi" },
  { code: "ZAR", symbol: "R", name: "South African Rand" },
  { code: "KES", symbol: "KSh", name: "Kenyan Shilling" },
  { code: "EGP", symbol: "E£", name: "Egyptian Pound" },
];
const ICON_BOOK = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>`;

export function createOfferForm({ store, offerService, conversationService }) {
  let currentConversation = null;
  let editingOffer = null;
  function validate(data){
    const errors = {};
    if (!data.courseTitle?.trim()) errors.courseTitle = "Required";
    if (!data.summary?.trim()) errors.summary = "Required";
    if (!data.startDate) errors.startDate = "Required";
    if (!data.endDate) errors.endDate = "Required";
    if (data.startDate && data.endDate && new Date(data.endDate) < new Date(data.startDate)) errors.endDate = "End date cannot be before start date";
    if (!data.time?.trim()) errors.time = "Required";
    if (!data.currency) errors.currency = "Select a currency";
    if (data.amount === "" || data.amount == null) errors.amount = "Required";
    else if (Number(data.amount) <= 0) errors.amount = "Amount must be positive";
    return errors;
  }
  function openModal(){
    const modalEl = document.getElementById("offerModal");
    if(window.$ && $(modalEl).modal){
      $(modalEl).modal("show");
      setTimeout(()=>{
        const backdrop = document.querySelector(".modal-backdrop");
        if(backdrop){
          backdrop.style.background = "rgba(15,23,42,0.32)";
          backdrop.style.backdropFilter = "blur(8px)";
          backdrop.style.webkitBackdropFilter = "blur(8px)";
        }
      }, 10);
    }
  }
  function closeModal(){
    const modalEl = document.getElementById("offerModal");
    if(window.$ && $(modalEl).modal){ $(modalEl).modal("hide"); }
  }
  function fillForm(){
    const form = document.getElementById("offerForm");
    if(!form) return;
    form.querySelectorAll(".error").forEach(e=>e.textContent="");
    form.querySelectorAll(".has-error").forEach(e=>e.classList.remove("has-error"));
    const setVal = (name,val)=>{ const el=form.querySelector("[name="+name+"]"); if(el) el.value=val||""; };
    if(editingOffer){
      setVal("courseTitle", editingOffer.courseTitle);
      setVal("summary", editingOffer.summary);
      setVal("startDate", editingOffer.startDate);
      setVal("endDate", editingOffer.endDate);
      setVal("time", editingOffer.time);
      setVal("currency", editingOffer.currency||"NGN");
      setVal("amount", editingOffer.amount);
      document.getElementById("offerModalLabel").innerHTML = ICON_BOOK + " Edit custom offer";
      document.getElementById("offerSubmitBtn").textContent="Save changes";
    } else {
      form.reset();
      const curr = form.querySelector("[name=currency]");
      if(curr) curr.value="NGN";
      document.getElementById("offerModalLabel").innerHTML = ICON_BOOK + " Create custom offer";
      document.getElementById("offerSubmitBtn").textContent="Create offer";
    }
    updatePreview();
  }
  function updatePreview(){
    const form = document.getElementById("offerForm");
    if(!form) return;
    const currCode = form.querySelector("[name=currency]")?.value||"NGN";
    const curr = CURRENCIES.find(c=>c.code===currCode);
    const sym = curr? curr.symbol : currCode;
    const amount = form.querySelector("[name=amount]")?.value;
    const preview = document.getElementById("currencyPreview");
    if(preview){ preview.innerHTML = amount? "You will charge: <strong>"+sym+amount+"</strong>" : ""; }
  }
  return {
    mount(){
      const form = document.getElementById("offerForm");
      if(!form) return;
      form.querySelector("[name=currency]")?.addEventListener("change", updatePreview);
      form.querySelector("[name=amount]")?.addEventListener("input", updatePreview);
      form.addEventListener("submit", async (e)=>{
        e.preventDefault();
        const data = {};
        new FormData(form).forEach((v,k)=> data[k]=v);
        const errors = validate(data);
        form.querySelectorAll(".error").forEach(el=>el.textContent="");
        if(Object.keys(errors).length){
          for(const [k,msg] of Object.entries(errors)){
            const errEl = form.querySelector("[data-error="+k+"]");
            if(errEl) errEl.textContent=msg;
          }
          return;
        }
        try{
          if(editingOffer){
            await offerService.updateOffer(editingOffer.id, data);
            store.publish("offers:changed", {conversationId: currentConversation.id});
          } else {
            const payload = { conversationId: currentConversation.id, tutorId: currentConversation.tutorId, studentId: currentConversation.studentId, ...data };
            await offerService.createOffer(payload);
            store.publish("offers:changed", {conversationId: currentConversation.id});
            store.publish("messages:changed", {conversationId: currentConversation.id});
            store.publish("conversations:changed", null);
          }
          closeModal();
        }catch(err){ alert(err.message); }
      });
      store.subscribe("ui:createOffer", ({ conversation })=>{
        currentConversation = conversation;
        editingOffer = null;
        fillForm();
        openModal();
      });
      store.subscribe("ui:editOffer", async (offer)=>{
        editingOffer = offer;
        currentConversation = await conversationService.getConversation(offer.conversationId);
        fillForm();
        openModal();
      });
    }
  };
}
