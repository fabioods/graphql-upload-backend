import { gql } from 'apollo-server';
import { ApolloServer } from 'apollo-server-express';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import express from 'express';
import bytea from 'postgres-bytea';
import toArray from 'stream-to-array';

const typeDefs = gql`
  type File {
    filename: String!
    mimetype: String!
    encoding: String!
    base64: String!
  }

  type Query {
    _: Boolean
  }

  type Mutation {
    singleUpload(files: [Upload!]): [File!]
  }
`;

const resolvers = {
  Mutation: {
    singleUpload: (parent, args) => {
      const files = args.files.map(async file => {
        const resolver = await file;
        const { createReadStream, filename, mimetype } = resolver;
        const fileStream = createReadStream();
        const arrayFromBuffer = await toArray(fileStream);
        const bufferToBase64 = Buffer.concat(arrayFromBuffer).toString(
          'base64',
        );

        const pathToUpload = path.resolve(__dirname, '..', 'upload');
        fileStream.pipe(fs.createWriteStream(`${pathToUpload}/${filename}`));
        return { ...resolver, base64: bufferToBase64 };
      });
      return files;
    },
  },
};
const app = express();
app.use(cors());
const server = new ApolloServer({ resolvers, typeDefs });
server.applyMiddleware({ app });
app.listen(4000, () => console.log('Serviço rodando na porta 4000'));
