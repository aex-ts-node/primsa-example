import { Aex, compact } from "@aex/core";
import { PrismaClient } from "@prisma/client";

class HelloAex {
  @compact("/")
  public async hello(ctx: any) {
    const {
      prisma,
    }: {
      prisma: PrismaClient;
    } = ctx.scope.orm;
    const users = prisma.user.findMany({});
    ctx.res.json(users);
    return;
  }
}

const prisma = new PrismaClient();

const prismaMiddleware = (function (prismaClient) {
  return async (_, __, scope) => {
    await prismaClient.$connect();
    scope.orm = {};
    Object.defineProperty(scope.orm, "prisma", {
      value: prismaClient,
    });
  }
})(prisma);


const aex = new Aex();
let port = 8081;

aex.use(prismaMiddleware);

aex.push(HelloAex);

aex
  .prepare()
  .start(port)
  .then(() => {
    console.log("Server started at http://localhost:" + port + "/");
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
