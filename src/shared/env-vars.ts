/* eslint-disable node/no-process-env */

export default {
  nodeEnv: (process.env.NODE_ENV ?? ''),
  port: (process.env.PORT ?? 0),
  folder: (process.env.FOLDER ?? 'uploads'),
  cookieProps: {
    key: 'ExpressGeneratorTs',
    secret: (process.env.COOKIE_SECRET ?? ''),
    options: {
      httpOnly: true,
      signed: true,
      path: (process.env.COOKIE_PATH ?? ''),
      maxAge: Number(process.env.COOKIE_EXP ?? 0),
      domain: (process.env.COOKIE_DOMAIN ?? ''),
      secure: (process.env.SECURE_COOKIE === 'true'),
    },
  },
  jwt: {
    secret: (process.env.JWT_SECRET ?? ''),
    exp: (process.env.JWT_TOKEN_EXP ?? '60 minutes'),
    refExp: (process.env.REFRESH_TOKEN_EXP ?? '30 days'),
  },
  aws: {
    secret: (process.env.AWS_SECRECT_ACCESS_KEY ?? ''),
    access: (process.env.AWS_ACCESS_KEY ?? ''),
    region: (process.env.AWS_REGION ?? 'us-east-1'),
    bucket: (process.env.BUCKET_NAME ?? 'bucket_name')
  },
  mongoDB: {
    url: (process.env.MONGO_CONN_URL ?? 'mongodb://localhost:27017/nearestLaundry')
  },
  mailer: {
    from: (process.env.MAIL_FROM??'noreply@nearestlaundry.com'),
    mailtrap: {
      host: (process.env.MAILTRAP_HOST ?? "sandbox.smtp.mailtrap.io"),
      port: (process.env.MAILTRAP_PORT ?? 2525),
      auth: {
        user: (process.env.MAILTRAP_USER ?? "99dc876e209230"),
        pass: (process.env.MAILTRAP_PASS ?? "04c65272f48303"),
      }
    }
  }
} as const;
