// api/login.js

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { query } = require("./db");


/*
 * Required environment variable:
 *
 * ADMIN_JWT_SECRET
 *
 * Example:
 * ADMIN_JWT_SECRET=your-long-random-secret
 */

if (!process.env.ADMIN_JWT_SECRET) {
  throw new Error(
    "ADMIN_JWT_SECRET environment variable is not configured."
  );
}


function setCookie(res, name, value, options = {}) {
  const parts = [
    `${name}=${encodeURIComponent(value)}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Strict"
  ];

  if (options.maxAge) {
    parts.push(`Max-Age=${options.maxAge}`);
  }

  if (process.env.NODE_ENV === "production") {
    parts.push("Secure");
  }

  res.setHeader(
    "Set-Cookie",
    parts.join("; ")
  );
}


module.exports = async function handler(req, res) {

  /*
   * Only POST requests are allowed.
   */

  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed."
    });
  }


  try {

    /*
     * Read request body.
     */

    const {
      email,
      password
    } = req.body || {};


    /*
     * Basic validation.
     */

    if (
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required."
      });
    }


    const cleanEmail =
      email.trim().toLowerCase();


    if (!cleanEmail || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required."
      });
    }


    /*
     * Find active admin.
     */

    const result = await query(
      `
      SELECT
        id,
        name,
        email,
        password_hash,
        role,
        is_active
      FROM admins
      WHERE LOWER(email) = $1
      LIMIT 1
      `,
      [cleanEmail]
    );


    /*
     * Don't reveal whether the email
     * exists or not.
     */

    if (
      result.rows.length === 0 ||
      !result.rows[0].is_active
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password."
      });
    }


    const admin =
      result.rows[0];


    /*
     * Compare submitted password
     * with bcrypt password hash.
     */

    const passwordValid =
      await bcrypt.compare(
        password,
        admin.password_hash
      );


    if (!passwordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password."
      });
    }


    /*
     * Create signed admin token.
     */

    const token =
      jwt.sign(
        {
          adminId: admin.id,
          email: admin.email,
          role: admin.role
        },
        process.env.ADMIN_JWT_SECRET,
        {
          expiresIn: "8h"
        }
      );


    /*
     * Save last login time.
     */

    await query(
      `
      UPDATE admins
      SET
        last_login = NOW(),
        updated_at = NOW()
      WHERE id = $1
      `,
      [admin.id]
    );


    /*
     * Store token in secure HttpOnly cookie.
     *
     * JavaScript cannot directly read this cookie.
     */

    setCookie(
      res,
      "savemore_admin_token",
      token,
      {
        maxAge: 8 * 60 * 60
      }
    );


    /*
     * Successful login.
     */

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });


  } catch (error) {

    console.error(
      "Admin login error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error. Please try again."
    });

  }

};
