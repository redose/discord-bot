import path from 'node:path';
import fs from 'node:fs/promises';
import { createTransport, SentMessageInfo } from 'nodemailer';
import mjml from 'mjml';
import Handlebars from 'handlebars';
import type { Logger } from 'winston';
import {
  SMTP_SECURE,
  SMTP_HOST,
  SMTP_USER,
  SMTP_PASSWORD,
  SMTP_PORT,
} from '../env';

type SendEmail<ViewData> = (viewData: ViewData) => Promise<SentMessageInfo>;
interface Emails {
  verify: SendEmail<{ verifyUrl: string }>;
}

const TEMPLATE_NAMES: Array<keyof Emails> = [
  'verify',
];

export default async function createMailService(logger: Logger) {
  const transport = createTransport({
    secure: SMTP_SECURE,
    host: SMTP_HOST,
    port: SMTP_PORT,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASSWORD,
    },
  });

  async function compileTemplate<ViewData>(templateName: string) {
    const templatePath = path.join(__dirname, 'templates', `${templateName}.mjml.hbs`);
    const contents = await fs.readFile(templatePath, 'utf-8');
    const template = Handlebars.compile<ViewData>(contents);

    return async (to: string, from: string, viewData: ViewData) => transport.sendMail({
      to,
      from,
      html: mjml(template(viewData), {
        filePath: path.join(__dirname, 'includes'),
      })
        .html,
    });
  }

  return {
    send: Object.fromEntries(await Promise.all(TEMPLATE_NAMES
      .map((name) => compileTemplate(name)
        .then((send) => [name, send])
        .catch((ex) => {
          logger.error('Failed to compile template:', ex);
          return Promise.reject(ex);
        })))),

    async close() {
      return transport.close();
    },
  };
}
