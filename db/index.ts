import "reflect-metadata"
import { Connection, getConnection, createConnection} from 'typeorm'
import { User, UserAuth, Article, Comment, Tag, Follow, Notification } from "./entity/index";

const host = process.env.DATABASE_HOST;
const port = Number(process.env.DATABASE_PORT);
const username = process.env.DATABASE_USERNAME;
const password = process.env.DATABASE_PASSWORD;
const database = process.env.DATABASE_NAME;

let connectReadyPromise: Promise<Connection> | null = null;

export const prepareConnection = () => {
  if (!connectReadyPromise) {
    connectReadyPromise = (async () => {
      try {
        const staleConnection = getConnection()
        await staleConnection.close()
      } catch (error) {
        console.log(error)
      }
      const connection = await createConnection({
        type: 'mysql',
        host,
        port,
        username,
        password,
        database,
        entities: [User, UserAuth, Article, Comment, Tag, Follow, Notification],
        synchronize: false,
        logging: true
      })

      return connection;
    })()
  }
  return connectReadyPromise
}
