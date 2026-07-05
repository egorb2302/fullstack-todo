import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from '@testing-library/react';
import Unauthorized from '../../components/Unauthorized';
import { BrowserRouter } from "react-router";
import Modal from "../../components/TaskModal";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from "react";
import Layout from "../../components/Layout";
import * as api from '../../api/api';
import NoTasks from "../../components/HaveNoTasks";
import userEvent from '@testing-library/user-event';
import Check from "../../components/Check";

vi.mock('../../api/api', () => ({
    getAllTodos: vi.fn(),
    deleteTodo: vi.fn(),
    patchTodo: vi.fn(),
    getCurrentUser: vi.fn()
}));

describe('Components tests', () => {
    let queryClient: QueryClient;

    beforeEach(() => {
        queryClient = new QueryClient({
            defaultOptions: { queries: { retry: false } },
        });
        vi.clearAllMocks();
    });

    const renderComponent = (el: ReactNode) => {
        return render(
            <QueryClientProvider client={queryClient}>
                <BrowserRouter>
                    {el}
                </BrowserRouter>
            </QueryClientProvider>
        )
    }

    describe("Unauthorized component", () => {
        it('should render unauthorized page', () => {
            renderComponent(<Unauthorized />)
            
            expect(screen.getByText("Oops! You're unauthorized yet.")).toBeInTheDocument()
        })

        it('should open the login page on click', async () => {
            renderComponent(<Unauthorized />)
            const loginLink = screen.getByRole('link', { name: /login/i });
            await userEvent.click(loginLink)

            expect(loginLink).toHaveAttribute('href', '/auth/login');
        })

        it('should open the signup page on click', async () => {
            renderComponent(<Unauthorized />)
            const RegisterLink = screen.getByRole('link', { name: /register/i });
            await userEvent.click(RegisterLink)

            expect(RegisterLink).toHaveAttribute('href', '/auth/register');
        })
    })

    describe("Modal component", () => {
        it('should render modal window', () => {
            renderComponent(<Modal onAccepted={vi.fn()} onClose={vi.fn()}/>)

            expect(screen.getByText("New task")).toBeInTheDocument()
        })
    })

    describe("Layout component", () => {
        it('should render website layout', async () => {
            vi.mocked(api.getCurrentUser).mockResolvedValue({name: 'John', email: 'asdasd', id: 1});
            renderComponent(<Layout />)

            await waitFor(() => {
                expect(screen.getByText("Todo App")).toBeInTheDocument()
            })
            await waitFor(() => {
                expect(screen.getByText("John")).toBeInTheDocument()
            })
        })

        it('should show loading state', () => {
            vi.mocked(api.getCurrentUser).mockImplementation(() => new Promise(() => {}));

            renderComponent(<Layout />);
            expect(screen.getByText("Loading...")).toBeInTheDocument();
        });

        it('should show unauthorized when user is not authenticated', async () => {
            vi.mocked(api.getCurrentUser).mockResolvedValue(null)
            renderComponent(<Layout />)

            await waitFor(() => {
                expect(screen.getByText("Oops! You're unauthorized yet.")).toBeInTheDocument()
            })
        })
    })

    describe("HaveNoTasks component", () => {
        it('should render notask-plug', () => {
            renderComponent(<NoTasks />)

            expect(screen.getByText("You have no tasks yet!")).toBeInTheDocument()
        })

        it('should open the modal on click', async () => {
            renderComponent(<NoTasks />)
            await userEvent.click(screen.getByText("+ add task"))

            expect(screen.getByText("New task")).toBeInTheDocument()
        })
    })

    describe("Check-wrapper component", () => {
        const data = ['data', 'data', 'data']
        const err: Error = new Error('Something went wrong');

        it('should return loading state if it loading', () => {
            renderComponent(
                <Check isLoading={true} error={null} data={data}>
                    {(data) => <p>{data}</p>}
                </Check>
            )

            expect(screen.getByText("Loading...")).toBeInTheDocument()
        })

        it('should return data if all states loaded and have no errors', () => {
            renderComponent(
                <Check isLoading={false} error={null} data={data}>
                    {
                        (data) => (
                            <div>
                                {data.map((d, i) => (
                                    <p key={i}>{d}</p>
                                ))}
                            </div>
                        )
                    }
                </Check>
            )

            expect(screen.getAllByText('data').length).toBeGreaterThan(0)
        })

        it('should return an error if it exists', () => {
            renderComponent(
                <Check isLoading={false} error={err} data={data}>
                    {(data) => <p>{data}</p>}
                </Check>
            )

            expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument()
        })
    })
})