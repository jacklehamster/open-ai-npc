import express from "express";
import multer from "multer";
import mime from "mime-types";
import { AuthManager, AuthProvider, NewgroundsAuthenticator, SecretAuthenticator } from "dok-auth";
import { CacheWrap, createRedisClient } from "@dobuki/data-client";
import { GithubDb, OWNER, REPO } from "./github/getGithub";
import { RedisLock } from "@dobuki/code-lock";


export function addLevelRoutes(app: express.Express) {
  app.use(express.json());

  const redisClient = createRedisClient();
  const github = new CacheWrap(redisClient, new GithubDb({ lock: new RedisLock(redisClient) }));

  function cleanData(data: Record<string, any>) {
    for (let key in data) {
      if (data[key] === null || data[key] === undefined) {
        delete data[key];
      }
    }
    return data;
  }

  const auth = new AuthManager(
    new AuthProvider(redisClient),
    [
      new NewgroundsAuthenticator({
        game: "The Supernatural Power Troll",
        url: "https://www.newgrounds.com/projects/games/5648862/preview",
        key: process.env.NEWGROUND_KEY!,
        skey: process.env.NEWGROUND_SKEY!,
      }),
      new SecretAuthenticator({
        secretWord: process.env.SECRET_WORD!,
      }),
    ],
  );


  // Configure multer for file storage
  const storage = multer.memoryStorage();

  const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
    fileFilter: (req, file, cb) => {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.mimetype)) {
        return cb(new Error('Invalid file type.'));
      }
      cb(null, true);
    }
  });

  // Convert buffer to stream (helper function)

  // Route to handle image upload and save
  app.post('/save-image', upload.single('image'), async (req, res) => {
    const query = req.query as {
      user: string;
      token?: string;
      session?: string;
      secret?: string;
    };
    const authResult = await auth.authenticatePayload({
      userId: query.user,
      authToken: query.token,
      session: query.session,
      secret: req.body.secret,
    });
    if (!authResult.authToken) {
      return res.json({ success: false, message: "Unauthorized", authResult });
    }
    try {
      if (!req.file) {
        return res.status(400).send('No file uploaded.');
      }
      const filename = req.body.filename;
      // Get the image buffer from the file
      const { buffer, mimetype } = req.file;

      // Convert the buffer to a Blob-like structure
      const saveResult = await github.setData(
        `image/${filename}.${mime.extension(mimetype)}`,
        new Blob([buffer], { type: mimetype })
      );
      return res.send({
        message: 'Uploaded', ...authResult,
        url: `https://${OWNER}.github.io/${REPO}/data/image/${filename}.${mime.extension(mimetype)}`,
        saveResult,
      });
    } catch (error) {
      console.error('Error processing request:', error);
      res.status(500).send('Error processing request.');
    }
  });

  app.get("/list", async (req, res) => {
    const subfolder = req.query.subfolder?.toString();
    const branch = req.query.branch?.toString();
    const recursive = req.query.recursive !== "false";
    return res.json(await github.listKeys(subfolder, branch, recursive));
  });

  app.get("/data/*", async (req, res) => {
    const path = (req.params as string[])[0];
    return res.json({
      ...(await github.getData(path) ?? {}),
      url: `https://${OWNER}.github.io/${REPO}/data/${path}`,
    });
  });

  interface DataQuery {
    user?: string;
    token?: string;
    session?: string;
    secret?: string;
  }

  app.put("/data/*", async (req, res) => {
    const path = (req.params as string[])[0];
    const query = req.query as DataQuery;
    const body = req.body;
    const authResult = await auth.authenticatePayload({
      userId: query.user,
      authToken: query.token,
      session: query.session,
      secret: query.secret,
    });
    if (!authResult.authToken) {
      return res.json({ success: false, message: "Unauthorized" });
    }

    const result = await github.setData(path, (data: any) => cleanData({
      ...data.data,
      ...(body ?? {}),
    }));

    return res.json({ ...result, ...authResult });
  });
}
