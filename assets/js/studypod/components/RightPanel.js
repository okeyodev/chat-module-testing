export function createRightPanel({ store, profileService }) {
  let otherProfile = null;
  let otherStats = null;
  function readStats() {
    try {
      return JSON.parse(localStorage.getItem("studyPod_stats") || "[]");
    } catch {
      return [];
    }
  }
  function render() {
    const nameEl = document.getElementById("rightProfileName");
    const imgEl = document.getElementById("rightProfileImg");
    const subjEl = document.getElementById("rightProfileSubj");
    const detailsEl = document.getElementById("rightProfileDetails");
    const statsEl = document.getElementById("rightProfileStats");
    if (!nameEl) return;
    if (!otherProfile) {
      nameEl.textContent = "No selection";
      if (subjEl) subjEl.textContent = "";
      if (detailsEl)
        detailsEl.innerHTML =
          "<small class='text-muted'>Select a conversation</small>";
      if (statsEl) statsEl.innerHTML = "";
      return;
    }
    nameEl.textContent = otherProfile.name;
    if (imgEl) imgEl.src = otherProfile.profilePicUrl;
    if (subjEl)
      subjEl.textContent =
        otherProfile.role === "tutor"
          ? otherProfile.specialty || ""
          : otherProfile.subject || otherProfile.school || "";
    if (detailsEl) {
      detailsEl.innerHTML = "";
      const rows =
        otherProfile.role === "student"
          ? [
              ["Username", otherProfile.username],
              ["School", otherProfile.school],
              ["Subject", otherProfile.subject],
              ["Timezone", otherProfile.timezone],
            ]
          : [
              ["Username", otherProfile.username],
              ["Specialty", otherProfile.specialty],
              ["Experience", otherProfile.experience],
              ["Timezone", otherProfile.timezone],
            ];
      rows.forEach(([label, value]) => {
        const div = document.createElement("div");
        div.className = "d-flex justify-content-between mb-2";
        div.style.fontSize = "13px";
        div.innerHTML = `<span class="text-muted">${label}</span><span><strong>${value || "-"}</strong></span>`;
        detailsEl.appendChild(div);
      });
    }
    if (statsEl) {
      statsEl.innerHTML = "";
      if (otherStats) {
        if (otherProfile.role === "student") {
          statsEl.innerHTML = `<div class="text-center p-2 bg-light rounded"><div style="font-weight:700; font-size:18px;">${otherStats.sessionsDone || 0}</div><small class="text-muted">Sessions done</small></div>`;
        } else {
          statsEl.innerHTML = `<div class="row"><div class="col-6 text-center p-2 bg-light rounded"><div style="font-weight:700;">${otherStats.sessionsTaught || 0}</div><small>Sessions taught</small></div><div class="col-6 text-center p-2 bg-light rounded"><div style="font-weight:700;">${otherStats.completionRate || 0}%</div><small>Completion</small></div></div>`;
        }
      }
    }
  }
  async function updateActive(conv) {
    if (!conv) {
      otherProfile = null;
      otherStats = null;
      render();
      return;
    }
    const state = store.getState();
    const otherId =
      state.currentRole === "tutor" ? conv.studentId : conv.tutorId;
    otherProfile = await profileService.getProfile(otherId);
    const allStats = readStats();
    otherStats = allStats.find((s) => s.userId === otherId) || null;
    render();
  }
  return {
    mount() {
      store.subscribe("activeConversation:changed", (conv) =>
        updateActive(conv),
      );
      render();
    },
  };
}
