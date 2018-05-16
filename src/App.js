import React, { Component } from 'react';
import { ApolloProvider, Query } from 'react-apollo';
import gql from 'graphql-tag';

import { ApolloClient } from 'apollo-client';
import { createHttpLink } from "apollo-link-http";
import { InMemoryCache } from 'apollo-cache-inmemory';

import StarshipList from './StarshipList';

import logo from './logo.svg';
import './App.css';


const link = createHttpLink({ uri: 'http://localhost:60806/' });
const cache = new InMemoryCache();
const apolloClientInstance = new ApolloClient({ cache, link });

const query = gql`
  query AllStarshipsQuery($pageSize: Int) {
    allStarships(first: $pageSize) @connection(key: "allStarships", filter: ["first"]) {
      pageInfo {
        hasNextPage
      }
      ...StarshipListAllStarshipsFragment
    }
  }
  ${StarshipList.fragments.allStarships}
`;


const PAGE_SIZE = 10;

class App extends Component {
  state = {
    first: PAGE_SIZE,
  };
  
  goToNextPage = () => {
    this.setState((state) => ({
      ...state,
      first: state.first + PAGE_SIZE,
    }))
  }
  
  render() {
    return (
      <ApolloProvider client={apolloClientInstance}>
        <div className="App">
          <Query query={query} variables={{
            pageSize: this.state.first,
          }}>
            {({data, error, loading}) =>
              
              error || loading || !data ? null : (
                <div>
                  {data.allStarships.pageInfo.hasNextPage && <button onClick={this.goToNextPage}>Next Page</button>}
                  <StarshipList allStarships={data.allStarships} />
                </div>
              )}
          </Query>
        </div>
      </ApolloProvider>
    );
  }
}

export default App;
