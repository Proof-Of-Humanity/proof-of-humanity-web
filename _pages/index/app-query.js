import { graphql } from "relay-hooks";

export const appQuery = graphql`
  query appQueryQuery($id: ID!) {
    submission(id: $id) {
      status
      registered
      requests(
        orderBy: creationTime
        orderDirection: desc
        first: 1
        where: { registration: true }
      ) {
        evidence(orderBy: creationTime, first: 1) {
          URI
        }
      }
    }
  }
`;
