/**
 * firestoreService.js
 * Thin wrapper for any Firestore reads needed on the frontend
 * (e.g. reading student profile data stored in Firestore).
 *
 * NOTE: Core authentication uses Firebase Auth (firebase.js).
 * This service is for any direct Firestore document reads.
 */
import { getFirestore, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { auth } from "../firebase/firebase";

const db = getFirestore();

const firestoreService = {
  /**
   * Get a Firestore document by collection + docId
   */
  getDocument: async (collectionName, docId) => {
    const docRef = doc(db, collectionName, docId);
    const snap = await getDoc(docRef);
    if (snap.exists()) return { id: snap.id, ...snap.data() };
    return null;
  },

  /**
   * Set (overwrite) a Firestore document
   */
  setDocument: async (collectionName, docId, data) => {
    const docRef = doc(db, collectionName, docId);
    await setDoc(docRef, data, { merge: true });
    return true;
  },

  /**
   * Update specific fields in a Firestore document
   */
  updateDocument: async (collectionName, docId, updates) => {
    const docRef = doc(db, collectionName, docId);
    await updateDoc(docRef, updates);
    return true;
  },

  /**
   * Get the current Firebase Auth user's Firestore profile
   */
  getCurrentUserProfile: async () => {
    const user = auth.currentUser;
    if (!user) return null;
    const docRef = doc(db, "students", user.uid);
    const snap = await getDoc(docRef);
    if (snap.exists()) return { id: snap.id, ...snap.data() };
    return null;
  },
};

export default firestoreService;
