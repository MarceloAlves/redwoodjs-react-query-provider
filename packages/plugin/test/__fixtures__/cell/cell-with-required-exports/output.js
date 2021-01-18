import { withRQCell } from '@rwjsexperiments/react';
export const RQUERY = gql`
  query {
    posts {
      id
      title
      body
    }
  }
`;
export const beforeQuery = () => ({});
export const afterQuery = () => ({});
export function Loading() {
  return 'Loading';
}
export function Fetching() {
  return 'Fetching';
}
export function Empty() {
  return 'Empty';
}
export function Failure({ error }) {
  return error.message;
}
export const Success = ({ posts }) => {
  return JSON.stringify(posts, null, 2);
};
export default withRQCell({
  QUERY: RQUERY,
  beforeQuery,
  afterQuery,
  Loading,
  Fetching,
  Empty,
  Failure,
  Success,
});
