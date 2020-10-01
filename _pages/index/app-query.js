import { graphql } from "relay-hooks";

export const appQuery = graphql`
  query appQueryQuery($id: ID!) {
    submission(id: $id) {
      name
    }
  }
`;
