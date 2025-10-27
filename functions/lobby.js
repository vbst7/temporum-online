const {onDocumentUpdated} = require("firebase-functions/v2/firestore");
const {getFirestore} = require("firebase-admin/firestore");
const logger = require("firebase-functions/logger");

/**
 * A Cloud Function that triggers when a lobby document is updated.
 * If the `deleteMe` field is set to true, it deletes the lobby document.
 * This is used to allow any player to trigger a lobby deletion when they are
 * the last human player, bypassing security rules that might restrict
 * deletion to only the lobby owner.
 */
exports.deleteLobbyOnResign =
    onDocumentUpdated("lobbies/{lobbyId}", async (event) => {
      const change = event.data;
      if (!change) return;

      const newData = change.after.data();
      if (newData && newData.deleteMe === true) {
        logger.log(`Lobby ${event.params.lobbyId} flagged for deletion. ` +
            `Deleting now.`);
        return getFirestore().collection("lobbies")
            .doc(event.params.lobbyId).delete();
      }
    });
