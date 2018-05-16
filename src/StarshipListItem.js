import React, { Component } from 'react';
import gql from 'graphql-tag';
import { propType } from 'graphql-anywhere';

const starshipListItemNodeFragment = gql`
  fragment StarshipListItemNodeFragment on Starship {
    id
    name
    model
    starshipClass
    costInCredits
    hyperdriveRating
  }
`;

class StarshipListItem extends Component {
  static fragments = {
    node: starshipListItemNodeFragment,
  };
  
  static propTypes = {
    node: propType(starshipListItemNodeFragment),
  };
  
  render() {
    const {
      node: {
        name,
        model,
        starshipClass,
        costInCredits,
        hyperdriveRating,
      } = {},
    } = this.props;
    return (
      <div>
        <h1>Name: {name}</h1>
        <dl>
          <dt>Model:</dt><dd>{model}</dd>
          <dt>Starship Class:</dt><dd>{starshipClass}</dd>
          <dt>Cost In Credits:</dt><dd>{costInCredits}</dd>
          <dt>Hyper Drive Rating:</dt><dd>{hyperdriveRating}</dd>
        </dl>
      </div>
    );
  }
}


export default StarshipListItem;
