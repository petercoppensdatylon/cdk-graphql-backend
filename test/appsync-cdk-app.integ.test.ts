/**
 * Tests AppSyncCdkApp
 *
 * @group e2e
 */
import Amplify, { API } from '@aws-amplify/api';

Amplify.configure({
  aws_appsync_region: process.env.AWS_DEFAULT_REGION, // Stack region
  aws_appsync_graphqlEndpoint: process.env.API_URL, // AWS AppSync endpoint
  aws_appsync_authenticationType: "API_KEY", //Primary AWS AppSync authentication type
  aws_appsync_apiKey: process.env.API_KEY // AppSync API Key
});

describe('List Empty Notes', () => {
  it('List Notes, should be empty', async () => {
    const query = `
      query listNotes {
        listNotes {
          id name completed
        }
      }
    `
    const response = await API.graphql({ query });
    expect(response).toMatchSnapshot();
  });
});

describe('Create Note', () => {
  it('Create Note', async () => {
    const mutation = `
      mutation createNote {
        createNote(note: {
          id: "001"
          name: "My note"
          completed: false
        }) {
          id
          name
          completed
        }
      }
    `
    const response = await API.graphql({
      query: mutation
    });
    expect(response).toMatchSnapshot();
    console.log(`create note returned - ${JSON.stringify(response)}`);
  });
});

describe('Get Note By Id', () => {
  it('Get Note', async () => {
    const query = `
      query getNoteById {
        getNoteById(noteId: "001") {
          id
          name
          completed
        }
      }
    `
    const response = await API.graphql({ query });
    expect(response).toMatchSnapshot();
  });
});

describe('List Notes', () => {
  it('List Notes, should not be empty', async () => {
    const query = `
      query listNotes {
        listNotes {
          id name completed
        }
      }
    `
    const response = await API.graphql({ query });
    expect(response).toMatchSnapshot();
  });
});

describe('Update Note', () => {
  it('Update Note', async () => {
    const mutation = `
      mutation updateNote {
        updateNote(note: {
          id: "001"
          completed: true
        }) {
          id
          completed
        }
      }
    `
    const response = await API.graphql({
      query: mutation
    });
    expect(response).toMatchSnapshot();
  });
});

describe('Delete Note', () => {
  it('Delete Note', async () => {
    const mutation = `
      mutation deleteNote {
        deleteNote(noteId: "001")
      }
    `
    const response = await API.graphql({
      query: mutation
    });
    expect(response).toMatchSnapshot();
  });
});
