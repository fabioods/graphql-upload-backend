import { ApolloServer, gql } from 'apollo-server';
import fs from 'fs';
import path from 'path';

const typeDefs = gql`
  type File {
    filename: String!
    mimeType: String!
    encoding: String!
  }

  type Query {
    _: Boolean
  }

  type Mutation {
    singleUpload(file: Upload): File!
  }
`;

const resolvers = {
  Mutation: {
    singleUpload: (parent, args) =>
      args.file.then(file => {
        const { createReadStream, filename, mimeType } = file;
        const fileStream = createReadStream();
        const pathToUpload = path.resolve(__dirname, '..', 'upload');
        fileStream.pipe(fs.createWriteStream(`${pathToUpload}/${filename}`));
        return file;
      }),
  },
};

const server = new ApolloServer({ resolvers, typeDefs });

server.listen().then(({ url }) => {
  console.log(`Server running at ${url}`);
});
