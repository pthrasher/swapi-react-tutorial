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
        <ul>
          <li>Model: {model}</li>
          <li>Starship Class: {starshipClass}</li>
          <li>Cost In Credits: {costInCredits}</li>
          <li>Hyper Drive Rating: {hyperdriveRating}</li>
        </ul>
      </div>
    );
  }
}


export default StarshipListItem;
