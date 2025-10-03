import React, { useState } from 'react';
import { useMutation, useLazyQuery, gql } from '@apollo/client';

const CREATE_EPHEMERAL_EMAIL = gql`
  mutation CreateEphemeralEmail {
    createEphemeralEmail {
      address
      password
    }
  }
`;

const GET_EPHEMERAL_MESSAGES = gql`
  query GetEphemeralMessages($address: String!, $password: String!) {
    getEphemeralMessages(address: $address, password: $password) {
      id
      from {
        address
        name
      }
      subject
      intro
      createdAt
    }
  }
`;

const EphemeralEmailPage: React.FC = () => {
  const [email, setEmail] = useState<string | null>(null);
  const [password, setPassword] = useState<string | null>(null);

  const [createEmail, { loading: creatingEmail }] = useMutation(CREATE_EPHEMERAL_EMAIL, {
    onCompleted: (data) => {
      setEmail(data.createEphemeralEmail.address);
      setPassword(data.createEphemeralEmail.password);
    },
  });

  const [getMessages, { loading: fetchingMessages, data: messagesData }] = useLazyQuery(GET_EPHEMERAL_MESSAGES);

  const handleCreateEmail = () => {
    createEmail();
  };

  const handleFetchMessages = () => {
    if (email && password) {
      getMessages({ variables: { address: email, password } });
    }
  };

  const messages = messagesData?.getEphemeralMessages || [];

  return (
    <div>
      <h1>Ephemeral Email</h1>
      <button onClick={handleCreateEmail} disabled={creatingEmail}>
        {creatingEmail ? 'Generating...' : 'Generate New Email'}
      </button>

      {email && (
        <div>
          <h2>Your Temporary Email</h2>
          <p>
            <strong>Address:</strong> {email}
          </p>
          <p>
            <strong>Password:</strong> {password}
          </p>
          <button onClick={handleFetchMessages} disabled={fetchingMessages}>
            {fetchingMessages ? 'Fetching...' : 'Fetch Messages'}
          </button>
        </div>
      )}

      {messages.length > 0 && (
        <div>
          <h2>Messages</h2>
          <ul>
            {messages.map((message: any) => (
              <li key={message.id}>
                <p>
                  <strong>From:</strong> {message.from.address}
                </p>
                <p>
                  <strong>Subject:</strong> {message.subject}
                </p>
                <p>{message.intro}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default EphemeralEmailPage;