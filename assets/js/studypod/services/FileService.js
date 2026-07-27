const FILES_KEY = "studyPod_files";
function readFiles() {
  try {
    return JSON.parse(localStorage.getItem(FILES_KEY) || "[]");
  } catch {
    return [];
  }
}
function writeFiles(arr) {
  localStorage.setItem(FILES_KEY, JSON.stringify(arr));
}
export const FileService = {
  getFiles(conversationId) {
    const all = readFiles().filter(function (f) {
      return f.conversationId === conversationId;
    });
    all.sort(function (a, b) {
      return new Date(b.timestamp) - new Date(a.timestamp);
    });
    return Promise.resolve(all);
  },
  getFile(fileId) {
    return Promise.resolve(
      readFiles().find(function (f) {
        return f.id === fileId;
      }) || null,
    );
  },
  uploadFile: function (obj) {
    const conversationId = obj.conversationId,
      senderId = obj.senderId,
      file = obj.file;
    return new Promise(function (resolve, reject) {
      const reader = new FileReader();
      reader.onload = function () {
        const all = readFiles();
        const fileObj = {
          id: crypto.randomUUID(),
          conversationId: conversationId,
          senderId: senderId,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          dataUrl: reader.result,
          timestamp: new Date().toISOString(),
        };
        all.push(fileObj);
        writeFiles(all);
        try {
          const msgs = JSON.parse(
            localStorage.getItem("studyPod_messages") || "[]",
          );
          const convs = JSON.parse(
            localStorage.getItem("studyPod_conversations") || "[]",
          );
          const msg = {
            id: crypto.randomUUID(),
            conversationId: conversationId,
            senderId: senderId,
            senderRole: senderId.startsWith("tutor") ? "tutor" : "student",
            type: "file",
            content: fileObj.id,
            timestamp: fileObj.timestamp,
            deleted: false,
          };
          msgs.push(msg);
          localStorage.setItem("studyPod_messages", JSON.stringify(msgs));
          const conv = convs.find(function (c) {
            return c.id === conversationId;
          });
          if (conv) {
            conv.lastMessageAt = msg.timestamp;
            if (msg.senderRole === "tutor")
              conv.unreadCountForTutor = (conv.unreadCountForTutor || 0) + 1;
            else
              conv.unreadCountForStudent =
                (conv.unreadCountForStudent || 0) + 1;
            localStorage.setItem(
              "studyPod_conversations",
              JSON.stringify(convs),
            );
          }
        } catch (e) {
          console.error(e);
        }
        resolve(fileObj);
      };
      reader.onerror = function () {
        reject(new Error("Failed"));
      };
      reader.readAsDataURL(file);
    });
  },
};
