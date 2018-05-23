import React, { Component } from 'react';
import { ApolloProvider, Query, Mutation } from 'react-apollo';
import gql from 'graphql-tag';

import { uniqBy } from 'lodash';
import { split } from 'apollo-link';
import { ApolloLink } from 'apollo-link';
import { ApolloClient } from 'apollo-client';
import { createHttpLink } from "apollo-link-http";
import { InMemoryCache } from 'apollo-cache-inmemory';
import { withClientState } from 'apollo-link-state';
import { WebSocketLink } from 'apollo-link-ws';
import { getMainDefinition } from 'apollo-utilities';
import MessagingApp from './MessagingApp';

import logo from './logo.svg';
import './App.css';

const wsLink = new WebSocketLink({
  uri: `ws://localhost:8008/subscriptions`,
  options: {
    reconnect: true
  }
});

const networkLink = split(
  // split based on operation type
  ({ query }) => {
    const { kind, operation } = getMainDefinition(query);
    return kind === 'OperationDefinition' && operation === 'subscription';
  },
  wsLink,
  createHttpLink({ uri: 'http://localhost:8008/' }),
);

const cache = new InMemoryCache();

cache.resetState(JSON.parse(localStorage.getItem('grxapollocache')));

const linkStateConfig = {
  cache,
  defaults: {
    username: '',
  },
  resolvers: {
    Mutation: {
      setUsername: (_, { username }, { cache }) => {
        cache.writeData({ 
          data: {
            username,
          },
        });
        return null;
      },
    }
  }
};

const link = ApolloLink.from([
  withClientState(linkStateConfig),
  networkLink,
]);

const localQuery = gql`
  query UsernameQuery {
    username @client
  }
`;

const setUsernameMutation = gql`
  mutation SetUsernameMutation($username: String) {
    setUsername(username: $username) @client
  }
`;

const apolloClientInstance = new ApolloClient({ cache, link });

class App extends Component {
  render() {
    return (
      <ApolloProvider client={apolloClientInstance}>
        <Query query={localQuery}>
          {({ data, error, loading}) => {
            if (error || loading) return null;
            
            if (data && data.username) {
              return (
                <div className="App">
                  <MessagingApp username={data.username} />
                </div>
              );
            }
            
            let typedUsername = '';
            
            return (
              <Mutation mutation={setUsernameMutation}>
                {(setUsername) => {
                  return (
                    <div className="App">
                      <input
                        type="text"
                        onChange={(event) => {
                          typedUsername = event.target.value
                        }}
                        placeholder="username..."
                      />
                      <button
                        onClick={() => {
                          typedUsername && setUsername({
                            variables: {
                              username: typedUsername,
                            },
                          });
                        }}
                      >
                        login
                      </button>
                    </div>
                  );
                  
                }}
              </Mutation>
            );
            
          }}
        </Query>
      </ApolloProvider>
    );
  }
}

export default App;
