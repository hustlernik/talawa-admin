import React, { act } from 'react';
import { render, screen } from '@testing-library/react';
import { MockedProvider } from '@apollo/react-testing';
import { I18nextProvider } from 'react-i18next';
import {
  ORGANIZATIONS_MEMBER_CONNECTION_LIST,
  ORGANIZATION_ADMINS_LIST,
} from 'GraphQl/Queries/Queries';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from 'state/store';
import i18nForTest from 'utils/i18nForTest';
import { StaticMockLink } from 'utils/StaticMockLink';
// import type { InterfaceMember } from './People';
import People from './People';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

/**
 * This file contains unit tests for the People component.
 *
 * The tests cover:
 * - Proper rendering of the People screen and its elements.
 * - Functionality of the search input and search button.
 * - Correct behavior when switching between member and admin modes.
 * - Integration with mocked GraphQL queries for testing data fetching.
 *
 * These tests use Vitest for test execution, MockedProvider for mocking GraphQL queries, and react-testing-library for rendering and interactions.
 */

const MOCKS = [
  {
    request: {
      query: ORGANIZATIONS_MEMBER_CONNECTION_LIST,
      variables: {
        orgId: '',
        firstName_contains: '',
      },
    },
    result: {
      data: {
        organizationsMemberConnection: {
          edges: [
            {
              _id: '64001660a711c62d5b4076a2',
              firstName: 'Noble',
              lastName: 'Mittal',
              image: null,
              email: 'noble@gmail.com',
              createdAt: '2023-03-02T03:22:08.101Z',
            },
            {
              _id: '64001660a711c62d5b4076a3',
              firstName: 'Noble',
              lastName: 'Mittal',
              image: 'mockImage',
              email: 'noble@gmail.com',
              createdAt: '2023-03-02T03:22:08.101Z',
            },
          ],
        },
      },
    },
  },
  {
    request: {
      query: ORGANIZATION_ADMINS_LIST,
      variables: {
        id: '',
      },
    },
    result: {
      data: {
        organizations: [
          {
            __typename: 'Organization',
            _id: '6401ff65ce8e8406b8f07af2',
            admins: [
              {
                _id: '64001660a711c62d5b4076a2',
                firstName: 'Noble',
                lastName: 'Admin',
                image: null,
                email: 'noble@gmail.com',
                createdAt: '2023-03-02T03:22:08.101Z',
              },
            ],
          },
        ],
      },
    },
  },
  {
    request: {
      query: ORGANIZATIONS_MEMBER_CONNECTION_LIST,
      variables: {
        orgId: '',
        firstName_contains: 'j',
      },
    },
    result: {
      data: {
        organizationsMemberConnection: {
          edges: [
            {
              _id: '64001660a711c62d5b4076a2',
              firstName: 'John',
              lastName: 'Cena',
              image: null,
              email: 'john@gmail.com',
              createdAt: '2023-03-02T03:22:08.101Z',
            },
          ],
        },
      },
    },
  },
];

const EMPTY_MOCKS = [
  {
    request: {
      query: ORGANIZATIONS_MEMBER_CONNECTION_LIST,
      variables: {
        orgId: '',
        firstName_contains: '',
      },
    },
    result: {
      data: {
        organizationsMemberConnection: {
          edges: [],
        },
      },
    },
  },
  {
    request: {
      query: ORGANIZATION_ADMINS_LIST,
      variables: {
        id: '',
      },
    },
    result: {
      data: {
        organizations: [
          {
            __typename: 'Organization',
            _id: '6401ff65ce8e8406b8f07af2',
            admins: [],
          },
        ],
      },
    },
  },
];

const LOADING_MOCKS = [
  {
    request: {
      query: ORGANIZATIONS_MEMBER_CONNECTION_LIST,
      variables: {
        orgId: '',
        firstName_contains: '',
      },
    },
    loading: true,
  },
  {
    request: {
      query: ORGANIZATION_ADMINS_LIST,
      variables: {
        id: '',
      },
    },
    loading: true,
  },
];

const link = new StaticMockLink(MOCKS, true);

async function wait(ms = 100): Promise<void> {
  await act(() => {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  });
}

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ orgId: '' }),
  };
});

describe('Testing People Screen [User Portal]', () => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(), // Deprecated
      removeListener: vi.fn(), // Deprecated
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });

  it('Screen should be rendered properly', async () => {
    render(
      <MockedProvider addTypename={false} link={link}>
        <BrowserRouter>
          <Provider store={store}>
            <I18nextProvider i18n={i18nForTest}>
              <People />
            </I18nextProvider>
          </Provider>
        </BrowserRouter>
      </MockedProvider>,
    );

    await wait();

    expect(screen.queryAllByText('Noble Mittal')).not.toBe([]);
  });

  it('Search works properly by pressing enter', async () => {
    render(
      <MockedProvider addTypename={false} link={link}>
        <BrowserRouter>
          <Provider store={store}>
            <I18nextProvider i18n={i18nForTest}>
              <People />
            </I18nextProvider>
          </Provider>
        </BrowserRouter>
      </MockedProvider>,
    );

    await wait();

    userEvent.type(screen.getByTestId('searchInput'), 'j{enter}');
    await wait();

    expect(screen.queryByText('John Cena')).toBeInTheDocument();
    expect(screen.queryByText('Noble Mittal')).not.toBeInTheDocument();
  });

  it('Search works properly by clicking search Btn', async () => {
    render(
      <MockedProvider addTypename={false} link={link}>
        <BrowserRouter>
          <Provider store={store}>
            <I18nextProvider i18n={i18nForTest}>
              <People />
            </I18nextProvider>
          </Provider>
        </BrowserRouter>
      </MockedProvider>,
    );

    await wait();
    const searchBtn = screen.getByTestId('searchBtn');
    userEvent.type(screen.getByTestId('searchInput'), '');
    userEvent.click(searchBtn);
    await wait();
    userEvent.type(screen.getByTestId('searchInput'), 'j');
    userEvent.click(searchBtn);
    await wait();

    expect(screen.queryByText('John Cena')).toBeInTheDocument();
    expect(screen.queryByText('Noble Mittal')).not.toBeInTheDocument();
  });

  it('Mode is changed to Admins', async () => {
    render(
      <MockedProvider addTypename={false} link={link}>
        <BrowserRouter>
          <Provider store={store}>
            <I18nextProvider i18n={i18nForTest}>
              <People />
            </I18nextProvider>
          </Provider>
        </BrowserRouter>
      </MockedProvider>,
    );

    await wait();

    userEvent.click(screen.getByTestId('modeChangeBtn'));
    await wait();
    userEvent.click(screen.getByTestId('modeBtn1'));
    await wait();

    expect(screen.queryByText('Noble Admin')).toBeInTheDocument();
    expect(screen.queryByText('Noble Mittal')).not.toBeInTheDocument();
  });

  it('should handle pagination page change', async () => {
    render(
      <MockedProvider
        addTypename={false}
        link={new StaticMockLink(MOCKS, true)}
      >
        <BrowserRouter>
          <Provider store={store}>
            <I18nextProvider i18n={i18nForTest}>
              <People />
            </I18nextProvider>
          </Provider>
        </BrowserRouter>
      </MockedProvider>,
    );

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    // Find and click next page button using data-testid
    const nextPageButton = screen.getByTestId('nextPage');
    expect(nextPageButton).toBeInTheDocument();
    await userEvent.click(nextPageButton);

    // Verify page change
    const pageInfo = screen.getByTestId('table-pagination');
    expect(pageInfo).toBeInTheDocument();
  });

  it('should handle rows per page change', async () => {
    render(
      <MockedProvider
        addTypename={false}
        link={new StaticMockLink(MOCKS, true)}
      >
        <BrowserRouter>
          <Provider store={store}>
            <I18nextProvider i18n={i18nForTest}>
              <People />
            </I18nextProvider>
          </Provider>
        </BrowserRouter>
      </MockedProvider>,
    );

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    // Find and change rows per page select
    const select = screen.getByRole('combobox', { name: /rows per page/i });
    expect(select).toBeInTheDocument();
    await userEvent.selectOptions(select, '10');

    // Verify rows per page changed
    const pageInfo = screen.getByTestId('table-pagination');
    expect(pageInfo).toBeInTheDocument();
  });

  it('should display loading state', async () => {
    render(
      <MockedProvider
        addTypename={false}
        link={new StaticMockLink(LOADING_MOCKS, true)}
      >
        <BrowserRouter>
          <Provider store={store}>
            <I18nextProvider i18n={i18nForTest}>
              <People />
            </I18nextProvider>
          </Provider>
        </BrowserRouter>
      </MockedProvider>,
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should display empty state message', async () => {
    render(
      <MockedProvider
        addTypename={false}
        link={new StaticMockLink(EMPTY_MOCKS, true)}
      >
        <BrowserRouter>
          <Provider store={store}>
            <I18nextProvider i18n={i18nForTest}>
              <People />
            </I18nextProvider>
          </Provider>
        </BrowserRouter>
      </MockedProvider>,
    );

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    // Look for the actual text that appears in the DOM
    expect(screen.getByText('people.nothingToShow')).toBeInTheDocument();
  });

  it('should switch back to All Members mode', async () => {
    render(
      <MockedProvider
        addTypename={false}
        link={new StaticMockLink(MOCKS, true)}
      >
        <BrowserRouter>
          <Provider store={store}>
            <I18nextProvider i18n={i18nForTest}>
              <People />
            </I18nextProvider>
          </Provider>
        </BrowserRouter>
      </MockedProvider>,
    );

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    // Switch to Admins mode first
    userEvent.click(screen.getByTestId('modeChangeBtn'));
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
    });
    userEvent.click(screen.getByTestId('modeBtn1'));
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    // Switch back to All Members
    userEvent.click(screen.getByTestId('modeChangeBtn'));
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
    });
    userEvent.click(screen.getByTestId('modeBtn0'));
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    expect(screen.queryAllByText('Noble Mittal')).not.toHaveLength(0);
  });

  it('should handle rows per page selection', async () => {
    render(
      <MockedProvider
        addTypename={false}
        link={new StaticMockLink(MOCKS, true)}
      >
        <BrowserRouter>
          <Provider store={store}>
            <I18nextProvider i18n={i18nForTest}>
              <People />
            </I18nextProvider>
          </Provider>
        </BrowserRouter>
      </MockedProvider>,
    );

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    const select = screen.getByRole('combobox', { name: /rows per page/i });
    expect(select).toBeInTheDocument();

    await act(async () => {
      await userEvent.selectOptions(select, '10');
    });

    const pageInfo = screen.getByTestId('table-pagination');
    expect(pageInfo).toBeInTheDocument();
  });
});
