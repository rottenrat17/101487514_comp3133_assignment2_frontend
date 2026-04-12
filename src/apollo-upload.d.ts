declare module 'apollo-upload-client/UploadHttpLink.mjs' {
  import { ApolloLink } from '@apollo/client/link';
  export default class UploadHttpLink extends ApolloLink {
    constructor(options?: Record<string, unknown>);
  }
}
