const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.setClaims = functions.https.onCall(async (data, context) => {
  // Verificar se o solicitante é um admin
  if (!(context.auth && context.auth.token.admin === true)) {
    throw new functions.https.HttpsError('permission-denied', 'Apenas administradores podem definir claims.');
  }

  const { uid, claims } = data;

  try {
    await admin.auth().setCustomUserClaims(uid, claims);
    return { result: 'Claims definidas com sucesso.' };
  } catch (error) {
    throw new functions.https.HttpsError('internal', 'Erro ao definir claims: ' + error.message);
  }
});