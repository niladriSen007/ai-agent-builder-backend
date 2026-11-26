import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/mydatabase";
const JWT_SECRET =
  process.env.JWT_SECRET ||
  "kdjfvkdjnvhdvdkjvjklsdvfhlsdkjfhvdslkfvhdlsfhvlsdkjfhvldijfhvieurhfeiruhfeiruhfeirhfelrfherliuhf";

export { PORT,MONGO_URI ,JWT_SECRET};