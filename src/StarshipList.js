import React, { Component } from 'react';
import gql from 'graphql-tag';
import StarshipListItem from './StarshipListItem';
import { propType } from 'graphql-anywhere';

const starshipListAllStarshipsFragment = gql`
  fragment StarshipListAllStarshipsFragment on StarshipsConnection {
    edges {
      node {
        ...StarshipListItemNodeFragment
      }
    }
  }
  ${StarshipListItem.fragments.node}
`;

class StarshipList extends Component {
  static fragments = {
    allStarships: starshipListAllStarshipsFragment,
  };
  
  static propTypes = {
    allStarships: propType(starshipListAllStarshipsFragment),
  };
  
  render() {
    return (this.props.allStarships.edges || []).map(
      ({ node }) => <StarshipListItem node={node} />
    );
  }
}


export default StarshipList;
