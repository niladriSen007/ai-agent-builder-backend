import { model, Schema, type HydratedDocument, type InferSchemaType } from "mongoose";

const userSchema = new Schema(
  {
    firebaseUid: {
      type: String,
      require: true,
      unique: true,
    },
    name: {
      type: String,
      require: true,
      trim: true,
    },
    email: {
      type: String,
      require: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    profilePicture: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

export const UserEntity = model("User", userSchema);
export type UserEntityDocument = HydratedDocument<InferSchemaType<typeof userSchema>>;
