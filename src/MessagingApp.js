import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Query, Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import { uniqBy } from 'lodash';

import SendMessageForm from './SendMessageForm';

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
      client,
      username,
    } = this.props;
    return (
      error || loading || !data ? null : (
        <div>
          <Mutation mutation={mutation}>
            {(addMessage) => <SendMessageForm username={username} onSubmit={addMessage}
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

const MessagingApp = ({username}) => (
  <Query query={query}>
    {({data, error, loading, refetch, client, subscribeToMore }) => ( <Wrapper {...{username, data, error, loading, client, subscribeToMore }}/> )}
  </Query>
);

MessagingApp.propTypes = {
  username: PropTypes.string.isRequired,
};

export default MessagingApp;
