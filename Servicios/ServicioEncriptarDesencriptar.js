// Encriptador.js
import dotenv from "dotenv";
dotenv.config();
import crypto from "crypto";

export default class Encriptador {
  constructor(secret, salt = "salt_default") {
    if (!secret || !salt) {
      throw new Error("Faltan ENCRYPTION_SECRET o ENCRYPTION_SALT en el archivo .env");
    }

    this.secret = secret;
    this.salt = salt;
    this.algoritmo = "aes-256-cbc";
  }

  getKey() {
    return crypto.scryptSync(this.secret, this.salt, 32);
  }

  cifrar(texto) {
    if (texto === null || texto === undefined) return texto;
    const iv = crypto.randomBytes(16);
    const key = this.getKey();
    const cipher = crypto.createCipheriv(this.algoritmo, key, iv);
    let encrypted = cipher.update(String(texto), "utf8", "hex");
    encrypted += cipher.final("hex");
    return iv.toString("hex") + ":" + encrypted;
  }

  descifrar(data) {
    if (data === null || data === undefined) return data;
    try {
      if (!data.includes(":")) return data;
      const [ivHex, encrypted] = data.split(":");
      const iv = Buffer.from(ivHex, "hex");
      const key = this.getKey();
      const decipher = crypto.createDecipheriv(this.algoritmo, key, iv);
      let decrypted = decipher.update(encrypted, "hex", "utf8");
      decrypted += decipher.final("utf8");
      return decrypted;
    } catch (err) {
      console.error("Error al descifrar:", err);
      return data;
    }
  }
}
