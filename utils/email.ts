import {
  googleID,
  googleSecret,
  googleRedirect,
  googleToken,
} from "./constant";
import nodemailer from "nodemailer";
import ejs from "ejs";
import { google } from "googleapis";
import path from "path";
import { config } from "dotenv";
config();

const oAuth = new google.auth.OAuth2({
  clientId: googleID,
  clientSecret: googleSecret,
  redirectUri: googleRedirect,
});

oAuth.setCredentials({ refresh_token: googleToken });

export const sendEmail = async (
  to: string,
  subject: string,
  templateName: string,
  data: object
) => {
  try {
    const accessToken = (await oAuth.getAccessToken())!.token!;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        clientId: googleID,
        clientSecret: googleSecret,
        type: "OAuth2",
        user: "abbeyrufai234@gmail.com",
        refreshToken: googleToken,
        accessToken,
      },
    });

    const templatePath = path.join(
      __dirname,
      "../views",
      `${templateName}.ejs`
    );

    const html = await ejs.renderFile(templatePath, data);

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      html,
    };

    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully");
  } catch (error) {
    console.log("Error sending email:", error);
  }
};
