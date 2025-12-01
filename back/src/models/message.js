// Minimal message model (for reference)
class Message {
  constructor({ id, user, text, ts }) {
    this.id = id;
    this.user = user;
    this.text = text;
    this.ts = ts || Date.now();
  }
}

module.exports = Message;
