import User from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Verification from "../models/verification.js";
import { sendEmail } from "../libs/send-email.js";
import aj from "../libs/arcjet.js";

const registerUser = async (req, res) => {
  try {
    const { email, name, password } = req.body;

    const decision = await aj.protect(req, { email });
    console.log("Arcjet kararı", decision.isDenied());

    if (decision.isDenied()) {
      res.writeHead(403, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "Geçersiz e-posta adresi" }));
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "Bu e-posta adresi zaten kullanımda",
      });
    }

    const salt = await bcrypt.genSalt(10);

    const hashPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      email,
      password: hashPassword,
      name,
    });

    const verificationToken = jwt.sign(
      { userId: newUser._id, purpose: "email-verification" },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    await Verification.create({
      userId: newUser._id,
      token: verificationToken,
      expiresAt: new Date(Date.now() + 1 * 60 * 60 * 1000),
    });

    // send email
    const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    const emailBody = `<p>E-postanızı doğrulamak için <a href="${verificationLink}">buraya</a> tıklayın</p>`;
    const emailSubject = "E-posta Doğrulama";

    const isEmailSent = await sendEmail(email, emailSubject, emailBody);

    if (!isEmailSent) {
      return res.status(500).json({
        message: "Doğrulama e-postası gönderilemedi",
      });
    }

    res.status(201).json({
      message:
        "Doğrulama e-postası gönderildi. Lütfen e-postanızı kontrol ederek hesabınızı doğrulayın.",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({ message: "Sunucu hatası" });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(400).json({ message: "E-posta veya şifre hatalı" });
    }

    if (!user.isEmailVerified) {
      const existingVerification = await Verification.findOne({
        userId: user._id,
      });

      if (existingVerification && existingVerification.expiresAt > new Date()) {
        return res.status(400).json({
          message:
            "E-posta doğrulanmamış. Lütfen doğrulama bağlantısı için e-postanızı kontrol edin.",
        });
      } else {
        await Verification.findByIdAndDelete(existingVerification._id);

        const verificationToken = jwt.sign(
          { userId: user._id, purpose: "email-verification" },
          process.env.JWT_SECRET,
          { expiresIn: "1h" }
        );

        await Verification.create({
          userId: user._id,
          token: verificationToken,
          expiresAt: new Date(Date.now() + 1 * 60 * 60 * 1000),
        });

        // send email
        const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
        const emailBody = `<p>E-postanızı doğrulamak için <a href="${verificationLink}">buraya</a> tıklayın.</p>`;
        const emailSubject = "E-posta Doğrulama";

        const isEmailSent = await sendEmail(email, emailSubject, emailBody);

        if (!isEmailSent) {
          return res.status(500).json({
            message: "Doğrulama e-postası gönderilemedi",
          });
        }

        res.status(201).json({
          message:
            "Doğrulama e-postası gönderildi. Lütfen e-postanızı kontrol ederek hesabınızı doğrulayın.",
        });
      }
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({ message: "E-posta veya şifre hatalı" });
    }

    const token = jwt.sign(
      { userId: user._id, purpose: "login" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    user.lastLogin = new Date();
    await user.save();

    const userData = user.toObject();
    delete userData.password;

    res.status(200).json({
      message: "Giriş Başarılı",
      token,
      user: userData,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({ message: "Sunucu Hatası" });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;

    const payload = jwt.verify(token, process.env.JWT_SECRET);

    if (!payload) {
      return res.status(401).json({ message: "Yetkisiz işlem" });
    }

    const { userId, purpose } = payload;

    if (purpose !== "email-verification") {
      return res.status(401).json({ message: "Yetkisiz işlem" });
    }

    const verification = await Verification.findOne({
      userId,
      token,
    });

    if (!verification) {
      return res.status(401).json({ message: "Yetkisiz işlem" });
    }

    const isTokenExpired = verification.expiresAt < new Date();

    if (isTokenExpired) {
      return res.status(401).json({ message: "Token süresi dolmuş" });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(401).json({ message: "Yetkisiz işlem" });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ message: "E-posta zaten doğrulanmış" });
    }

    user.isEmailVerified = true;
    await user.save();

    await Verification.findByIdAndDelete(verification._id);

    res.status(200).json({ message: "E-posta başarıyla doğrulandı" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Sunucu hatası" });
  }
};

const resetPasswordRequest = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Kullanıcı bulunamadı" });
    }

    if (!user.isEmailVerified) {
      return res
        .status(400)
        .json({ message: "Lütfen önce e-posta adresinizi doğrulayın" });
    }

    const existingVerification = await Verification.findOne({
      userId: user._id,
    });

    if (existingVerification && existingVerification.expiresAt > new Date()) {
      return res.status(400).json({
        message: "Şifre sıfırlama isteği zaten gönderildi",
      });
    }

    if (existingVerification && existingVerification.expiresAt < new Date()) {
      await Verification.findByIdAndDelete(existingVerification._id);
    }

    const resetPasswordToken = jwt.sign(
      { userId: user._id, purpose: "reset-password" },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    await Verification.create({
      userId: user._id,
      token: resetPasswordToken,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    });

    const resetPasswordLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetPasswordToken}`;
    const emailBody = `<p>E-postanızı doğrulamak için <a href="${resetPasswordLink}">buraya</a> tıklayın.</p>`;
    const emailSubject = "E-posta Doğrulama";

    const isEmailSent = await sendEmail(email, emailSubject, emailBody);

    if (!isEmailSent) {
      return res.status(500).json({
        message: "Doğrulama e-postası gönderilemedi",
      });
    }

    res.status(200).json({ message: "Şifre sıfırlama e-postası gönderildi" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Sunucu hatası" });
  }
};

const verifyResetPasswordTokenAndResetPassword = async (req, res) => {
  try {
    const { token, newPassword, confirmPassword } = req.body;

    const payload = jwt.verify(token, process.env.JWT_SECRET);

    if (!payload) {
      return res.status(401).json({ message: "Yetkisiz işlem" });
    }

    const { userId, purpose } = payload;

    if (purpose !== "reset-password") {
      return res.status(401).json({ message: "Yetkisiz işlem" });
    }

    const verification = await Verification.findOne({
      userId,
      token,
    });

    if (!verification) {
      return res.status(401).json({ message: "Yetkisiz işlem" });
    }

    const isTokenExpired = verification.expiresAt < new Date();

    if (isTokenExpired) {
      return res.status(401).json({ message: "Token süresi dolmuş" });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(401).json({ message: "Yetkisiz işlem" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Şifreler eşleşmiyor" });
    }

    const salt = await bcrypt.genSalt(10);

    const hashPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashPassword;
    await user.save();

    await Verification.findByIdAndDelete(verification._id);

    res.status(200).json({ message: "Şifre başarıyla sıfırlandı" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Sunucu hatası" });
  }
};
export {
  registerUser,
  loginUser,
  verifyEmail,
  resetPasswordRequest,
  verifyResetPasswordTokenAndResetPassword,
};