const express = require("express");
const router = express.Router();
const { z } = require("zod");
const validate = require("../middleware/validate");

const {
 register,
 login
} = require("../controllers/authController");

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

router.post("/login", login);
router.post("/register", validate(registerSchema), register);

module.exports = router;