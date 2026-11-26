import type { DecodedIdToken } from "firebase-admin/auth";
import { UserEntity, type UserEntityDocument } from "../entity/User.model.js";


export class AuthRepository {
  async login(userDetails: DecodedIdToken): Promise<UserEntityDocument | null> {
    const user = await UserEntity.findOneAndUpdate(
      { firebaseUid: userDetails.uid },
      {
        $set: {
          name: userDetails?.name,
          email: userDetails?.email,
          profilePicture: userDetails?.picture,
        },
        $setOnInsert: {
          firebaseUid: userDetails?.uid,
        },
      },
      {
        upsert: true,
        returnDocument: "after",
      },
    );
    return user;
  }
}
