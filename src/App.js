import React, { Component } from 'react';
import { ApolloProvider, Query, Mutation } from 'react-apollo';
import gql from 'graphql-tag';

import { uniqBy } from 'lodash';
import { split } from 'apollo-link';
import { ApolloClient } from 'apollo-client';
import { createHttpLink } from "apollo-link-http";
import { InMemoryCache } from 'apollo-cache-inmemory';
import { WebSocketLink } from 'apollo-link-ws';
import { getMainDefinition } from 'apollo-utilities';

import SendMessageForm from './SendMessageForm';

import logo from './logo.svg';
import './App.css';

const wsLink = new WebSocketLink({
  uri: `ws://localhost:8008/subscriptions`,
  options: {
    reconnect: true
  }
});

const link = split(
  // split based on operation type
  ({ query }) => {
    const { kind, operation } = getMainDefinition(query);
    return kind === 'OperationDefinition' && operation === 'subscription';
  },
  wsLink,
  createHttpLink({ uri: 'http://localhost:8008/' }),
);

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

const subscription = gql`
  subscription messageAddedSubscription {
    messageAdded {
      id
      username
      messageBody
      timestamp
    }
  }
`;

const isOptimistic = (object, cacheInstance) => {
  return cacheInstance.optimistic.some(
    (transaction) => {
      return transaction.data[`${object.__typename}:${object.id}`] != null;
    }
  );
};

class Wrapper extends Component {
  componentDidMount() {
    this.unsubscribe = this.props.subscribeToMore({
      document: subscription,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev;
        const concattedMessages = [
          ...prev.messages,
          subscriptionData.data.messageAdded,
        ];
        
        const messages = uniqBy(concattedMessages, 'id')
        
        return {
          ...prev,
          messages,
        };
      }
    });
  }
  compoentWillUnmount() {
    if (this.unsubscribe) this.unsubscribe();
  }
  
  render() {
    const {
      data,
      loading,
      error,
      client
    } = this.props;
    return (
      error || loading || !data ? null : (
        <div>
          <Mutation mutation={mutation}>
            {(addMessage) => <SendMessageForm onSubmit={addMessage}
            />}
          </Mutation>
          {(data.messages || []).map((msg) => {
            return (
              <div style={{opacity: isOptimistic(msg, client.cache) ? 0.5 : 1}} key={`${msg.timestamp}${msg.username}`}>
                <h3>{msg.username}</h3>
                <h4>{msg.messageBody}</h4>
                <i>{new Date(msg.timestamp).toDateString()}</i>
              </div>
            )
          })}
        </div>
      )
    );
  }
} 

class App extends Component {
  render() {
    return (
      <ApolloProvider client={apolloClientInstance}>
        <div className="App">
          <Query query={query}>
            {({data, error, loading, refetch, client, subscribeToMore }) => ( <Wrapper {...{data, error, loading, client, subscribeToMore }}/> )}
          </Query>
        </div>
      </ApolloProvider>
    );
  }
}

export default App;
