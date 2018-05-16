import React, { Component } from 'react';
import gql from 'graphql-tag';
import StarshipListItem from './StarshipListItem';
import { propType } from 'graphql-anywhere';

class StarshipList extends Component {
  static fragments = {
    allStarships: starshipListAllStarshipsFragment,
  };
  
  static propTypes = {
    allStarships: propType(starshipListAllStarshipsFragment),
  };
  
  render() {
    return (
      <div>
        {hasNextPage ? <button onClick={this.props.goToNextPage}>Next Page</button> : null}
        {this.props.children}
      </div>
    )
  }
}


export default StarshipList;
