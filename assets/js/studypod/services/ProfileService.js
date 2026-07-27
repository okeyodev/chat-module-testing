const KEY = "studyPod_profiles";
function read() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}
function write(arr) {
  localStorage.setItem(KEY, JSON.stringify(arr));
}
export const ProfileService = {
  getProfile(userId) {
    return Promise.resolve(
      read().find(function (p) {
        return p.id === userId;
      }) || null,
    );
  },
  listProfiles() {
    return Promise.resolve(read());
  },
  updateProfile(userId, updates) {
    const all = read();
    const idx = all.findIndex(function (p) {
      return p.id === userId;
    });
    if (idx === -1) return Promise.reject(new Error("Profile not found"));
    all[idx] = Object.assign({}, all[idx], updates);
    write(all);
    return Promise.resolve(all[idx]);
  },
  _read() {
    return read();
  },
  _write(arr) {
    write(arr);
  },
};
