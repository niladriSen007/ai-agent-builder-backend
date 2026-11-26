import { cert, initializeApp, type ServiceAccount } from "firebase-admin";
import serviceAccount from "../auth_utils/serviceAccountKey.json" with { type: "json" };

export const auth_verify_app = initializeApp({
  credential: cert(serviceAccount as ServiceAccount),
});
