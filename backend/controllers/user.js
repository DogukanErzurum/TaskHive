import User from "../models/user.js";
import bcrypt from "bcrypt";

const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı" });
    }
    delete user.password;

    // jfkd

    res.status(200).json(user);
  } catch (error) {
    console.error("Kullanıcı profili alınırken hata oluştu:", error);

    res.status(500).json({ message: "Sunucu hatası" });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const { name, profilePicture } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı" });
    }

    user.name = name;
    user.profilePicture = profilePicture;

    await user.save();

    res.status(200).json(user);
  } catch (error) {
    console.error("Kullanıcı profili güncellenirken hata oluştu:", error);

    res.status(500).json({ message: "Sunucu hatası" });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    const user = await User.findById(req.user._id).select("+password");

    if (!user) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı" });
    }

    if (newPassword !== confirmPassword) {
      return res
        .status(400)
        .json({ message: "Yeni şifre ile şifre tekrarı eşleşmiyor" });
    }

    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isPasswordValid) {
      return res.status(403).json({ message: "Geçersiz eski şifre" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Şifre başarıyla güncellendi" });
  } catch (error) {
    console.error("Şifre değiştirilirken hata oluştu:", error);

    res.status(500).json({ message: "Sunucu hatası" });
  }
};

export { getUserProfile, updateUserProfile, changePassword };