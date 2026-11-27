// src/index.ts
import "express";

// src/config/variables.ts
import dotenv from "dotenv";
dotenv.config();
var PORT = process.env.PORT || 3e3;
var MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/mydatabase";
var JWT_SECRET = process.env.JWT_SECRET || "kdjfvkdjnvhdvdkjvjklsdvfhlsdkjfhvdslkfvhdlsfhvlsdkjfhvldijfhvieurhfeiruhfeiruhfeirhfelrfherliuhf";

// src/config/dbConnection.ts
import mongoose from "mongoose";
var connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};
var dbConnection_default = connectDB;

// src/app.ts
import express from "express";

// src/routes/Auth.routes.ts
import { Router } from "express";

// src/dto/common/ResponseEntity.ts
var ResponseEntity = (res, statusCode, message, data) => {
  const response2 = {
    success: statusCode >= 200 && statusCode < 300,
    message,
    data,
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  };
  return res.status(statusCode).json(response2);
};

// src/services/Auth.services.ts
import "express";

// src/entity/User.model.ts
import { model, Schema } from "mongoose";
var userSchema = new Schema(
  {
    firebaseUid: {
      type: String,
      require: true,
      unique: true
    },
    name: {
      type: String,
      require: true,
      trim: true
    },
    email: {
      type: String,
      require: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    profilePicture: {
      type: String
    }
  },
  {
    timestamps: true
  }
);
var UserEntity = model("User", userSchema);

// src/repository/Auth.repository.ts
var AuthRepository = class {
  async login(userDetails) {
    const user = await UserEntity.findOneAndUpdate(
      { firebaseUid: userDetails.uid },
      {
        $set: {
          name: userDetails?.name,
          email: userDetails?.email,
          profilePicture: userDetails?.picture
        },
        $setOnInsert: {
          firebaseUid: userDetails?.uid
        }
      },
      {
        upsert: true,
        returnDocument: "after"
      }
    );
    return user;
  }
};

// src/exceptions/ApiError.ts
var ApiError = class extends Error {
  statusCode;
  isOperational;
  constructor(statusCode, message, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
};

// src/exceptions/NotFound.error.ts
var NotFoundException = class extends ApiError {
  constructor(message = "Resource not found") {
    super(404, message);
  }
};

// src/services/Auth.services.ts
import { getAuth } from "firebase-admin/auth";

// src/config/firebaseConnection.ts
import { cert, initializeApp } from "firebase-admin";

// src/auth_utils/serviceAccountKey.json
var serviceAccountKey_default = {
  type: "service_account",
  project_id: "ai-agent-builder-4bf82",
  private_key_id: "359ed01a84f0886a2e62f3b8e624fbf5356feed0",
  private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDVGx/puqCyGiST\nR4N5gmOuDxGTXhXs/xoGaWEP0c4TkpovRrqAMAI391Pf+dXcUw4lqiwt82uHfOBA\nv7EnOe5ighbObIHXOayj5TEEH4hWwGE9cKgI+ZIKngqdwXB8u5FRpgwxzdJgI4OR\nAmdkNKVScClTw0FF59JZ2rtLeHJPDGX3EpeGGXfrPMyr09GWaq74ukmp5Usu7RDX\nC03zFYY+wthln13UK32fD9909SOvvwhYIiprAdRqbKZXHhQUAjIiDd3ChxAb3Kg/\n0fFGeNfM+nN3e/KPwXzBgcVywgQgienOxNx53dkB6DlW1JjGT4mBvydocAh0bZtY\n0D5bZn/vAgMBAAECggEAIKty3gMVZZhqaQW6myMpIuL+f8gZtmZ5V+hJ0AILBKch\n6gN+ze4OOQQ6oIiNh6RX8+A9u6Gop3G2c1av0uKnsARfeK/by+H0nH+jXw1yelIt\n1hxyNkYEZIpL+FlSZFzg71J0ZiI2kTSAk/d5YDxN5/B39XZmiE/8yHem5PAHHiTx\nxI8RTD+5pF4Wv6Qpd+MaH4w+t75I/L13LFnR2PVkJEg3mICTMaYv2Jb+ew9Xhy9r\n7SWO89bs3qRKQwcYLXpJhVoZDYWA7jc65++FAZgrpYCbYgOERXillnrtDIhL7VYQ\n2ibUPyxWaG3lekmUONQizdFfIYZ0Bv6MUYOP6u3qgQKBgQDzI56cNvpLztHkS+Ha\nppcU6KyY98LwNgE+aq3Av2GRKt+FgAirW4EuurjvA/aDOyI/1GxC6EkbC7xW4evh\nsk9K36roCHBN9IlAnItSa2UOPnHdxSE0Ur3TUK0RjG8ecVuhZxbcnzZc8KBYkHXt\nBDqTfu3xavzX9Uc1N1/uNI3XLwKBgQDgYNJWstnRX52pUWx4hzCuTY2rs7bCWFVJ\ncjnfygE8gdN6bICQBC90jrRfnD03fSzR+om+ms2zpdnYe4GQAceEVCfv890pWxJz\n3TUD4cyw+gc5d8cnf13v1uRB90JmV+lAhqv58VEXgL/D0xvFtk0G4U5lie7hxty6\nQ8oEnaOzQQKBgFEMMJT2Jp0ahhDJ0rGmEnqfzNj4zfxwpB2ARgcYRJe1aOkBcuJc\nEEXZbEgQVB4Omi4YyzXKZIQld1Sm3pBPdesJf9j05yq1NwNYq4B/2CHVYvOAAL+G\nTUyhee99lpTZSKgWyyIj2GVGuMyM6yJk5HnCN+LfvQTn+CKfINUwo491AoGAeS9R\n60mFozOFL6GueBpsDHgOgCH8H1MeHSD4aQntSQTFd2WKuj3Ic6dvfAQifAm7X111\nb+CkINb+pZFvFJwhajMZrtuDI4bwnGto6sPVjfA8Xql2grqjvZnOhmJJFoV8kUEr\nOT9AkPUUnWszoMEpMQIXGXg58O86388lGQEbHQECgYBlo44kvkYxC6o4nd/vUx2E\nxqF/nzReo6MutovqbKbgfgBDiir4aNExPy+0bQxLRFELeddGLZS0ETIupaelu1z5\nGA8y+MMSvOCi5zWonf5V/WfDxVa7EwwGCqEWaKJEgQHTNrPMouTBzTlCrpAz6nq5\njHwo0pZ5OOuNHxlE9DD+NQ==\n-----END PRIVATE KEY-----\n",
  client_email: "firebase-adminsdk-fbsvc@ai-agent-builder-4bf82.iam.gserviceaccount.com",
  client_id: "100254914331306071718",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40ai-agent-builder-4bf82.iam.gserviceaccount.com",
  universe_domain: "googleapis.com"
};

// src/config/firebaseConnection.ts
var auth_verify_app = initializeApp({
  credential: cert(serviceAccountKey_default)
});

// src/services/Auth.services.ts
import jwt from "jsonwebtoken";

// src/exceptions/NotAuthorized.error.ts
var NotAuthorized = class extends ApiError {
  constructor(message = "Resource not found") {
    super(401, message);
  }
};

// src/services/Auth.services.ts
var AuthService = class {
  constructor(authRepository2) {
    this.authRepository = authRepository2;
  }
  authRepository;
  async login(loginRequest, response2) {
    const { token } = loginRequest;
    if (!token) {
      throw new NotFoundException("Token not found");
    }
    const userDetails = await getAuth(auth_verify_app).verifyIdToken(token);
    const user = await this.authRepository.login(userDetails);
    if (!user) {
      throw new NotFoundException("User not found");
    }
    const access_token = jwt.sign(
      {
        userId: user?._id
      },
      JWT_SECRET,
      {
        expiresIn: "7d"
      }
    );
    const refresh_token = jwt.sign(
      {
        userId: user?._id
      },
      JWT_SECRET,
      {
        expiresIn: "60d"
      }
    );
    response2.cookie("access_token", access_token, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1e3
    });
    response2.cookie("refresh_token", refresh_token, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: 60 * 24 * 60 * 60 * 1e3
    });
    return {
      name: user?.name ?? "",
      email: user?.email ?? "",
      profilePicture: user?.profilePicture ?? "",
      accessToken: access_token,
      refreshToken: refresh_token
    };
  }
  async refreshToken(req, res) {
    let refresh_token = req?.cookies?.refresh_token;
    if (!refresh_token) {
      throw new NotAuthorized("Token not found");
    }
    const userDetails = jwt.verify(
      refresh_token,
      JWT_SECRET
    );
    const user = await UserEntity.findById(userDetails?.userId);
    const access_token = jwt.sign(
      {
        userId: user?._id
      },
      JWT_SECRET,
      {
        expiresIn: "7d"
      }
    );
    refresh_token = jwt.sign(
      {
        userId: user?._id
      },
      JWT_SECRET,
      {
        expiresIn: "60d"
      }
    );
    res.cookie("access_token", access_token, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1e3
    });
    res.cookie("refresh_token", refresh_token, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: 60 * 24 * 60 * 60 * 1e3
    });
    return access_token;
  }
  async logout(req, res) {
    res.clearCookie("access_token", {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1e3
    });
    res.clearCookie("refresh_token", {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1e3
    });
    return true;
  }
};

// src/controller/Auth.controller.ts
import "firebase-admin";
import "jsonwebtoken";
var AuthController = class {
  constructor(authService2) {
    this.authService = authService2;
  }
  authService;
  login = async (req, res, next) => {
    try {
      const userData = await this.authService.login(req.body, res);
      return ResponseEntity(res, 201, "User Logged in Successfully", {
        userDetails: {
          ...userData
        },
        refreshToken: userData?.refreshToken
      });
    } catch (error) {
      next(error);
    }
  };
  refreshToken = async (req, res, next) => {
    try {
      const access_token = await this.authService.refreshToken(req, res);
      return ResponseEntity(res, 200, "Token rotation successful", {
        accessToken: access_token
      });
    } catch (error) {
      next(error);
    }
  };
  logout = async (req, res, next) => {
    try {
      this.authService.logout(req, res);
      return ResponseEntity(res, 200, "User logged out successfully", {
        logout: true
      });
    } catch (error) {
      next(error);
    }
  };
  myDetails = async (req, res, next) => {
    try {
      const user = req?.user;
      return ResponseEntity(
        res,
        200,
        "User details fetched successfully",
        user
      );
    } catch (error) {
      next(error);
    }
  };
};

// src/middleware/RouteProtector.middleware.ts
import jwt3 from "jsonwebtoken";
var RouteProtector = async (req, res, next) => {
  try {
    const refresh_token = req?.cookies?.refresh_token;
    if (!refresh_token) {
      throw new ApiError(401, "Token not found");
    }
    const userDetails = jwt3.verify(
      refresh_token,
      JWT_SECRET
    );
    const user = await UserEntity.findById(userDetails?.userId);
    if (!user) {
      throw new NotFoundException("User not found");
    }
    const access_token = jwt3.sign(
      {
        userId: user?._id
      },
      JWT_SECRET,
      {
        expiresIn: "7d"
      }
    );
    const userData = {
      ...user?._doc,
      accessToken: access_token
    };
    req.user = userData;
    next();
  } catch (error) {
    throw new ApiError(401, "Unauthorized");
  }
};

// src/routes/Auth.routes.ts
var authRouter = Router();
var authRepository = new AuthRepository();
var authService = new AuthService(authRepository);
var authController = new AuthController(authService);
authRouter.post("/login", authController.login);
authRouter.post("/refresh-token", authController.refreshToken);
authRouter.post("/logout", authController.logout);
authRouter.get("/myDetails", RouteProtector, authController.myDetails);

// src/app.ts
import cors from "cors";
import cookieParser from "cookie-parser";

// src/middleware/GlobalErrorhandler.middleware.ts
var GlobalErrorHandler = (err, req, res, next) => {
  let statusCode = 500;
  let message = "Internal Server Error";
  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
  }
  const response2 = {
    success: false,
    message,
    data: null,
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  };
  return res.status(statusCode).json(response2);
};

// src/routes/Agent.routes.ts
import { Router as Router2 } from "express";

// src/controller/Agent.controller.ts
var AgentController = class {
  constructor(agentService2) {
    this.agentService = agentService2;
  }
  agentService;
  getAgents = async (req, res, next) => {
    try {
      if (!req.user) {
        throw new ApiError(401, "Unauthorized");
      }
      const agents = await this.agentService.getAgents(req.user._id);
      return ResponseEntity(res, 200, "Agents fetched successfully", agents);
    } catch (error) {
      next(error);
    }
  };
  createAgent = async (req, res, next) => {
    try {
      if (!req.user) {
        throw new ApiError(401, "Unauthorized");
      }
      const agent = await this.agentService.createAgent(
        req.user._id,
        req.body
      );
      return ResponseEntity(res, 201, "Agent created successfully", agent);
    } catch (error) {
      next(error);
    }
  };
  patchAgent = async (req, res, next) => {
    try {
      if (!req.user) {
        throw new ApiError(401, "Unauthorized");
      }
      const agent = await this.agentService.patchAgent(
        req.user._id,
        req.params.agentId,
        req.body
      );
      return ResponseEntity(res, 200, "Agent updated successfully", agent);
    } catch (error) {
      next(error);
    }
  };
};

// src/entity/Agent.model.ts
import {
  model as model2,
  Schema as Schema2
} from "mongoose";
var agentSchema = new Schema2(
  {
    ownerId: {
      type: Schema2.Types.ObjectId,
      ref: "User",
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    knowledgeBase: {
      type: String,
      required: true
    },
    instructions: {
      type: String,
      required: true
    },
    tools: [
      {
        type: String
      }
    ],
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);
var AgentEntity = model2("Agent", agentSchema);

// src/repository/Agent.repository.ts
var AgentRepository = class {
  async findByOwner(ownerId) {
    return AgentEntity.find({ ownerId }).sort({ createdAt: -1 });
  }
  async create(ownerId, agent) {
    return AgentEntity.create({ ...agent, ownerId });
  }
  async update(ownerId, agentId, updates) {
    return AgentEntity.findOneAndUpdate(
      { _id: agentId, ownerId },
      { $set: updates },
      { new: true, runValidators: true }
    );
  }
};

// src/services/Agent.services.ts
import { Types } from "mongoose";
var AgentService = class {
  constructor(agentRepository2) {
    this.agentRepository = agentRepository2;
  }
  agentRepository;
  async getAgents(ownerId) {
    return this.agentRepository.findByOwner(ownerId);
  }
  async createAgent(ownerId, agent) {
    this.validateAgentFields(agent, true);
    return this.agentRepository.create(ownerId, agent);
  }
  async patchAgent(ownerId, agentId, updates) {
    if (!Types.ObjectId.isValid(agentId)) {
      throw new ApiError(400, "Invalid agent ID");
    }
    const allowedFields = /* @__PURE__ */ new Set([
      "name",
      "knowledgeBase",
      "instructions",
      "tools",
      "isActive"
    ]);
    if (!updates || typeof updates !== "object" || Object.keys(updates).length === 0 || Object.keys(updates).some((field) => !allowedFields.has(field))) {
      throw new ApiError(400, "At least one valid agent field is required");
    }
    this.validateAgentFields(updates, false);
    const agent = await this.agentRepository.update(ownerId, agentId, updates);
    if (!agent) {
      throw new NotFoundException("Agent not found");
    }
    return agent;
  }
  validateAgentFields(agent, requireAll) {
    for (const field of ["name", "knowledgeBase", "instructions"]) {
      const value = agent[field];
      if ((requireAll || value !== void 0) && (typeof value !== "string" || value.trim().length === 0)) {
        throw new ApiError(400, `${field} must be a non-empty string`);
      }
    }
    if (agent.tools !== void 0 && (!Array.isArray(agent.tools) || !agent.tools.every((tool) => typeof tool === "string"))) {
      throw new ApiError(400, "tools must be an array of strings");
    }
    if (agent.isActive !== void 0 && typeof agent.isActive !== "boolean") {
      throw new ApiError(400, "isActive must be a boolean");
    }
  }
};

// src/routes/Agent.routes.ts
var agentRouter = Router2();
var agentRepository = new AgentRepository();
var agentService = new AgentService(agentRepository);
var agentController = new AgentController(agentService);
agentRouter.get("/", RouteProtector, agentController.getAgents);
agentRouter.post("/", RouteProtector, agentController.createAgent);
agentRouter.patch("/:agentId", RouteProtector, agentController.patchAgent);

// src/app.ts
var app = express();
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true
  })
);
app.use(cookieParser());
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/agents", agentRouter);
app.use(GlobalErrorHandler);

// src/index.ts
dbConnection_default();
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
