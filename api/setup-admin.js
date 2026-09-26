const bcrypt = require("bcryptjs");
const { query } = require("./db");

module.exports = async function handler(req, res) {

  // Only POST requests
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed."
    });
  }

  try {

    /*
     * Setup protection
     *
     * Add this in Vercel Environment Variables:
     *
     * ADMIN_SETUP_SECRET=some-strong-secret
     */

    const setupSecret =
      process.env.ADMIN_SETUP_SECRET;

    if (!setupSecret) {
      return res.status(500).json({
        success: false,
        message:
          "ADMIN_SETUP_SECRET is not configured."
      });
    }


    /*
     * Secret can be sent in:
     *
     * Authorization: Bearer YOUR_SECRET
     */

    const authorization =
      req.headers.authorization || "";

    const providedSecret =
      authorization.startsWith("Bearer ")
        ? authorization.substring(7)
        : "";


    if (
      !providedSecret ||
      providedSecret !== setupSecret
    ) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized."
      });
    }


    /*
     * Admin credentials
     */

    const name =
      "SaveMore Admin";

    const email =
      "admin@savemore.com";

    const password =
      "SaveMore@2026";


    /*
     * Generate secure bcrypt hash.
     */

    const passwordHash =
      await bcrypt.hash(
        password,
        12
      );


    /*
     * Create admin.
     *
     * If the admin already exists,
     * its password will be updated.
     */

    const result =
      await query(
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
        (
          $1,
          $2,
          $3,
          'admin',
          true
        )

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
          is_active,
          created_at
        `,
        [
          name,
          email,
          passwordHash
        ]
      );


    /*
     * Successful response.
     */

    return res.status(200).json({
      success: true,
      message:
        "Admin account created successfully.",
      admin: result.rows[0]
    });


  } catch (error) {

    console.error(
      "Setup admin error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Could not create admin account."
    });

  }

};
