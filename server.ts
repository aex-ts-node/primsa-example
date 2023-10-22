import { Aex, compact } from "@aex/core";
import { PrismaClient } from "@prisma/client";

class HelloAex {
  @compact("/")
  public async hello(ctx:any) {
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

const prismaClient = new PrismaClient();
const aex = new Aex();
let port = 8081;

aex.use(async (_, __, scope: any) => {
  await prismaClient.$connect();
  scope.orm = {};
  Object.defineProperty(scope.orm, "prisma", {
    value: prismaClient,
  });
});

aex.push(HelloAex);

aex
  .prepare()
  .start(port)
  .then(() => {
    console.log("Server started at http://localhost:" + port + "/");
  })
  .finally(async () => {
    await prismaClient.$disconnect();
  });
