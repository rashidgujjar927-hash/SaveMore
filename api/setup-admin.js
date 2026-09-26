const bcrypt = require("bcryptjs");
const { query } = require("./db");

module.exports = async function handler(req, res) {

  // Sirf POST request allow hogi
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed"
    });
  }

  try {

    const email = "admin@savemore.com";
    const password = "SaveMore@2026";
    const name = "SaveMore Admin";

    // Password ko secure bcrypt hash mein convert karo
    const passwordHash = await bcrypt.hash(password, 12);

    // Admin create/update
    const result = await query(
      `
      INSERT INTO admins
        (
          name,
          email,
          password_hash,
          role,
          is_active
        )
      VALUES
        ($1, $2, $3, 'admin', true)

      ON CONFLICT (email)
      DO UPDATE SET
        name = EXCLUDED.name,
        password_hash = EXCLUDED.password_hash,
        role = EXCLUDED.role,
        is_active = true,
        updated_at = NOW()

      RETURNING
        id,
        name,
        email,
        role,
        is_active
      `,
      [
        name,
        email,
        passwordHash
      ]
    );

    return res.status(200).json({
      success: true,
      message: "Admin account created successfully.",
      admin: result.rows[0]
    });

  } catch (error) {

    console.error(
      "Setup admin error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Could not create admin account."
    });
  }
};
