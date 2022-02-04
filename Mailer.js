import nodemailer from 'nodemailer';
import prompt from 'prompt';
import config from './config.js';

export default class MailNotifier {
  transporter;
  from = '"Ubiquiti Checker 👻"';
  to;

  constructor(transporter, to) {
    this.transporter = transporter;
    this.to = to;
  }

  static async build () {
    prompt.start();
    const transportConf = await prompt.get([
      { name: 'to', description: 'Send Notifications To', default: config.sendTo },
      { name: 'host', description: 'SMTP Host', default: config.smtpHost },
      { name: 'port', description: 'SMTP Port', default: config.smtpPort, type: 'number' },
      { name: 'username', description: 'SMTP Username', required: true },
      { name: 'password', description: 'SMTP Password', reqired: true, hidden: true, },
    ]);
    
    const transporter = nodemailer.createTransport({
      host: transportConf.host,
      port: transportConf.port,
      secure: transportConf.port === 465,
      auth: {
        user: transportConf.username,
        pass: transportConf.password
      },
    });

    return new MailNotifier(transporter, transportConf.to);
  }

  async verifyConfig () {
    if (!config.sendMailNotifications) { return true; }

    return await this.transporter.verify().then(() => { return true; })
    .catch(() => { return false; });
  }

  async send (subject, text) {
    return await this.transporter.sendMail({
      from: this.from,
      to: this.to,
      subject,
      text,
    });
  }
}8