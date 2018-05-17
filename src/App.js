import React, { Component } from 'react';
import { ApolloProvider, Query, Mutation } from 'react-apollo';
import gql from 'graphql-tag';

import { ApolloClient } from 'apollo-client';
import { createHttpLink } from "apollo-link-http";
import { InMemoryCache } from 'apollo-cache-inmemory';

import SendMessageForm from './SendMessageForm';

import logo from './logo.svg';
import './App.css';


const link = createHttpLink({ uri: 'http://localhost:8008/' });
const cache = new InMemoryCache();
const apolloClientInstance = new ApolloClient({ cache, link });

const query = gql`
  query AllMessagesQuery {
    messages {
      id
      username
      messageBody
      timestamp
    }
  }
`;


const mutation = gql`
  mutation AddMessageMutation($username: String!, $messageBody: String!) {
    addMessage(username: $username, messageBody: $messageBody) {
      id
      username
      messageBody
      timestamp
    }
  }
`;

class App extends Component {
  render() {
    return (
      <ApolloProvider client={apolloClientInstance}>
        <div className="App">
          <Query query={query}>
            {({data, error, loading, refetch}) =>
              
              error || loading || !data ? null : (
                <div>
                  <Mutation mutation={mutation}>
                    {(addMessage) => <SendMessageForm onSubmit={addMessage}
                    />}
                  </Mutation>
                  {(data.messages || []).map((msg) => {
                    return (
                      <div style={{opacity: msg.id === 'TEMPORARY' ? 0.5 : 1}} key={`${msg.timestamp}${msg.username}`}>
                        <h3>{msg.username}</h3>
                        <h4>{msg.messageBody}</h4>
                        <i>{new Date(msg.timestamp).toDateString()}</i>
                      </div>
                    )
                  })}
                </div>
              )}
          </Query>
        </div>
      </ApolloProvider>
    );
  }
}

export default App;
