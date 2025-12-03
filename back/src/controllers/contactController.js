const storage = require('../services/storage');
const nodemailer = require('nodemailer');
const config = require('../config');

async function sendContact(req, res) {
  try {
    const { name, email, subject, message } = req.body;

    // Validation
    if (!name || !email || !message) {
      return res.status(400).json({ 
        ok: false, 
        error: 'Nom, email et message sont requis' 
      });
    }

    // Email validation simple
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        ok: false, 
        error: 'Email invalide' 
      });
    }

    // Sauvegarder le message dans la base de données
    const contactMessage = {
      name,
      email,
      subject: subject || 'Contact depuis le portfolio',
      message,
      timestamp: new Date().toISOString()
    };

    await storage.saveContactMessage(contactMessage);

    // Envoyer l'email si la configuration est définie
    if (config.emailUser && config.emailPassword && config.contactEmail) {
      try {
        const transporter = nodemailer.createTransport({
          service: config.emailService || 'gmail',
          auth: {
            user: config.emailUser,
            pass: config.emailPassword
          }
        });

        const mailOptions = {
          from: config.emailUser,
          to: config.contactEmail,
          subject: `[Portfolio Contact] ${subject || 'Nouveau message'}`,
          html: `
            <h2>Nouveau message de contact</h2>
            <p><strong>Nom:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Sujet:</strong> ${subject || 'N/A'}</p>
            <p><strong>Message:</strong></p>
            <p>${message.replace(/\n/g, '<br>')}</p>
            <hr>
            <p><small>Reçu le ${new Date().toLocaleString('fr-FR')}</small></p>
          `
        };

        await transporter.sendMail(mailOptions);
        console.log('Email de contact envoyé avec succès');
      } catch (emailErr) {
        console.error('Erreur lors de l\'envoi de l\'email:', emailErr);
        // On continue même si l'email échoue, le message est sauvegardé
      }
    } else {
      console.warn('Configuration email manquante, email non envoyé');
    }

    res.json({ 
      ok: true, 
      message: 'Message envoyé avec succès' 
    });

  } catch (err) {
    console.error('contactController.sendContact error', err);
    res.status(500).json({ 
      ok: false, 
      error: 'Erreur lors de l\'envoi du message' 
    });
  }
}

async function listContacts(req, res) {
  try {
    const contacts = await storage.getContactMessages();
    res.json({ ok: true, contacts });
  } catch (err) {
    console.error('contactController.listContacts error', err);
    res.status(500).json({ ok: false, error: err.message });
  }
}

module.exports = { sendContact, listContacts };
