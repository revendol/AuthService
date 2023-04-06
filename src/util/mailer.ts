import nodemailer from "nodemailer";
import envVars from "@shared/env-vars";

interface IAttachments {
  filename: string,
  path: string,
  contentType: string
}

class Mailer {
  private transport = nodemailer.createTransport({
    host: envVars.mailer.mailtrap.host,
    port: +envVars.mailer.mailtrap.port,
    auth: envVars.mailer.mailtrap.auth
  });

  async mail(to: string, subject: string, html: string, attachments: IAttachments[] = []) {
    this.transport.sendMail({
      from: envVars.mailer.from,
      to: to,
      subject: subject,
      html: html,
      attachments: attachments
    }, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
  }
}

export default new Mailer();