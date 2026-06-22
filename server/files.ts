import type { FastifyInstance } from 'fastify'

export async function registerFileRoutes(app: FastifyInstance, _contentDir: string) {
  // Stub — implemented in T3
  app.get('/api/files', async () => [])
  app.get<{ Querystring: { path?: string } }>('/api/file', async (req, reply) => {
    reply.code(501).send({ error: 'not implemented' })
  })
  app.put<{ Querystring: { path?: string }; Body: string }>('/api/file', async (req, reply) => {
    reply.code(501).send({ error: 'not implemented' })
  })
}
