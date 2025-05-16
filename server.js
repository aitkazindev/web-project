const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");
const { Resend } = require("resend");
require("dotenv").config();

const resend = new Resend(process.env.RESEND_API_KEY);
const app = express();

// Serve static files from "public"
app.use(express.static(path.join(__dirname, "public")));
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post("/send-email", async (req, res) => {
  const formType = req.body["form-name"]; // This will be either "company-form" or "influencer-form"
  const {
    full_name,
    email,
    phone,
    message,
    subscribe,
    agree,
    // Company form specific fields
    company_name,
    company_url,
    country,
    industry,
    budget,
    referral,
    // Influencer form specific fields
    instagram,
    tiktok,
    youtube,
    platform,
    followers,
  } = req.body;

  try {
    let emailSubject = `New ${formType === "company-form" ? "Company" : "Influencer"} Inquiry from ${full_name}`;
    let emailHtml = `
      <h3>New ${formType === "company-form" ? "Company" : "Influencer"} Contact Form Submission</h3>
      <p><strong>Name:</strong> ${full_name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone || "N/A"}</p>
      <p><strong>Message:</strong><br>${message}</p>
      <p><strong>Subscribe to Updates:</strong> ${subscribe ? "Yes" : "No"}</p>
    `;

    // Add company-specific fields if it's a company form
    if (formType === "company-form") {
      emailHtml += `
        <p><strong>Company:</strong> ${company_name}</p>
        <p><strong>Website:</strong> ${company_url}</p>
        <p><strong>Country:</strong> ${country}</p>
        <p><strong>Industry:</strong> ${industry}</p>
        <p><strong>Budget:</strong> ${budget}</p>
        <p><strong>Referral:</strong> ${referral || "N/A"}</p>
      `;
    }

    // Add influencer-specific fields if it's an influencer form
    if (formType === "influencer-form") {
      emailHtml += `
        <p><strong>Instagram:</strong> ${instagram || "N/A"}</p>
        <p><strong>TikTok:</strong> ${tiktok || "N/A"}</p>
        <p><strong>YouTube:</strong> ${youtube || "N/A"}</p>
        <p><strong>Main Platform:</strong> ${platform}</p>
        <p><strong>Follower Count:</strong> ${followers}</p>
      `;
    }

    const data = await resend.emails.send({
      from: "G3 Global <onboarding@resend.dev>",
      to: [process.env.TO_EMAIL],
      subject: emailSubject,
      html: emailHtml,
    });
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Email sending error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
