import { graphql } from "relay-hooks";

export const appQuery = graphql`
  query appQuery($id: ID!, $contributor: Bytes!) {
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
    contributions(
      first: 10
      where: {
        requestResolved: true
        values_not: [0, 0]
        contributor: $contributor
      }
    ) {
      requestIndex
      roundIndex
      round {
        challenge {
          id
          challengeID
          request {
            submission {
              id
            }
          }
        }
      }
    }
  }
`;
