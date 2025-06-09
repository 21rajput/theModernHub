const { toTitleCase, validateEmail } = require("../config/function");
const bcrypt = require("bcryptjs");
const userModel = require("../models/users");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config/keys");

class Auth {
  async isAdmin(req, res) {
    let { loggedInUserId } = req.body;
    try {
      let loggedInUserRole = await userModel.findById(loggedInUserId);
      res.json({ role: loggedInUserRole.userRole });
    } catch {
      res.status(404);
    }
  }

  async allUser(req, res) {
    try {
      let allUser = await userModel.find({});
      res.json({ users: allUser });
    } catch {
      res.status(404);
    }
  }

  /* Post Signup */
  async postSignup(req, res) {
    const { name, email, password } = req.body;
    console.log("Signup attempt for:", { name, email }); // Debug log

    if (!name || !email || !password) {
      return res.json({
        error: "All fields are required"
      });
    }

    try {
      const existingUser = await userModel.findOne({ email: email });
      if (existingUser) {
        return res.json({
          error: "Email already exists"
        });
      }

      // Check if this is the admin email
      const isAdmin = email === 'admin@example.com';
      if (isAdmin) {
        // Delete any existing admin users
        await userModel.deleteMany({ userRole: 1 });
        console.log("Cleared existing admin users");
      }

      const hashedPassword = bcrypt.hashSync(password, 10);
      const user = new userModel({
        name: toTitleCase(name),
        email,
        password: hashedPassword,
        userRole: isAdmin ? 1 : 0 // Set as admin if using admin email
      });

      const savedUser = await user.save();
      console.log("User created:", {
        id: savedUser._id,
        email: savedUser.email,
        role: savedUser.userRole
      }); // Debug log

      const token = jwt.sign(
        { _id: savedUser._id, userRole: savedUser.userRole },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );

      return res.json({
        success: isAdmin ? "Admin user created successfully" : "Signup successful",
        token,
        user: {
          _id: savedUser._id,
          name: savedUser.name,
          email: savedUser.email,
          userRole: savedUser.userRole
        }
      });
    } catch (err) {
      console.error("Signup error:", err);
      return res.json({
        error: "Failed to create user"
      });
    }
  }

  /* Create Admin User */
  async createAdmin(req, res) {
    const { name, email, password } = req.body;
    console.log("Creating admin user:", { name, email }); // Debug log
    
    if (!name || !email || !password) {
      return res.json({
        error: "All fields are required"
      });
    }

    try {
      // First, delete any existing admin users
      await userModel.deleteMany({ userRole: 1 });
      console.log("Cleared existing admin users");

      // Create new admin user
      const hashedPassword = bcrypt.hashSync(password, 10);
      const adminUser = new userModel({
        name: toTitleCase(name),
        email,
        password: hashedPassword,
        userRole: 1 // Explicitly set as admin
      });

      const savedAdmin = await adminUser.save();
      console.log("Admin user created:", {
        id: savedAdmin._id,
        email: savedAdmin.email,
        role: savedAdmin.userRole
      }); // Debug log
      
      const token = jwt.sign(
        { _id: savedAdmin._id, userRole: savedAdmin.userRole },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );

      return res.json({
        success: "Admin user created successfully",
        token
      });
    } catch (err) {
      console.error("Admin creation error:", err);
      return res.json({
        error: "Failed to create admin user"
      });
    }
  }

  /* User Login/Signin controller  */
  async postSignin(req, res) {
    let { email, password } = req.body;
    console.log("Login attempt for email:", email); // Debug log

    if (!email || !password) {
      return res.json({
        error: "Fields must not be empty",
      });
    }

    try {
      const data = await userModel.findOne({ email: email });
      console.log("Found user:", data ? {
        id: data._id,
        email: data.email,
        role: data.userRole,
        hasPassword: !!data.password
      } : "No user found"); // Debug log

      if (!data) {
        return res.json({
          error: "Invalid email or password",
        });
      }

      const login = await bcrypt.compare(password, data.password);
      console.log("Password match:", login); // Debug log
      console.log("User role:", data.userRole); // Debug log

      if (login) {
        const token = jwt.sign(
          { 
            _id: data._id, 
            role: data.userRole,
            userRole: data.userRole 
          },
          JWT_SECRET
        );
        const encode = jwt.verify(token, JWT_SECRET);
        console.log("Generated token payload:", encode); // Debug log
        return res.json({
          token: token,
          user: {
            _id: data._id,
            name: data.name,
            email: data.email,
            role: data.userRole,
            userRole: data.userRole
          }
        });
      } else {
        return res.json({
          error: "Invalid email or password",
        });
      }
    } catch (err) {
      console.error("Login error:", err);
      return res.json({
        error: "Login failed",
      });
    }
  }
}

const authController = new Auth();
module.exports = authController;
