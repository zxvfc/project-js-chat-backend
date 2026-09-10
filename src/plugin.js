// @ts-check

import fastifySocketIo from '@wick_studio/fastify-socket.io';
import fastifyStatic from '@fastify/static';
import fastifyJWT from '@fastify/jwt';
import HttpErrors from 'http-errors';
import fastifyCors from '@fastify/cors';

import addRoutes from './routes.js';

const { Unauthorized } = HttpErrors;

const setUpStaticAssets = (app, buildPath) => {
  app.register(fastifyStatic, {
    root: buildPath,
  });

  app.setNotFoundHandler((req, res) => {
    res.sendFile('index.html');
  });
};

const setUpAuth = (app) => {
  // TODO add socket auth
  app
    .register(fastifyJWT, {
      secret: 'supersecret',
    })
    .decorate('authenticate', async (req, reply) => {
      try {
        await req.jwtVerify();
      } catch (_err) {
        reply.send(new Unauthorized());
      }
    });
};

export default async (app, options) => {
  // const { staticPath = 'build', ...rest } = options ?? {};
  setUpAuth(app);
  // setUpStaticAssets(app, options.staticPath);
  await app.register(fastifyCors, {
    origin: '*',
  });
  await app.register(fastifySocketIo, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    }
  });
  addRoutes(app, options?.state || {});

  return app;
};
