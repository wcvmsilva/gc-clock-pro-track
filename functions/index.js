const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { getMessaging } = require("firebase-admin/messaging");

initializeApp();

exports.notifyCheckin = onDocumentCreated("notifications/{notifId}", async (event) => {
  const data = event.data.data();
  if (!data || data.type !== "checkin") return null;

  const tokensSnap = await getFirestore()
    .collection("fcmTokens")
    .where("role", "==", "admin")
    .get();

  if (tokensSnap.empty) return null;

  const tokens = tokensSnap.docs.map(d => d.data().token).filter(Boolean);
  if (!tokens.length) return null;

  return getMessaging().sendEachForMulticast({
    notification: {
      title: `🟢 Check-in — ${data.employeeName}`,
      body: `${data.project} · ${data.time} · ${data.date}`
    },
    tokens
  });
});
